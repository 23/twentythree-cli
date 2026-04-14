/**
 * Concurrent chunk upload pool with retry and exponential backoff.
 *
 * This module processes chunks in concurrency windows. Each chunk is retried up
 * to maxRetries times on transient failures (non-200, non-500). A 500 response
 * aborts the entire pool immediately ("Unsupported file format"). A Set tracks
 * completed chunks within the invocation so already-accepted chunks are skipped.
 *
 * No CLI dependencies (chalk, ora, cli-progress) — display-agnostic.
 */

import type { ChunkDescriptor } from './types.js'

export interface ChunkUploadResponse {
  status: number
  data?: { photo_id?: number; tree_id?: number; token?: string }
}

export interface ChunkPoolParams {
  chunks: ChunkDescriptor[]
  uploadFn: (chunk: ChunkDescriptor) => Promise<ChunkUploadResponse>
  concurrency: number
  maxRetries: number
  onChunkComplete?: (chunk: ChunkDescriptor, response: ChunkUploadResponse) => void
  /** Injected delay function — defaults to a setTimeout promise; injectable for testing */
  delayFn?: (ms: number) => Promise<void>
  /** Pre-completed chunk numbers (in-memory resume within same invocation) */
  completed?: Set<number>
}

export interface ChunkPoolResult {
  completedChunks: number
  finalResponse?: ChunkUploadResponse['data']
}

/**
 * Default exponential backoff delay: min(1000 * 2^attempt, 30000) ms
 */
function defaultDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Upload chunks concurrently in windows of `concurrency` size.
 * Retries each failed chunk up to maxRetries times with exponential backoff.
 * Aborts immediately on 500. Skips already-completed chunks.
 */
export async function uploadChunkPool(params: ChunkPoolParams): Promise<ChunkPoolResult> {
  const {
    chunks,
    uploadFn,
    concurrency,
    maxRetries,
    onChunkComplete,
    delayFn = defaultDelay,
    completed = new Set<number>(),
  } = params

  let finalResponse: ChunkUploadResponse['data'] | undefined

  /**
   * Upload a single chunk with retry and exponential backoff.
   */
  async function uploadWithRetry(chunk: ChunkDescriptor): Promise<void> {
    // Skip already-completed chunks (in-memory resume within same invocation)
    if (completed.has(chunk.number)) {
      return
    }

    let attempt = 0

    while (true) {
      const response = await uploadFn(chunk)

      if (response.status === 200) {
        completed.add(chunk.number)
        finalResponse = response.data
        onChunkComplete?.(chunk, response)
        return
      }

      if (response.status === 500) {
        throw new Error('Unsupported file format — upload aborted')
      }

      // Transient failure — retry with exponential backoff
      if (attempt >= maxRetries) {
        throw new Error(`Chunk ${chunk.number} failed after ${maxRetries} retries`)
      }

      const backoffMs = Math.min(1000 * Math.pow(2, attempt), 30000)
      await delayFn(backoffMs)
      attempt++
    }
  }

  // Process chunks in windows of concurrency
  for (let i = 0; i < chunks.length; i += concurrency) {
    const window = chunks.slice(i, i + concurrency)
    await Promise.all(window.map((chunk) => uploadWithRetry(chunk)))
  }

  return {
    completedChunks: completed.size,
    finalResponse,
  }
}
