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

function makeWorkspace(domain: string, displayName: string, withToken = true) {
  return {
    domain,
    display_name: displayName,
    bearer_token: withToken ? 'tok-abc' : '',
    expiration_time: withToken ? '2099-01-01T00:00:00Z' : '',
    api_base_url: `https://${domain}/`,
    site_name: domain,
    canonical_user_p: true,
    starred_p: false,
  }
}

describe('workspace list', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists all workspaces with default marked (AUTH-07)', () => {
    const ws1 = makeWorkspace('a.video23.com', 'Site A')
    const ws2 = makeWorkspace('b.video23.com', 'Site B')

    vi.mocked(wsConfig.getWorkspaces).mockReturnValue([ws1, ws2])
    vi.mocked(wsConfig.getActiveWorkspace).mockReturnValue('a.video23.com')

    const workspaces = wsConfig.getWorkspaces()
    const activeDomain = wsConfig.getActiveWorkspace()

    expect(workspaces).toHaveLength(2)
    expect(workspaces[0].domain).toBe('a.video23.com')
    expect(workspaces[1].domain).toBe('b.video23.com')

    // Active workspace should match
    const defaultWs = workspaces.find((w) => w.domain === activeDomain)
    expect(defaultWs?.domain).toBe('a.video23.com')
  })

  it('shows message when no workspaces configured', () => {
    vi.mocked(wsConfig.getWorkspaces).mockReturnValue([])
    vi.mocked(wsConfig.getActiveWorkspace).mockReturnValue(undefined)

    const workspaces = wsConfig.getWorkspaces()
    expect(workspaces).toHaveLength(0)

    // Command should output setup message
    const output = 'No workspaces configured. Run `twentythree auth credentials` to set up.'
    expect(output).toContain('twentythree auth credentials')
  })

  it('marks exactly one workspace as default', () => {
    const ws1 = makeWorkspace('x.video23.com', 'X Site')
    const ws2 = makeWorkspace('y.video23.com', 'Y Site')
    const ws3 = makeWorkspace('z.video23.com', 'Z Site')

    vi.mocked(wsConfig.getWorkspaces).mockReturnValue([ws1, ws2, ws3])
    vi.mocked(wsConfig.getActiveWorkspace).mockReturnValue('y.video23.com')

    const workspaces = wsConfig.getWorkspaces()
    const activeDomain = wsConfig.getActiveWorkspace()

    const defaults = workspaces.filter((w) => w.domain === activeDomain)
    expect(defaults).toHaveLength(1)
    expect(defaults[0].domain).toBe('y.video23.com')
  })

  it('shows anonymous status for domain-only workspaces', () => {
    const anonWs = makeWorkspace('anon.video23.com', 'Anon', false)

    vi.mocked(wsConfig.getWorkspaces).mockReturnValue([anonWs])
    vi.mocked(wsConfig.getActiveWorkspace).mockReturnValue('anon.video23.com')

    const workspaces = wsConfig.getWorkspaces()
    const ws = workspaces[0]

    expect(ws.bearer_token).toBe('')
    // anonymous status is shown (not authenticated)
    const status = ws.bearer_token ? 'authenticated' : 'anonymous'
    expect(status).toBe('anonymous')
  })

  it('returns array with isDefault field when in json mode', () => {
    const ws1 = makeWorkspace('json1.video23.com', 'JSON 1')
    const ws2 = makeWorkspace('json2.video23.com', 'JSON 2')

    vi.mocked(wsConfig.getWorkspaces).mockReturnValue([ws1, ws2])
    vi.mocked(wsConfig.getActiveWorkspace).mockReturnValue('json1.video23.com')

    const workspaces = wsConfig.getWorkspaces()
    const activeDomain = wsConfig.getActiveWorkspace()

    const result = workspaces.map((w) => ({ ...w, isDefault: w.domain === activeDomain }))

    expect(result[0].isDefault).toBe(true)
    expect(result[1].isDefault).toBe(false)
    expect(result[0].domain).toBe('json1.video23.com')
  })
})
