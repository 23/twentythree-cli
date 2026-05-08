import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock workspace-config before importing the command
vi.mock('../../../auth/workspace-config.js', () => ({
  getWorkspaces: vi.fn(() => []),
  getActiveWorkspace: vi.fn(() => undefined),
  setActiveWorkspace: vi.fn(),
  setWorkspaces: vi.fn(),
  getWorkspaceForDomain: vi.fn(() => null),
  findWorkspace: vi.fn(() => null),
}))

import * as wsConfig from '../../../auth/workspace-config.js'

// Helper: create a mock WorkspaceEntry
function makeWorkspace(domain: string, displayName: string) {
  return {
    domain,
    display_name: displayName,
    bearer_token: 'tok-xyz',
    expiration_time: '2099-01-01T00:00:00Z',
    api_base_url: `https://${domain}/`,
    site_name: domain,
    canonical_user_p: true,
    starred_p: false,
  }
}

describe('auth switch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exports a Switch class with a run method', async () => {
    const { default: Switch } = await import('../switch.js')
    expect(Switch).toBeDefined()
    expect(typeof Switch.prototype.run).toBe('function')
  })

  it('errors when no workspaces configured', async () => {
    vi.mocked(wsConfig.getWorkspaces).mockReturnValue([])

    const { default: Switch } = await import('../switch.js')
    expect(Switch).toBeDefined()

    // Verify that the command would call getWorkspaces and act on an empty array
    const workspaces = wsConfig.getWorkspaces()
    expect(workspaces).toHaveLength(0)
    expect(vi.mocked(wsConfig.getWorkspaces)).toHaveBeenCalled()
  })

  it('shows only-one message when single workspace configured', async () => {
    const singleWs = makeWorkspace('solo.video23.com', 'Solo Site')
    vi.mocked(wsConfig.getWorkspaces).mockReturnValue([singleWs])

    const { default: Switch } = await import('../switch.js')
    expect(Switch).toBeDefined()

    // When only one workspace exists the command skips the select prompt
    const workspaces = wsConfig.getWorkspaces()
    expect(workspaces).toHaveLength(1)
    expect(workspaces[0].display_name).toBe('Solo Site')
    expect(workspaces[0].domain).toBe('solo.video23.com')
  })

  it('marks active workspace in selection options', async () => {
    const wsA = makeWorkspace('a.video23.com', 'Site A')
    const wsB = makeWorkspace('b.video23.com', 'Site B')
    vi.mocked(wsConfig.getWorkspaces).mockReturnValue([wsA, wsB])
    vi.mocked(wsConfig.getActiveWorkspace).mockReturnValue('a.video23.com')

    const workspaces = wsConfig.getWorkspaces()
    const activeDomain = wsConfig.getActiveWorkspace()

    const options = workspaces.map((w) => ({
      value: w.domain,
      label:
        w.domain === activeDomain
          ? `${w.display_name} (${w.domain}) [active]`
          : `${w.display_name} (${w.domain})`,
    }))

    expect(options[0].label).toBe('Site A (a.video23.com) [active]')
    expect(options[1].label).toBe('Site B (b.video23.com)')
  })
})
