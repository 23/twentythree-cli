import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { uploadChunked } from '../chunked-upload.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTempFile(content: Buffer | string, name = 'test-video.mp4'): string {
  const dir = join(tmpdir(), `chunked-upload-test-${Date.now()}`)
  mkdirSync(dir, { recursive: true })
  const filePath = join(dir, name)
  writeFileSync(filePath, content)
  return filePath
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

let cleanupPaths: string[] = []

afterEach(() => {
  cleanupPaths.forEach((p) => {
    try {
      rmSync(p, { recursive: true, force: true })
    } catch {}
  })
  cleanupPaths = []
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('uploadChunked', () => {
  it('throws a clear error when file is not found', async () => {
    await expect(
      uploadChunked({
        filePath: '/nonexistent/path/video.mp4',
        uploadToken: 'tok',
        uploadUrl: 'https://example.com/upload',
      })
    ).rejects.toThrow('File not found')
  })

  it('computes correct chunk count and 1-indexed chunk numbers', async () => {
    // 250 bytes with chunkSize=100 → floor(250/100)=2 chunks (last chunk absorbs remainder)
    const fileContent = Buffer.alloc(250, 0x41) // 250 'A' bytes
    const filePath = makeTempFile(fileContent, 'test.mp4')
    cleanupPaths.push(join(filePath, '..'))

    const uploadedChunks: number[] = []
    let fetchCallCount = 0

    const mockFetch = vi.fn().mockImplementation(async (_url: string, opts: RequestInit) => {
      fetchCallCount++
      const fd = opts.body as FormData
      const chunkNum = Number(fd.get('resumableChunkNumber'))
      uploadedChunks.push(chunkNum)
      const isLast = Number(fd.get('resumableTotalChunks')) === chunkNum
      return {
        status: 200,
        arrayBuffer: async () => Buffer.from(JSON.stringify(isLast ? { photo_id: 1 } : {})),
      }
    })

    vi.stubGlobal('fetch', mockFetch)

    await uploadChunked({
      filePath,
      uploadToken: 'tok',
      uploadUrl: 'https://example.com/upload',
      chunkSize: 100,
    })

    expect(uploadedChunks.sort((a, b) => a - b)).toEqual([1, 2])
  })

  it('sends correct FormData fields matching resumable.js protocol', async () => {
    const fileContent = Buffer.alloc(50, 0x42) // 50 bytes
    const filePath = makeTempFile(fileContent, 'myvideo.mp4')
    cleanupPaths.push(join(filePath, '..'))

    const capturedFields: Record<string, string>[] = []

    const mockFetch = vi.fn().mockImplementation(async (_url: string, opts: RequestInit) => {
      const fd = opts.body as FormData
      capturedFields.push({
        upload_token: String(fd.get('upload_token')),
        resumableChunkNumber: String(fd.get('resumableChunkNumber')),
        resumableChunkSize: String(fd.get('resumableChunkSize')),
        resumableTotalSize: String(fd.get('resumableTotalSize')),
        resumableIdentifier: String(fd.get('resumableIdentifier')),
        resumableFilename: String(fd.get('resumableFilename')),
        resumableTotalChunks: String(fd.get('resumableTotalChunks')),
      })
      return {
        status: 200,
        arrayBuffer: async () => Buffer.from(JSON.stringify({ photo_id: 1 })),
      }
    })

    vi.stubGlobal('fetch', mockFetch)

    await uploadChunked({
      filePath,
      uploadToken: 'mytoken',
      uploadUrl: 'https://example.com/upload',
      chunkSize: 100, // 50 byte file → 1 chunk
    })

    expect(capturedFields).toHaveLength(1)
    const fields = capturedFields[0]

    expect(fields.upload_token).toBe('mytoken')
    expect(fields.resumableChunkNumber).toBe('1')
    expect(fields.resumableChunkSize).toBe('100')
    expect(fields.resumableTotalSize).toBe('50')
    expect(fields.resumableFilename).toBe('myvideo.mp4')
    expect(fields.resumableTotalChunks).toBe('1')
    // resumableIdentifier is the filename (matches TwentyThree reference implementation)
    expect(fields.resumableIdentifier).toBe('myvideo.mp4')
  })

  it('sends the chunk as a Blob file field', async () => {
    const fileContent = Buffer.alloc(50, 0x43)
    const filePath = makeTempFile(fileContent, 'video.mp4')
    cleanupPaths.push(join(filePath, '..'))

    let capturedFile: unknown = null

    const mockFetch = vi.fn().mockImplementation(async (_url: string, opts: RequestInit) => {
      const fd = opts.body as FormData
      capturedFile = fd.get('file')
      return {
        status: 200,
        arrayBuffer: async () => Buffer.from(JSON.stringify({ photo_id: 1 })),
      }
    })

    vi.stubGlobal('fetch', mockFetch)

    await uploadChunked({
      filePath,
      uploadToken: 'tok',
      uploadUrl: 'https://example.com/upload',
      chunkSize: 100,
    })

    expect(capturedFile).toBeInstanceOf(Blob)
  })

  it('uses the uploadUrl as the POST target', async () => {
    const fileContent = Buffer.alloc(30, 0x44)
    const filePath = makeTempFile(fileContent, 'v.mp4')
    cleanupPaths.push(join(filePath, '..'))

    const calledUrls: string[] = []

    const mockFetch = vi.fn().mockImplementation(async (url: string) => {
      calledUrls.push(url)
      return {
        status: 200,
        arrayBuffer: async () => Buffer.from(JSON.stringify({ photo_id: 1 })),
      }
    })

    vi.stubGlobal('fetch', mockFetch)

    await uploadChunked({
      filePath,
      uploadToken: 'tok',
      uploadUrl: 'https://api.example.com/video/upload',
      chunkSize: 100,
    })

    expect(calledUrls[0]).toBe('https://api.example.com/video/upload')
  })

  it('calls onProgress with cumulative bytes after each chunk', async () => {
    // 250 bytes, chunkSize=100 → floor(250/100)=2 chunks (100, 150)
    const fileContent = Buffer.alloc(250, 0x45)
    const filePath = makeTempFile(fileContent, 'progress.mp4')
    cleanupPaths.push(join(filePath, '..'))

    const progressCalls: Array<[number, number]> = []

    const mockFetch = vi.fn().mockImplementation(async (_url: string, opts: RequestInit) => {
      const fd = opts.body as FormData
      const isLast = Number(fd.get('resumableChunkNumber')) === Number(fd.get('resumableTotalChunks'))
      return {
        status: 200,
        arrayBuffer: async () => Buffer.from(JSON.stringify(isLast ? { photo_id: 1 } : {})),
      }
    })

    vi.stubGlobal('fetch', mockFetch)

    await uploadChunked({
      filePath,
      uploadToken: 'tok',
      uploadUrl: 'https://example.com/upload',
      chunkSize: 100,
      concurrency: 1, // serial so progress order is deterministic
      onProgress: (bytesUploaded, totalBytes) => {
        progressCalls.push([bytesUploaded, totalBytes])
      },
    })

    expect(progressCalls).toHaveLength(2)
    expect(progressCalls[0][1]).toBe(250) // totalBytes always 250
    expect(progressCalls[1][0]).toBe(250) // final call = all bytes uploaded
    // Cumulative: each call increases
    expect(progressCalls[0][0]).toBeLessThanOrEqual(progressCalls[1][0])
  })

  it('last chunk absorbs remainder and is >= chunkSize', async () => {
    // 250 bytes, chunkSize=100 → floor(250/100)=2 chunks: [100, 150]
    const fileContent = Buffer.alloc(250, 0x46)
    const filePath = makeTempFile(fileContent, 'sizes.mp4')
    cleanupPaths.push(join(filePath, '..'))

    const chunkSizes: number[] = []

    const mockFetch = vi.fn().mockImplementation(async (_url: string, opts: RequestInit) => {
      const fd = opts.body as FormData
      const file = fd.get('file') as Blob
      chunkSizes.push(file.size)
      const chunkNum = Number(fd.get('resumableChunkNumber'))
      const totalChunks = Number(fd.get('resumableTotalChunks'))
      return {
        status: 200,
        arrayBuffer: async () => Buffer.from(JSON.stringify(chunkNum === totalChunks ? { photo_id: 1 } : {})),
      }
    })

    vi.stubGlobal('fetch', mockFetch)

    await uploadChunked({
      filePath,
      uploadToken: 'tok',
      uploadUrl: 'https://example.com/upload',
      chunkSize: 100,
      concurrency: 1,
    })

    chunkSizes.sort((a, b) => a - b)
    expect(chunkSizes).toEqual([100, 150])
  })

  it('returns ChunkedUploadResult from the final chunk response', async () => {
    const fileContent = Buffer.alloc(50, 0x47)
    const filePath = makeTempFile(fileContent, 'result.mp4')
    cleanupPaths.push(join(filePath, '..'))

    const mockFetch = vi.fn().mockResolvedValue({
      status: 200,
      arrayBuffer: async () => Buffer.from(JSON.stringify({ photo_id: 55, tree_id: 3, token: 'xyz' })),
    })

    vi.stubGlobal('fetch', mockFetch)

    const result = await uploadChunked({
      filePath,
      uploadToken: 'tok',
      uploadUrl: 'https://example.com/upload',
      chunkSize: 100,
    })

    expect(result).toEqual({ photo_id: 55, tree_id: 3, token: 'xyz' })
  })

  it('does not import openapi-fetch, chalk, ora, or cli-progress', async () => {
    // This is a static analysis check — enforced by acceptance criteria in the plan
    // The module file must not contain these import strings
    const { readFileSync } = await import('node:fs')
    const { fileURLToPath } = await import('node:url')
    const { dirname, resolve } = await import('node:path')
    // Read via Node path resolution
    const src = readFileSync(
      resolve(process.cwd(), 'src/upload/chunked-upload.ts'),
      'utf8'
    )
    expect(src).not.toMatch(/from ['"]openapi-fetch/)
    expect(src).not.toMatch(/from ['"]chalk/)
    expect(src).not.toMatch(/from ['"]ora/)
    expect(src).not.toMatch(/from ['"]cli-progress/)
  })

  it('appends extraFields to each chunk FormData', async () => {
    const content = Buffer.alloc(1024, 'x')
    const filePath = makeTempFile(content, 'extra.mp4')
    cleanupPaths.push(join(filePath, '..'))

    const appendedFields: Record<string, string>[] = []

    const mockFetch = vi.fn().mockImplementation(async (_url: string, init: any) => {
      const formData = init.body as FormData
      const fields: Record<string, string> = {}
      const typeVal = formData.get('type')
      if (typeVal) fields['type'] = String(typeVal)
      const customVal = formData.get('custom_field')
      if (customVal) fields['custom_field'] = String(customVal)
      appendedFields.push(fields)
      return {
        status: 200,
        arrayBuffer: async () => Buffer.from(JSON.stringify({ photo_id: 99 })),
      }
    })
    vi.stubGlobal('fetch', mockFetch)

    await uploadChunked({
      filePath,
      uploadToken: 'tok',
      uploadUrl: 'https://example.com/upload',
      chunkSize: 1024,
      extraFields: { type: 'thumbnail', custom_field: 'value' },
    })

    expect(appendedFields.length).toBeGreaterThan(0)
    expect(appendedFields[0]).toEqual({ type: 'thumbnail', custom_field: 'value' })
  })

  it('validates uploadUrl must be https (T-03-02 threat mitigation)', async () => {
    const fileContent = Buffer.alloc(50, 0x48)
    const filePath = makeTempFile(fileContent, 'security.mp4')
    cleanupPaths.push(join(filePath, '..'))

    await expect(
      uploadChunked({
        filePath,
        uploadToken: 'tok',
        uploadUrl: 'http://insecure.example.com/upload', // not https
        chunkSize: 100,
      })
    ).rejects.toThrow('https')
  })
})
