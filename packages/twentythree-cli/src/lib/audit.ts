/**
 * ExcludedOperation — a spec endpoint intentionally not implemented as a CLI command.
 * Used by scripts/audit-endpoints.mjs to allow the audit to exit 0 without a covering command.
 *
 * Fields:
 *   endpoint  — exact spec path with HTTP method prefix, e.g. 'GET /photo/get-upload-token'
 *   reason    — human-readable rationale for the exclusion
 *   category  — machine-groupable label for the type of exclusion
 */
export interface ExcludedOperation {
  endpoint: string
  reason: string
  category: 'admin-only' | 'internal' | 'deprecated' | 'super-admin' | 'non-standard'
}

/**
 * EXCLUDED_OPERATIONS — the authoritative list of spec endpoints that are intentionally
 * not implemented as CLI commands. Any spec endpoint not covered by a command file AND
 * not present in this list will be reported as a gap by scripts/audit-endpoints.mjs.
 *
 * Add entries here when an endpoint is confirmed to have no CLI use case, with a clear
 * reason and appropriate category.
 */
export const EXCLUDED_OPERATIONS: ExcludedOperation[] = [
  {
    endpoint: 'GET /photo/get-upload-token',
    reason: 'Server-to-server token delegation for external upload flows; no CLI use case',
    category: 'internal',
  },
  {
    endpoint: 'GET /photo/get-replace-token',
    reason: 'Server-to-server token delegation for external replace flows; no CLI use case',
    category: 'internal',
  },
  {
    endpoint: 'GET /photo/get-update-token',
    reason: 'Server-to-server token delegation for external update flows; no CLI use case',
    category: 'internal',
  },
  {
    endpoint: 'POST /photo/delete-upload-token',
    reason: 'Counterpart to get-upload-token; server-to-server only',
    category: 'internal',
  },
  {
    endpoint: 'POST /photo/update-upload-token',
    reason: 'Update video metadata via upload token; server-to-server only',
    category: 'internal',
  },
  {
    endpoint: 'POST /photo/subtitle/archive/get-progress',
    reason: 'Covered by video subtitle archive --progress flag (dual-endpoint command)',
    category: 'non-standard',
  },
  {
    endpoint: 'POST /live/recording/split',
    reason: 'Endpoint not in OpenAPI spec; command references undocumented API',
    category: 'non-standard',
  },
  {
    endpoint: 'GET /user/tokens',
    reason: 'Not in OpenAPI spec; internal token management endpoint',
    category: 'internal',
  },
]
