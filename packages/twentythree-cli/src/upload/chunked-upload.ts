/**
 * Chunked upload engine — splits a file into chunks and uploads them via the
 * TwentyThree resumable.js protocol.
 *
 * This module is display-agnostic: it reports progress via an onProgress
 * callback and has zero imports of chalk, ora, or cli-progress.
 *
 * Threat mitigations implemented here:
 *   T-03-02: uploadUrl must use https:// (validated before first request)
 *   T-03-03: upload_token is never logged; onProgress reports byte counts only
 */

import { stat } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import * as path from 'node:path'
import {
  ChunkedUploadParams,
  ChunkedUploadResult,
  ChunkDescriptor,
  DEFAULT_CHUNK_SIZE,
  DEFAULT_CONCURRENCY,
  DEFAULT_MAX_RETRIES,
} from './types.js'
import { uploadChunkPool, type ChunkUploadResponse } from './chunk-pool.js'

/**
 * Read a file slice into a Buffer by collecting stream chunks.
 */
async function readSlice(filePath: string, start: number, end: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const stream = createReadStream(filePath, { start, end: end - 1 })
    stream.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)
  })
}

/**
 * Main chunked upload function. Splits the file into chunks and uploads them
 * concurrently via uploadChunkPool with retry and progress tracking.
 *
 * @throws Error if file is not found
 * @throws Error if uploadUrl is not https://
 */
export async function uploadChunked(params: ChunkedUploadParams): Promise<ChunkedUploadResult> {
  const {
    filePath,
    uploadToken,
    uploadUrl,
    tokenFieldName = 'upload_token',
    bearerToken,
    chunkSize = DEFAULT_CHUNK_SIZE,
    concurrency = DEFAULT_CONCURRENCY,
    maxRetries = DEFAULT_MAX_RETRIES,
    onProgress,
    extraFields,
  } = params

  // T-03-02: Validate HTTPS-only upload URL
  if (!uploadUrl.startsWith('https://')) {
    throw new Error(`uploadUrl must use https:// — insecure upload URLs are not allowed: ${uploadUrl}`)
  }

  // Validate file exists and get size
  let totalSize: number
  try {
    const fileStat = await stat(filePath)
    totalSize = fileStat.size
  } catch (err: any) {
    if (err?.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`)
    }
    throw err
  }

  // Compute chunk descriptors (1-indexed, resumable.js convention)
  // Uses Math.floor so the last chunk absorbs the remainder and is always >= chunkSize.
  // This matches the TwentyThree resumable.js server expectation (see resumable.js issue #51).
  const totalChunks = Math.max(1, Math.floor(totalSize / chunkSize))
  const chunks: ChunkDescriptor[] = Array.from({ length: totalChunks }, (_, i) => {
    const start = i * chunkSize
    const end = i < totalChunks - 1 ? start + chunkSize : totalSize
    return {
      number: i + 1,
      start,
      end,
      size: end - start,
    }
  })

  // resumableIdentifier is the basename — matches the TwentyThree reference implementation
  const filename = path.basename(filePath)
  const resumableIdentifier = filename

  // Track cumulative bytes uploaded (T-03-03: only byte counts, never tokens)
  let bytesUploaded = 0

  /**
   * Upload function for a single chunk — builds FormData and POSTs via native fetch.
   * Returns { status, data } for the pool to handle retry/abort logic.
   */
  async function uploadFn(chunk: ChunkDescriptor): Promise<ChunkUploadResponse> {
    try {
      const sliceBuffer = await readSlice(filePath, chunk.start, chunk.end)
      const blob = new Blob([sliceBuffer])

      const formData = new FormData()
      formData.append(tokenFieldName, uploadToken)
      formData.append('file', blob, filename)
      formData.append('resumableChunkNumber', String(chunk.number))
      formData.append('resumableChunkSize', String(chunkSize))
      formData.append('resumableTotalSize', String(totalSize))
      formData.append('resumableIdentifier', resumableIdentifier)
      formData.append('resumableFilename', filename)
      formData.append('resumableTotalChunks', String(totalChunks))

      // Append any extra fields (e.g. 'type' for webinar upload-image)
      if (extraFields) {
        for (const [key, value] of Object.entries(extraFields)) {
          formData.append(key, value)
        }
      }

      const headers: HeadersInit = {}
      if (bearerToken) {
        headers['Authorization'] = `Bearer ${bearerToken}`
      }

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers,
        body: formData,
      })

      let data: ChunkUploadResponse['data'] | undefined
      try {
        const buf = await response.arrayBuffer()
        const text = Buffer.from(buf).toString('utf-8')
        try { data = JSON.parse(text) } catch { data = text || undefined }
      } catch {
        data = undefined
      }

      return { status: response.status, data }
    } catch (err) {
      // Network error — return status 0 to trigger retry in the pool
      return { status: 0 }
    }
  }

  /**
   * Callback fired after each chunk completes successfully.
   * Accumulates bytesUploaded and fires onProgress.
   */
  function onChunkComplete(chunk: ChunkDescriptor): void {
    bytesUploaded += chunk.size
    onProgress?.(bytesUploaded, totalSize)
  }

  const poolResult = await uploadChunkPool({
    chunks,
    uploadFn,
    concurrency,
    maxRetries,
    onChunkComplete: (chunk) => onChunkComplete(chunk),
  })

  // The server may return the photo_id as a plain number on the final chunk
  const raw = poolResult.finalResponse
  if (typeof raw === 'number') {
    return { photo_id: raw }
  }
  return (raw ?? {}) as ChunkedUploadResult
}
