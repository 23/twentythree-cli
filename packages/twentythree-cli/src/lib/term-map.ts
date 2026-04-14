/**
 * Bidirectional terminology translation between API legacy terms and CLI modern terms.
 *
 * The TwentyThree API uses legacy terms (photo, album, live).
 * The CLI uses modern terms (video, category, webinar).
 * This module translates between them.
 */

// API → CLI (for output display)
const API_TO_CLI: Record<string, string> = {
  photo: 'video',
  album: 'category',
  live: 'webinar',
}

// CLI → API (for constructing API requests)
const CLI_TO_API: Record<string, string> = Object.fromEntries(
  Object.entries(API_TO_CLI).map(([k, v]) => [v, k])
)

/**
 * Convert an API legacy term to the modern CLI term.
 * Unknown terms are returned unchanged.
 */
export function toCliTerm(apiTerm: string): string {
  return API_TO_CLI[apiTerm.toLowerCase()] ?? apiTerm
}

/**
 * Convert a CLI modern term back to the API legacy term.
 * Unknown terms are returned unchanged.
 */
export function toApiTerm(cliTerm: string): string {
  return CLI_TO_API[cliTerm.toLowerCase()] ?? cliTerm
}

/**
 * Apply term mapping to an entire string, replacing all occurrences
 * of API legacy terms with CLI modern terms.
 * Used for mapping error message bodies and API response text.
 */
export function applyCliTerms(text: string): string {
  let result = text
  for (const [apiTerm, cliTerm] of Object.entries(API_TO_CLI)) {
    // Case-insensitive, letter-boundary-safe replacement:
    // - 'gi' flag catches "Photo", "PHOTO", etc.
    // - (?<![a-zA-Z]) / (?![a-zA-Z]) prevent partial letter-word matches
    //   (e.g. "album" inside "albumArt") while still matching "photo_id" → "video_id"
    //   (\b would block underscored identifiers since _ is \w)
    result = result.replace(new RegExp(`(?<![a-zA-Z])${apiTerm}(?![a-zA-Z])`, 'gi'), cliTerm)
  }
  return result
}

// Export the maps for inspection/testing
export const TERM_MAP = { API_TO_CLI, CLI_TO_API }
