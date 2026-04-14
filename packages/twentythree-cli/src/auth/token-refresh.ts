import * as lockfile from 'proper-lockfile'
import { getCredential } from './credential-store.js'
import {
  getWorkspaces,
  setWorkspaces,
  getWorkspaceForDomain,
  getConfigPath,
  type WorkspaceEntry,
} from './workspace-config.js'

export const REFRESH_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Fetch workspace tokens from /api/2/user/tokens?cross_sites_p=1.
 * Uses the login token (from keychain) as the Authorization header.
 * Returns an array of WorkspaceEntry objects parsed from the API response.
 *
 * Response shape (confirmed from live API — see 02-RESEARCH.md Pattern 6):
 *   { status: 'ok', sites: WorkspaceEntry[] }
 * Field names in response match WorkspaceEntry exactly — no mapping needed.
 */
export async function fetchWorkspaceTokens(
  domain: string,
  loginToken: string,
): Promise<WorkspaceEntry[]> {
  const url = `https://${domain}/api/2/user/tokens?cross_sites_p=1`
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${loginToken}` },
  })
  if (!response.ok) {
    throw new Error(
      `Failed to fetch workspace tokens: ${response.status} ${response.statusText}`,
    )
  }
  const json = await response.json() as { status: string; sites?: WorkspaceEntry[] }
  // Response is { status: 'ok', sites: [...] } — confirmed from live API
  return json.sites ?? []
}

/**
 * Ensure a fresh workspace token for the given domain.
 * Returns the bearer_token string, or null if:
 *   - No workspace is configured for the domain
 *   - The workspace has no bearer_token (domain-only / anonymous mode)
 *   - No login token exists in the OS keychain
 *
 * If the token is near expiry (within REFRESH_THRESHOLD_MS), acquires a
 * file lock on the conf config file and refreshes by re-calling
 * /api/2/user/tokens. Re-checks token freshness after lock acquisition
 * to prevent redundant refreshes from concurrent processes.
 *
 * Security: Login token transmitted only over HTTPS (hardcoded https:// in
 * fetchWorkspaceTokens). Token values never appear in error messages — only
 * HTTP status codes. Lock released in finally block to prevent stale locks.
 */
export async function ensureFreshToken(domain: string): Promise<string | null> {
  const workspace = getWorkspaceForDomain(domain)
  if (!workspace?.bearer_token) return null

  const now = Date.now()
  if (new Date(workspace.expiration_time).getTime() - now > REFRESH_THRESHOLD_MS) {
    return workspace.bearer_token // still valid — no refresh needed
  }

  // Token is near expiry — acquire lock before refreshing to prevent race conditions
  const configPath = getConfigPath()
  let release: (() => Promise<void>) | undefined
  try {
    release = await lockfile.lock(configPath, { realpath: false, retries: 3 })

    // Re-check after lock acquisition — another process may have already refreshed
    const rechecked = getWorkspaceForDomain(domain)
    if (
      rechecked &&
      new Date(rechecked.expiration_time).getTime() - Date.now() > REFRESH_THRESHOLD_MS
    ) {
      return rechecked.bearer_token
    }

    // Fetch fresh tokens using the long-lived login token from the OS keychain
    const loginToken = getCredential(domain)
    if (!loginToken) return null

    const freshTokens = await fetchWorkspaceTokens(domain, loginToken)

    // Merge fresh tokens into the existing workspace list (preserving entries
    // for other domains that weren't returned by this domain's token endpoint)
    const existing = getWorkspaces()
    const updated = existing.map((w) => {
      const fresh = freshTokens.find((f) => f.domain === w.domain)
      return fresh ?? w
    })
    setWorkspaces(updated)

    return freshTokens.find((t) => t.domain === domain)?.bearer_token ?? null
  } finally {
    await release?.()
  }
}
