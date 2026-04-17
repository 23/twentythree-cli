import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Command } from '@oclif/core'

// ---------------------------------------------------------------------------
// Hoisted mocks — must be declared before imports so vi.mock factories can use them
// ---------------------------------------------------------------------------
const {
  mockGetWorkspaces,
  mockGetActiveWorkspace,
  mockGetWorkspaceForDomain,
  mockFindWorkspace,
  mockEnsureFreshToken,
  mockCreateApiClient,
  mockLog,
  mockError,
} = vi.hoisted(() => {
  const mockGetWorkspaces = vi.fn()
  const mockGetActiveWorkspace = vi.fn()
  const mockGetWorkspaceForDomain = vi.fn()
  const mockFindWorkspace = vi.fn()
  const mockEnsureFreshToken = vi.fn()
  const mockCreateApiClient = vi.fn(() => ({ use: vi.fn() }))
  const mockLog = vi.fn()
  const mockError = vi.fn((msg: string, opts?: { exit?: number }) => {
    const err = new Error(msg) as Error & { oclif?: { exit?: number } }
    err.oclif = opts
    throw err
  })
  return {
    mockGetWorkspaces,
    mockGetActiveWorkspace,
    mockGetWorkspaceForDomain,
    mockFindWorkspace,
    mockEnsureFreshToken,
    mockCreateApiClient,
    mockLog,
    mockError,
  }
})

vi.mock('../../auth/workspace-config.js', () => ({
  getWorkspaces: mockGetWorkspaces,
  getActiveWorkspace: mockGetActiveWorkspace,
  getWorkspaceForDomain: mockGetWorkspaceForDomain,
  findWorkspace: mockFindWorkspace,
}))

vi.mock('../../auth/token-refresh.js', () => ({
  ensureFreshToken: mockEnsureFreshToken,
}))

vi.mock('../../api/client.js', () => ({
  createApiClient: mockCreateApiClient,
}))

// Mock chalk dim to return a predictable string for assertion
vi.mock('chalk', () => ({
  default: {
    dim: (s: string) => `[dim]${s}[/dim]`,
  },
}))

// Mock @clack/prompts to avoid interactive prompts in tests
vi.mock('@clack/prompts', () => ({
  select: vi.fn(),
}))

import { BaseCommand, AuthenticatedCommand } from '../base-command.js'
import type { WorkspaceEntry } from '../../auth/workspace-config.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const WORKSPACE_WITH_TOKEN: WorkspaceEntry = {
  domain: 'company.video23.com',
  display_name: 'Company',
  bearer_token: 'tok_abc123',
  expiration_time: '2099-01-01T00:00:00Z',
  api_base_url: 'https://company.video23.com/',
  site_name: 'Company',
  canonical_user_p: true,
  starred_p: false,
}

const WORKSPACE_NO_TOKEN: WorkspaceEntry = {
  ...WORKSPACE_WITH_TOKEN,
  bearer_token: '',
}

/**
 * Build a concrete subclass of BaseCommand (or AuthenticatedCommand) for testing.
 * The run() method is a no-op; we only test init() behaviour here.
 */
function makeBaseCommandClass(
  base: typeof BaseCommand | typeof AuthenticatedCommand = BaseCommand,
) {
  class ConcreteCommand extends (base as typeof BaseCommand)<typeof ConcreteCommand> {
    static id = 'test:command'
    static flags = {}
    static args = {}
    static strict = true
    static enableJsonFlag = true

    async run() { /* no-op for testing */ }

    // Expose protected members for testing
    public callPrintWorkspaceHeader() {
      return this.printWorkspaceHeader()
    }
    public getActiveWorkspaceForTest() {
      return this.activeWorkspace
    }
    public getApiClientForTest() {
      return this.apiClient
    }
  }
  return ConcreteCommand
}

/**
 * Minimal oclif config stub — provides just enough for Command.init() and parse()
 * to run without errors in a unit test context.
 */
function makeOclifConfig() {
  return {
    userAgent: 'twentythree-cli/test',
    scopedEnvVar: () => undefined,
    runHook: vi.fn().mockResolvedValue({ successes: [], failures: [] }),
    theme: {},
  } as never
}

/**
 * Instantiate a command and call init().
 * Provides a minimal oclif config stub and patches log/error.
 * Passes argv so oclif's parser resolves flags from the command line.
 */
