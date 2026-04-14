import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('../credential-store.js', () => ({
  getCredential: vi.fn(),
}))

vi.mock('../workspace-config.js', () => ({
  getWorkspaces: vi.fn(),
  setWorkspaces: vi.fn(),
  getWorkspaceForDomain: vi.fn(),
  getConfigPath: vi.fn(() => '/fake/config/path/config.json'),
}))

vi.mock('proper-lockfile', () => ({
  lock: vi.fn(),
}))

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import { ensureFreshToken, fetchWorkspaceTokens, REFRESH_THRESHOLD_MS } from '../token-refresh.js'
import { getCredential } from '../credential-store.js'
import {
  getWorkspaces,
  setWorkspaces,
  getWorkspaceForDomain,
  getConfigPath,
  type WorkspaceEntry,
} from '../workspace-config.js'
import * as lockfile from 'proper-lockfile'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeWorkspace(overrides: Partial<WorkspaceEntry> = {}): WorkspaceEntry {
  return {
    domain: 'company.video23.com',
    display_name: 'Company Workspace',
    bearer_token: 'tok_workspace',
    expiration_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour in future
    api_base_url: 'https://company.video23.com/',
    site_name: 'company',
    canonical_user_p: true,
    starred_p: false,
    ...overrides,
  }
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.resetAllMocks()
  // Default: getConfigPath returns a fake path
  vi.mocked(getConfigPath).mockReturnValue('/fake/config/path/config.json')
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ── REFRESH_THRESHOLD_MS ──────────────────────────────────────────────────────

describe('REFRESH_THRESHOLD_MS', () => {
  it('equals 5 minutes in milliseconds', () => {
    expect(REFRESH_THRESHOLD_MS).toBe(5 * 60 * 1000)
  })
})

// ── fetchWorkspaceTokens ──────────────────────────────────────────────────────

describe('fetchWorkspaceTokens', () => {
  it('makes GET to /api/2/user/tokens?cross_sites_p=1 with Authorization header', async () => {
    const mockSites: WorkspaceEntry[] = [makeWorkspace()]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', sites: mockSites }),
    }))

    const result = await fetchWorkspaceTokens('company.video23.com', 'login_tok_123')

    expect(fetch).toHaveBeenCalledWith(
      'https://company.video23.com/api/2/user/tokens?cross_sites_p=1',
      { headers: { Authorization: 'Bearer login_tok_123' } }
    )
    expect(result).toEqual(mockSites)
    vi.unstubAllGlobals()
  })

  it('returns WorkspaceEntry array parsed from response.sites', async () => {
    const site1 = makeWorkspace({ domain: 'site1.video23.com', bearer_token: 'tok_site1' })
    const site2 = makeWorkspace({ domain: 'site2.video23.com', bearer_token: 'tok_site2' })

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', sites: [site1, site2] }),
    }))

    const result = await fetchWorkspaceTokens('site1.video23.com', 'login_tok')
    expect(result).toHaveLength(2)
    expect(result[0].bearer_token).toBe('tok_site1')
    expect(result[1].bearer_token).toBe('tok_site2')
    vi.unstubAllGlobals()
  })

  it('returns empty array when response.sites is missing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok' }),
    }))

    const result = await fetchWorkspaceTokens('company.video23.com', 'login_tok')
    expect(result).toEqual([])
    vi.unstubAllGlobals()
  })

  it('throws when response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    }))

    await expect(fetchWorkspaceTokens('company.video23.com', 'bad_token')).rejects.toThrow(
      'Failed to fetch workspace tokens: 401 Unauthorized'
    )
    vi.unstubAllGlobals()
  })
})

// ── ensureFreshToken ──────────────────────────────────────────────────────────

