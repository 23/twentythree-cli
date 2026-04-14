import Table from 'cli-table3'
import { applyCliTerms } from './term-map.js'

// Exit code constants (CLI-03)
export const EXIT_SUCCESS = 0
export const EXIT_ERROR = 1
export const EXIT_CANCELLED = 2

// ---- JSON output shape (CLI-01) ----

export interface Breadcrumb {
  domain?: string
  resource?: string
  id?: string
}

export interface JsonOutputParams {
  ok?: boolean
  data: unknown
  summary: string
  breadcrumbs: Breadcrumb[]
}

export interface JsonOutput {
  ok: boolean
  data: unknown
  summary: string
  breadcrumbs: Breadcrumb[]
}

/**
 * Format a CLI-01-compliant JSON output object.
 *
 * When ok=false, applies applyCliTerms() to the summary to prevent leaking
 * internal API field names (e.g. "photo" → "video") to the user (T-03-01 mitigation).
 */
export function formatJsonOutput(params: JsonOutputParams): JsonOutput {
  const ok = params.ok !== false

  const summary = ok ? params.summary : applyCliTerms(params.summary)

  return {
    ok,
    data: params.data,
    summary,
    breadcrumbs: params.breadcrumbs,
  }
}

// ---- Table rendering ----

/**
 * Create a cli-table3 Table instance with the given headers and rows.
 * Headers are styled in cyan.
 */
export function renderTable(headers: string[], rows: string[][]): InstanceType<typeof Table> {
  const table = new Table({
    head: headers,
    style: { head: ['cyan'] },
  })

  for (const row of rows) {
    table.push(row)
  }

  return table
}

// ---- Byte formatting ----

/**
 * Format a byte count as a human-readable string.
 * Examples: "512 B", "45 KB", "300 MB", "1.5 GB"
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'

  const KB = 1024
  const MB = 1024 * KB
  const GB = 1024 * MB

  if (bytes >= GB) {
    const value = bytes / GB
    // Round to at most 1 decimal place; remove trailing .0
    const formatted = Number(value.toFixed(1))
    return `${formatted} GB`
  }

  if (bytes >= MB) {
    const value = bytes / MB
    const formatted = Number(value.toFixed(1))
    return `${formatted} MB`
  }

  if (bytes >= KB) {
    const value = bytes / KB
    const formatted = Number(value.toFixed(1))
    return `${formatted} KB`
  }

  return `${bytes} B`
}

// ---- URL resolution (CLI-07) ----

/**
 * Resolve a potentially relative URL to an absolute URL using the workspace domain.
 *
 * - If url is undefined or empty, return it unchanged.
 * - If url already starts with http:// or https://, return it unchanged.
 * - Otherwise, construct a full URL using new URL(url, baseUrl).
 *
 * The baseUrl is the workspace's api_base_url (e.g. "https://video.company.com/").
 */
export function resolveUrl(url: string | undefined, baseUrl: string): string | undefined {
  if (!url) return url
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return new URL(url, baseUrl).toString()
}
