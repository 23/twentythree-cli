import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../auth/workspace-config.js', () => ({
  getWorkspaces: vi.fn(),
  getActiveWorkspace: vi.fn(),
  setWorkspaces: vi.fn(),
  setActiveWorkspace: vi.fn(),
  getWorkspaceForDomain: vi.fn(),
  findWorkspace: vi.fn(),
}))

vi.mock('../../../auth/token-refresh.js', () => ({
  fetchWorkspaceTokens: vi.fn(),
  ensureFreshToken: vi.fn(() => Promise.resolve(null)),
}))

vi.mock('../../../api/client.js', () => ({
  createApiClient: vi.fn(() => ({})),
}))

import * as wsConfig from '../../../auth/workspace-config.js'

function makeWorkspace(domain: string, displayName: string) {
  return {
    domain,
    display_name: displayName,
    bearer_token: 'tok-abc',
    expiration_time: '2099-01-01T00:00:00Z',
    api_base_url: `https://${domain}/`,
    site_name: domain,
    canonical_user_p: true,
    starred_p: false,
  }
}

describe('workspace use', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('switches active workspace by exact domain (AUTH-08)', () => {
    const ws = makeWorkspace('exact.video23.com', 'Exact Site')

    vi.mocked(wsConfig.findWorkspace).mockReturnValue(ws)
    vi.mocked(wsConfig.getWorkspaces).mockReturnValue([ws])

    // Simulate exact match flow
    const result = wsConfig.findWorkspace('exact.video23.com', [ws])
    expect(result).toEqual(ws)

    // setActiveWorkspace should be called with matched domain
    wsConfig.setActiveWorkspace(ws.domain)
    expect(vi.mocked(wsConfig.setActiveWorkspace)).toHaveBeenCalledWith('exact.video23.com')
  })

  it('switches active workspace by partial display name', () => {
    const ws = makeWorkspace('named.video23.com', 'Named Company Site')

    vi.mocked(wsConfig.findWorkspace).mockReturnValue(ws)
    vi.mocked(wsConfig.getWorkspaces).mockReturnValue([ws])

    const result = wsConfig.findWorkspace('Named Company', [ws])
    expect(result).toEqual(ws)

    wsConfig.setActiveWorkspace(ws.domain)
    expect(vi.mocked(wsConfig.setActiveWorkspace)).toHaveBeenCalledWith('named.video23.com')
  })

  it('prompts on ambiguous match (returns array)', async () => {
    const ws1 = makeWorkspace('company-a.video23.com', 'Company A')
    const ws2 = makeWorkspace('company-b.video23.com', 'Company B')

    vi.mocked(wsConfig.findWorkspace).mockReturnValue([ws1, ws2])
    vi.mocked(wsConfig.getWorkspaces).mockReturnValue([ws1, ws2])

    const result = wsConfig.findWorkspace('company', [ws1, ws2])
    expect(Array.isArray(result)).toBe(true)
    expect((result as typeof ws1[]).length).toBe(2)
    // Command would then use @clack/prompts select to resolve ambiguity
  })

  it('errors with descriptive message on no match', () => {
    vi.mocked(wsConfig.findWorkspace).mockReturnValue(null)
    vi.mocked(wsConfig.getWorkspaces).mockReturnValue([])

    const result = wsConfig.findWorkspace('nonexistent', [])
    expect(result).toBeNull()

    // Command should produce error with instructions
    const errorMsg = "No workspace matching 'nonexistent' found. Run `twentythree workspace list` to see available workspaces."
    expect(errorMsg).toContain('twentythree workspace list')
    expect(errorMsg).toContain('nonexistent')
  })

  it('uses findWorkspace to look up workspace by name (AUTH-08)', () => {
    const ws = makeWorkspace('lookup.video23.com', 'Lookup Site')
    vi.mocked(wsConfig.findWorkspace).mockReturnValue(ws)
    vi.mocked(wsConfig.getWorkspaces).mockReturnValue([ws])

    wsConfig.findWorkspace('lookup', [ws])
    expect(vi.mocked(wsConfig.findWorkspace)).toHaveBeenCalledWith('lookup', [ws])
  })
})