describe('ensureFreshToken', () => {
  it('returns current bearer_token when expiration is far in the future (no refresh)', async () => {
    const workspace = makeWorkspace({
      // Expires 1 hour from now — well above threshold
      expiration_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    })
    vi.mocked(getWorkspaceForDomain).mockReturnValue(workspace)

    const result = await ensureFreshToken('company.video23.com')

    expect(result).toBe('tok_workspace')
    // Lock should NOT have been acquired (no refresh needed)
    expect(lockfile.lock).not.toHaveBeenCalled()
  })

  it('returns null when workspace has no bearer_token (domain-only mode)', async () => {
    const workspace = makeWorkspace({ bearer_token: '' })
    vi.mocked(getWorkspaceForDomain).mockReturnValue(workspace)

    const result = await ensureFreshToken('company.video23.com')

    expect(result).toBeNull()
    expect(lockfile.lock).not.toHaveBeenCalled()
  })

  it('returns null when getWorkspaceForDomain returns null (no workspace configured)', async () => {
    vi.mocked(getWorkspaceForDomain).mockReturnValue(null)

    const result = await ensureFreshToken('unknown.video23.com')

    expect(result).toBeNull()
    expect(lockfile.lock).not.toHaveBeenCalled()
  })

  it('triggers refresh when token is within REFRESH_THRESHOLD_MS', async () => {
    const expiringSoon = makeWorkspace({
      // Expires in 2 minutes — within 5-minute threshold
      expiration_time: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
    })
    const freshWorkspace = makeWorkspace({
      bearer_token: 'tok_refreshed',
      expiration_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    })

    // First call (pre-lock check): returns expiring workspace
    // Second call (post-lock re-check): also expiring (another process did NOT refresh)
    vi.mocked(getWorkspaceForDomain).mockReturnValue(expiringSoon)
    vi.mocked(getWorkspaces).mockReturnValue([expiringSoon])
    vi.mocked(getCredential).mockReturnValue('login_tok_123')

    const mockRelease = vi.fn().mockResolvedValue(undefined)
    vi.mocked(lockfile.lock).mockResolvedValue(mockRelease as unknown as () => Promise<void>)

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'ok',
        sites: [freshWorkspace],
      }),
    }))

    const result = await ensureFreshToken('company.video23.com')

    expect(result).toBe('tok_refreshed')
    expect(lockfile.lock).toHaveBeenCalledWith(
      '/fake/config/path/config.json',
      { realpath: false, retries: 3 }
    )
    expect(mockRelease).toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('acquires file lock with config path before refreshing', async () => {
    const expiringSoon = makeWorkspace({
      expiration_time: new Date(Date.now() + 1 * 60 * 1000).toISOString(),
    })
    const freshWorkspace = makeWorkspace({
      bearer_token: 'tok_fresh',
      expiration_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    })

    vi.mocked(getWorkspaceForDomain).mockReturnValue(expiringSoon)
    vi.mocked(getWorkspaces).mockReturnValue([expiringSoon])
    vi.mocked(getCredential).mockReturnValue('login_tok')
    vi.mocked(getConfigPath).mockReturnValue('/specific/config.json')

    const mockRelease = vi.fn().mockResolvedValue(undefined)
    vi.mocked(lockfile.lock).mockResolvedValue(mockRelease as unknown as () => Promise<void>)

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', sites: [freshWorkspace] }),
    }))

    await ensureFreshToken('company.video23.com')

    expect(lockfile.lock).toHaveBeenCalledWith(
      '/specific/config.json',
      { realpath: false, retries: 3 }
    )
    vi.unstubAllGlobals()
  })

  it('re-checks token freshness after lock acquisition (skips refresh if another process refreshed)', async () => {
    const expiringSoon = makeWorkspace({
      expiration_time: new Date(Date.now() + 1 * 60 * 1000).toISOString(),
    })
    const alreadyRefreshed = makeWorkspace({
      bearer_token: 'tok_already_fresh',
      // Another process refreshed — token now far in future
      expiration_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    })

    // Pre-lock check: expiring (triggers lock acquisition)
    vi.mocked(getWorkspaceForDomain)
      .mockReturnValueOnce(expiringSoon)  // first call (pre-lock)
      .mockReturnValueOnce(alreadyRefreshed) // second call (post-lock re-check)

    const mockRelease = vi.fn().mockResolvedValue(undefined)
    vi.mocked(lockfile.lock).mockResolvedValue(mockRelease as unknown as () => Promise<void>)

    const result = await ensureFreshToken('company.video23.com')

    // Should return the already-refreshed token without calling fetch
    expect(result).toBe('tok_already_fresh')
    expect(fetch).not.toBeDefined()
    // Lock was acquired and released
    expect(lockfile.lock).toHaveBeenCalled()
    expect(mockRelease).toHaveBeenCalled()
  })

  it('returns null when no login token exists in keychain', async () => {
    const expiringSoon = makeWorkspace({
      expiration_time: new Date(Date.now() + 1 * 60 * 1000).toISOString(),
    })

    vi.mocked(getWorkspaceForDomain).mockReturnValue(expiringSoon)
    vi.mocked(getCredential).mockReturnValue(null)

    const mockRelease = vi.fn().mockResolvedValue(undefined)
    vi.mocked(lockfile.lock).mockResolvedValue(mockRelease as unknown as () => Promise<void>)

    const result = await ensureFreshToken('company.video23.com')

    expect(result).toBeNull()
    expect(mockRelease).toHaveBeenCalled()
  })

  it('releases lock in finally block even when fetch throws', async () => {
    const expiringSoon = makeWorkspace({
      expiration_time: new Date(Date.now() + 1 * 60 * 1000).toISOString(),
    })

    vi.mocked(getWorkspaceForDomain).mockReturnValue(expiringSoon)
    vi.mocked(getCredential).mockReturnValue('login_tok')

    const mockRelease = vi.fn().mockResolvedValue(undefined)
    vi.mocked(lockfile.lock).mockResolvedValue(mockRelease as unknown as () => Promise<void>)

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    await expect(ensureFreshToken('company.video23.com')).rejects.toThrow('Network error')
    expect(mockRelease).toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('updates workspace list with fresh tokens after refresh', async () => {
    const expiringSoon = makeWorkspace({
      expiration_time: new Date(Date.now() + 1 * 60 * 1000).toISOString(),
    })
    const otherWorkspace = makeWorkspace({
      domain: 'other.video23.com',
      bearer_token: 'tok_other',
      expiration_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    })
    const freshWorkspace = makeWorkspace({
      bearer_token: 'tok_refreshed_new',
      expiration_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    })

    vi.mocked(getWorkspaceForDomain).mockReturnValue(expiringSoon)
    vi.mocked(getWorkspaces).mockReturnValue([expiringSoon, otherWorkspace])
    vi.mocked(getCredential).mockReturnValue('login_tok')

    const mockRelease = vi.fn().mockResolvedValue(undefined)
    vi.mocked(lockfile.lock).mockResolvedValue(mockRelease as unknown as () => Promise<void>)

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', sites: [freshWorkspace] }),
    }))

    await ensureFreshToken('company.video23.com')

    // setWorkspaces should be called with merged list
    expect(setWorkspaces).toHaveBeenCalledWith([freshWorkspace, otherWorkspace])
    vi.unstubAllGlobals()
  })
})
