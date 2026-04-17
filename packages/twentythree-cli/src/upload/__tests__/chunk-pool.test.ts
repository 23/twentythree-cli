import { describe, it, expect, vi } from 'vitest'
import { uploadChunkPool } from '../chunk-pool.js'
import type { ChunkDescriptor } from '../types.js'

function makeChunks(count: number): ChunkDescriptor[] {
  return Array.from({ length: count }, (_, i) => ({
    number: i + 1,
    start: i * 1000,
    end: (i + 1) * 1000,
    size: 1000,
  }))
}

describe('uploadChunkPool', () => {
  it('completes all chunks when uploadFn returns 200', async () => {
    const chunks = makeChunks(3)
    const uploadFn = vi.fn().mockResolvedValue({ status: 200, data: { photo_id: 42 } })

    const result = await uploadChunkPool({
      chunks,
      uploadFn,
      concurrency: 3,
      maxRetries: 5,
    })

    expect(uploadFn).toHaveBeenCalledTimes(3)
    expect(result.completedChunks).toBe(3)
  })

  it('returns finalResponse from last successful chunk', async () => {
    const chunks = makeChunks(2)
    const uploadFn = vi.fn()
      .mockResolvedValueOnce({ status: 200, data: {} })
      .mockResolvedValueOnce({ status: 200, data: { photo_id: 99, tree_id: 7, token: 'abc' } })

    const result = await uploadChunkPool({
      chunks,
      uploadFn,
      concurrency: 2,
      maxRetries: 5,
    })

    expect(result.finalResponse).toEqual({ photo_id: 99, tree_id: 7, token: 'abc' })
  })

  it('throws on 500 response', async () => {
    const chunks = makeChunks(2)
    const uploadFn = vi.fn().mockResolvedValue({ status: 500 })

    await expect(
      uploadChunkPool({ chunks, uploadFn, concurrency: 2, maxRetries: 5 })
    ).rejects.toThrow('Upload rejected by server (500)')
  })

  it('retries on non-200/non-500 and succeeds after 2 failures', async () => {
    const chunks = makeChunks(1)
    const uploadFn = vi.fn()
      .mockResolvedValueOnce({ status: 502 })
      .mockResolvedValueOnce({ status: 502 })
      .mockResolvedValueOnce({ status: 200, data: { photo_id: 1 } })
    const delayFn = vi.fn().mockResolvedValue(undefined)

    const result = await uploadChunkPool({
      chunks,
      uploadFn,
      concurrency: 1,
      maxRetries: 5,
      delayFn,
    })

    expect(uploadFn).toHaveBeenCalledTimes(3)
    expect(result.completedChunks).toBe(1)
  })

  it('throws "failed after N retries" when all retries exhausted', async () => {
    const chunks = makeChunks(1)
    const uploadFn = vi.fn().mockResolvedValue({ status: 502 })
    const delayFn = vi.fn().mockResolvedValue(undefined)

    await expect(
      uploadChunkPool({ chunks, uploadFn, concurrency: 1, maxRetries: 5, delayFn })
    ).rejects.toThrow('Chunk 1 failed after 5 retries')

    // Should have been called initial + 5 retries = 6 total
    expect(uploadFn).toHaveBeenCalledTimes(6)
  })

  it('processes chunks in windows of concurrency size', async () => {
    const chunks = makeChunks(4)
    const callOrder: number[] = []
    const uploadFn = vi.fn().mockImplementation(async (chunk: ChunkDescriptor) => {
      callOrder.push(chunk.number)
      return { status: 200, data: {} }
    })

    await uploadChunkPool({
      chunks,
      uploadFn,
      concurrency: 2,
      maxRetries: 5,
    })

    // All 4 chunks should be processed
    expect(uploadFn).toHaveBeenCalledTimes(4)
    // Window 1: chunks 1,2 — Window 2: chunks 3,4
    expect(callOrder.slice(0, 2).sort()).toEqual([1, 2])
    expect(callOrder.slice(2, 4).sort()).toEqual([3, 4])
  })

  it('fires onChunkComplete for each successful chunk', async () => {
    const chunks = makeChunks(3)
    const uploadFn = vi.fn().mockResolvedValue({ status: 200, data: { photo_id: 5 } })
    const onChunkComplete = vi.fn()

    await uploadChunkPool({
      chunks,
      uploadFn,
      concurrency: 3,
      maxRetries: 5,
      onChunkComplete,
    })

    expect(onChunkComplete).toHaveBeenCalledTimes(3)
    expect(onChunkComplete).toHaveBeenCalledWith(chunks[0], { status: 200, data: { photo_id: 5 } })
    expect(onChunkComplete).toHaveBeenCalledWith(chunks[1], { status: 200, data: { photo_id: 5 } })
    expect(onChunkComplete).toHaveBeenCalledWith(chunks[2], { status: 200, data: { photo_id: 5 } })
  })

  it('skips chunks that are already in the completed Set', async () => {
    const chunks = makeChunks(3)
    const completed = new Set([2]) // chunk 2 already done
    const uploadFn = vi.fn().mockResolvedValue({ status: 200, data: {} })

    await uploadChunkPool({
      chunks,
      uploadFn,
      concurrency: 3,
      maxRetries: 5,
      completed,
    })

    // Only chunks 1 and 3 should be uploaded
    expect(uploadFn).toHaveBeenCalledTimes(2)
    const calledChunkNumbers = uploadFn.mock.calls.map((c) => (c[0] as ChunkDescriptor).number)
    expect(calledChunkNumbers).not.toContain(2)
  })

  it('applies exponential backoff between retries', async () => {
    const chunks = makeChunks(1)
    const delays: number[] = []
    const uploadFn = vi.fn()
      .mockResolvedValueOnce({ status: 502 })
      .mockResolvedValueOnce({ status: 200, data: {} })

    const delayFn = vi.fn().mockImplementation((ms: number) => {
      delays.push(ms)
      return Promise.resolve()
    })

    await uploadChunkPool({
      chunks,
      uploadFn,
      concurrency: 1,
      maxRetries: 5,
      delayFn,
    })

    // First retry delay = min(1000 * 2^0, 30000) = 1000ms
    expect(delays).toHaveLength(1)
    expect(delays[0]).toBe(1000)
  })

  it('caps backoff delay at 30000ms', async () => {
    const chunks = makeChunks(1)
    const delays: number[] = []
    const uploadFn = vi.fn()
      .mockResolvedValueOnce({ status: 502 })
      .mockResolvedValueOnce({ status: 502 })
      .mockResolvedValueOnce({ status: 502 })
      .mockResolvedValueOnce({ status: 502 })
      .mockResolvedValueOnce({ status: 502 })
      .mockResolvedValueOnce({ status: 200, data: {} })

    const delayFn = vi.fn().mockImplementation((ms: number) => {
      delays.push(ms)
      return Promise.resolve()
    })

    await uploadChunkPool({
      chunks,
      uploadFn,
      concurrency: 1,
      maxRetries: 5,
      delayFn,
    })

    // Delays: 1000, 2000, 4000, 8000, 16000 (capped at 30000)
    expect(delays).toEqual([1000, 2000, 4000, 8000, 16000])
  })
})
