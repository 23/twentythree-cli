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
  tokenFieldName?: string     // FormData field name for the token (default: 'upload_token')
  bearerToken?: string        // workspace bearer token — sent as Authorization header on each chunk POST
  chunkSize?: number          // default: DEFAULT_CHUNK_SIZE (100MB)
  concurrency?: number        // default: DEFAULT_CONCURRENCY (5)
  maxRetries?: number         // default: DEFAULT_MAX_RETRIES (5)
  onProgress?: (bytesUploaded: number, totalBytes: number) => void
  extraFields?: Record<string, string>  // Additional form fields appended to every chunk's FormData
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

export const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024  // 5MB
export const DEFAULT_CONCURRENCY = 5
export const DEFAULT_MAX_RETRIES = 5