async function initCommand(
  CommandClass: ReturnType<typeof makeBaseCommandClass>,
  argv: string[] = [],
) {
  const cmd = new CommandClass(argv, makeOclifConfig())
  cmd.log = mockLog
  cmd.error = mockError as typeof cmd.error
  await cmd.init()
  return cmd
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('BaseCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: ensureFreshToken returns null (no refresh needed)
    mockEnsureFreshToken.mockResolvedValue(null)
  })

  it('resolves workspace from --workspace flag (calls findWorkspace)', async () => {
    mockFindWorkspace.mockReturnValue(WORKSPACE_WITH_TOKEN)
    mockGetWorkspaces.mockReturnValue([WORKSPACE_WITH_TOKEN])

    const Cmd = makeBaseCommandClass()
    const cmd = await initCommand(Cmd, ['--workspace', 'company'])

    expect(mockFindWorkspace).toHaveBeenCalledWith('company', [WORKSPACE_WITH_TOKEN])
    expect(cmd.getActiveWorkspaceForTest()).toBe(WORKSPACE_WITH_TOKEN)
  })

  it('resolves workspace from active workspace when no --workspace flag', async () => {
    mockGetActiveWorkspace.mockReturnValue('company.video23.com')
    mockGetWorkspaceForDomain.mockReturnValue(WORKSPACE_WITH_TOKEN)

    const Cmd = makeBaseCommandClass()
    const cmd = await initCommand(Cmd, [])

    expect(mockGetActiveWorkspace).toHaveBeenCalled()
    expect(mockGetWorkspaceForDomain).toHaveBeenCalledWith('company.video23.com')
    expect(cmd.getActiveWorkspaceForTest()).toBe(WORKSPACE_WITH_TOKEN)
  })

  it('errors when no workspace configured', async () => {
    mockGetActiveWorkspace.mockReturnValue(undefined)

    const Cmd = makeBaseCommandClass()
    await expect(initCommand(Cmd, [])).rejects.toThrow(
      'No workspace configured — run `twentythree auth credentials` to set up',
    )
  })

  it('calls ensureFreshToken when workspace has a token', async () => {
    mockGetActiveWorkspace.mockReturnValue('company.video23.com')
    mockGetWorkspaceForDomain.mockReturnValue(WORKSPACE_WITH_TOKEN)
    mockEnsureFreshToken.mockResolvedValue('tok_fresh')

    const Cmd = makeBaseCommandClass()
    await initCommand(Cmd, [])

    expect(mockEnsureFreshToken).toHaveBeenCalledWith('company.video23.com')
  })

  it('does NOT call ensureFreshToken when workspace has no token', async () => {
    mockGetActiveWorkspace.mockReturnValue('company.video23.com')
    mockGetWorkspaceForDomain.mockReturnValue(WORKSPACE_NO_TOKEN)

    const Cmd = makeBaseCommandClass()
    await initCommand(Cmd, [])

    expect(mockEnsureFreshToken).not.toHaveBeenCalled()
  })

  it('creates API client via createApiClient', async () => {
    mockGetActiveWorkspace.mockReturnValue('company.video23.com')
    mockGetWorkspaceForDomain.mockReturnValue(WORKSPACE_WITH_TOKEN)

    const Cmd = makeBaseCommandClass()
    const cmd = await initCommand(Cmd, [])

    expect(mockCreateApiClient).toHaveBeenCalledWith({
      baseUrl: 'https://company.video23.com/api/2/',
      token: 'tok_abc123',
    })
    expect(cmd.getApiClientForTest()).toBeDefined()
  })

  it('prints workspace header with dim styling', async () => {
    mockGetActiveWorkspace.mockReturnValue('company.video23.com')
    mockGetWorkspaceForDomain.mockReturnValue(WORKSPACE_WITH_TOKEN)

    const Cmd = makeBaseCommandClass()
    const cmd = await initCommand(Cmd, [])
    cmd.callPrintWorkspaceHeader()

    expect(mockLog).toHaveBeenCalledWith('[dim][company.video23.com][/dim]')
  })
})

describe('AuthenticatedCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEnsureFreshToken.mockResolvedValue(null)
  })

  it('rejects when no token is configured (AUTH-10 exact message)', async () => {
    mockGetActiveWorkspace.mockReturnValue('company.video23.com')
    mockGetWorkspaceForDomain.mockReturnValue(WORKSPACE_NO_TOKEN)

    const Cmd = makeBaseCommandClass(AuthenticatedCommand)
    await expect(initCommand(Cmd, [])).rejects.toThrow(
      'This command requires authentication — run `twentythree auth credentials` to add a bearer token',
    )
  })

  it('allows execution when token is configured', async () => {
    mockGetActiveWorkspace.mockReturnValue('company.video23.com')
    mockGetWorkspaceForDomain.mockReturnValue(WORKSPACE_WITH_TOKEN)

    const Cmd = makeBaseCommandClass(AuthenticatedCommand)
    const cmd = await initCommand(Cmd, [])

    // init() should complete without throwing
    expect(cmd.getActiveWorkspaceForTest().bearer_token).toBe('tok_abc123')
  })
})
