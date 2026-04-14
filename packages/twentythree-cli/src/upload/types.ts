/**
 * Upload engine type contracts for the chunked upload implementation (Plan 02).
 *
 * These interfaces define the contract for the resumable.js-compatible
 * chunked upload protocol used by the TwentyThree API.
 */

export interface ChunkedUploadParams {
  filePath: string
  uploadToken: string
  uploadUrl: string           // full URL to POST chunks to
  chunkSize?: number          // default: DEFAULT_CHUNK_SIZE (100MB)
  concurrency?: number        // default: DEFAULT_CONCURRENCY (5)
  maxRetries?: number         // default: DEFAULT_MAX_RETRIES (5)
  onProgress?: (bytesUploaded: number, totalBytes: number) => void
}

export interface ChunkedUploadResult {
  photo_id?: number
  tree_id?: number
  token?: string
}

export interface ChunkDescriptor {
  number: number              // 1-indexed (resumable.js convention)
  start: number               // byte offset
  end: number                 // byte offset (exclusive)
  size: number                // chunk size in bytes
}

export const DEFAULT_CHUNK_SIZE = 100 * 1024 * 1024  // 100MB
export const DEFAULT_CONCURRENCY = 5
export const DEFAULT_MAX_RETRIES = 5
