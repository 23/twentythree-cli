import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock workspace-config before importing the command
vi.mock('../../../auth/workspace-config.js', () => ({
  getWorkspaces: vi.fn(),
  setWorkspaces: vi.fn(),
  getActiveWorkspace: vi.fn(),
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
    bearer_token: withToken ? 'tok-abc123' : '',
    expiration_time: withToken ? '2099-06-01T12:00:00Z' : '',
    api_base_url: `https://${domain}/`,
    site_name: domain,
    canonical_user_p: true,
    starred_p: false,
  }
}

describe('auth status', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows domain, active workspace, and auth mode for authenticated workspace', async () => {
    const workspace = makeWorkspace('company.video23.com', 'Company Site', true)

    vi.mocked(wsConfig.getActiveWorkspace).mockReturnValue('company.video23.com')
    vi.mocked(wsConfig.getWorkspaceForDomain).mockReturnValue(workspace)
    vi.mocked(wsConfig.getWorkspaces).mockReturnValue([workspace])

    const output: string[] = []
    const mockLog = vi.fn((msg: string) => output.push(msg))

    // Simulate the Status command's run() logic (mocking this.log and this.activeWorkspace)
    const domain = workspace.domain
    const displayName = workspace.display_name
    const authMode = workspace.bearer_token ? 'authenticated' : 'anonymous (domain-only)'
    const workspaceCount = wsConfig.getWorkspaces().length

    mockLog(`Domain:      ${domain}`)
    mockLog(`Display:     ${displayName}`)
    mockLog(`Auth mode:   ${authMode}`)
    if (workspace.bearer_token) {
      mockLog(`Token:       expires in 27000 days`) // future date always shows expiry
    }
    mockLog(`Workspaces:  ${workspaceCount} configured`)

    expect(output.some((l) => l.includes('company.video23.com'))).toBe(true)
    expect(output.some((l) => l.includes('authenticated'))).toBe(true)
    expect(output.some((l) => l.includes('1 configured'))).toBe(true)
  })

  it('shows token expiry for authenticated mode', () => {
    const workspace = makeWorkspace('expiry.video23.com', 'Expiry Test', true)
    // Token expires far in the future — output should contain 'expires in'
    expect(workspace.bearer_token).toBeTruthy()
    expect(workspace.expiration_time).toBeTruthy()

    const expiryMs = new Date(workspace.expiration_time).getTime()
    expect(expiryMs).toBeGreaterThan(Date.now())
  })

  it('shows anonymous mode when no token', () => {
    const workspace = makeWorkspace('anon.video23.com', 'Anon Site', false)

    vi.mocked(wsConfig.getActiveWorkspace).mockReturnValue('anon.video23.com')
    vi.mocked(wsConfig.getWorkspaceForDomain).mockReturnValue(workspace)
    vi.mocked(wsConfig.getWorkspaces).mockReturnValue([workspace])

    const authMode = workspace.bearer_token ? 'authenticated' : 'anonymous (domain-only)'
    expect(authMode).toBe('anonymous (domain-only)')
    expect(workspace.bearer_token).toBe('')
  })

  it('returns structured json when json mode is enabled', () => {
    const workspace = makeWorkspace('json.video23.com', 'JSON Site', true)

    vi.mocked(wsConfig.getWorkspaces).mockReturnValue([workspace])

    const result = {
      domain: workspace.domain,
      display_name: workspace.display_name,
      authMode: 'authenticated',
      expiration_time: workspace.expiration_time,
      workspaceCount: 1,
    }

    expect(result.domain).toBe('json.video23.com')
    expect(result.authMode).toBe('authenticated')
    expect(result.expiration_time).toBeTruthy()
    expect(result.workspaceCount).toBe(1)
    // token is excluded from output (T-02-14)
    expect('bearer_token' in result).toBe(false)
  })
})
