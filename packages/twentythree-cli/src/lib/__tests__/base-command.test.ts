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
  mockPIntro,
  mockPText,
  mockPIsCancel,
  mockPCancel,
  mockPOutro,
  mockPConfirm,
  mockRunCommand,
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
  const mockPIntro = vi.fn()
  const mockPText = vi.fn()
  const mockPIsCancel = vi.fn(() => false)
  const mockPCancel = vi.fn()
  const mockPOutro = vi.fn()
  const mockPConfirm = vi.fn()
  const mockRunCommand = vi.fn().mockResolvedValue(undefined)
  return {
    mockGetWorkspaces,
    mockGetActiveWorkspace,
    mockGetWorkspaceForDomain,
    mockFindWorkspace,
    mockEnsureFreshToken,
    mockCreateApiClient,
    mockLog,
    mockError,
    mockPIntro,
    mockPText,
    mockPIsCancel,
    mockPCancel,
    mockPOutro,
    mockPConfirm,
    mockRunCommand,
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
  intro: mockPIntro,
  text: mockPText,
  isCancel: mockPIsCancel,
  cancel: mockPCancel,
  outro: mockPOutro,
  confirm: mockPConfirm,
}))

import { BaseCommand, AuthenticatedCommand } from '../base-command.js'
import { permissionBelow } from '../permissions.js'
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
    runCommand: mockRunCommand,
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

// ---------------------------------------------------------------------------
// Helpers for catch() tests
// ---------------------------------------------------------------------------

function makeFailedFlagError(
  flagNames: string[],
  flagDefs: Record<string, { description?: string; summary?: string }> = {},
) {
  const reasons = flagNames.map(n => `Missing required flag ${n}`)
  const message = `The following error${flagNames.length > 1 ? 's' : ''} occurred:\n  ${reasons.join('\n  ')}\nSee more help with --help`

  class FailedFlagValidationError extends Error {
    parse: { input: { flags: Record<string, { description?: string; summary?: string }> } }
    constructor(msg: string) {
      super(msg)
      this.name = 'FailedFlagValidationError'
      this.parse = { input: { flags: flagDefs } }
    }
  }

  return new FailedFlagValidationError(message)
}

describe('BaseCommand.catch() — interactive prompt for missing required flag', () => {
  let originalIsTTY: boolean | undefined

  beforeEach(() => {
    vi.clearAllMocks()
    mockEnsureFreshToken.mockResolvedValue(null)
    mockRunCommand.mockResolvedValue(undefined)
    originalIsTTY = process.stdin.isTTY
    Object.defineProperty(process.stdin, 'isTTY', { value: true, writable: true, configurable: true })
  })

  afterEach(() => {
    Object.defineProperty(process.stdin, 'isTTY', { value: originalIsTTY, writable: true, configurable: true })
  })

  it('re-throws when process.stdin.isTTY is false (non-TTY guard)', async () => {
    Object.defineProperty(process.stdin, 'isTTY', { value: false, writable: true, configurable: true })
    const Cmd = makeBaseCommandClass()
    const cmd = new Cmd([], makeOclifConfig())
    const err = makeFailedFlagError(['name'], { name: { description: 'Your name' } })

    await expect((cmd as any).catch(err)).rejects.toThrow()
    expect(mockPIntro).not.toHaveBeenCalled()
    expect(mockPText).not.toHaveBeenCalled()
  })

  it('re-throws for non-FailedFlagValidationError errors', async () => {
    const Cmd = makeBaseCommandClass()
    const cmd = new Cmd([], makeOclifConfig())
    const err = new Error('Some other error')

    await expect((cmd as any).catch(err)).rejects.toThrow('Some other error')
    expect(mockPIntro).not.toHaveBeenCalled()
  })

  it('prompts for a single missing flag and re-runs command', async () => {
    mockPText.mockResolvedValue('Alice')
    mockPIsCancel.mockReturnValue(false)

    const Cmd = makeBaseCommandClass()
    const cmd = new Cmd([], makeOclifConfig())
    const err = makeFailedFlagError(['name'], { name: { description: 'Your name' } })

    await (cmd as any).catch(err)

    expect(mockPIntro).toHaveBeenCalledWith('Missing required input')
    expect(mockPText).toHaveBeenCalledWith(expect.objectContaining({ message: 'Your name' }))
    expect(mockPOutro).toHaveBeenCalledWith('Running command...')
    expect(mockRunCommand).toHaveBeenCalledWith('test:command', ['--name', 'Alice'])
  })

  it('prompts for all missing flags in one pass (multi-flag case)', async () => {
    mockPText.mockResolvedValueOnce('https://example.com').mockResolvedValueOnce('video.uploaded')
    mockPIsCancel.mockReturnValue(false)

    const Cmd = makeBaseCommandClass()
    const cmd = new Cmd([], makeOclifConfig())
    const err = makeFailedFlagError(
      ['target-url', 'event'],
      { 'target-url': { description: 'URL to receive webhook POST requests' }, event: { description: 'Event type to subscribe to' } },
    )

    await (cmd as any).catch(err)

    expect(mockPText).toHaveBeenCalledTimes(2)
    expect(mockPText).toHaveBeenCalledWith(expect.objectContaining({ message: 'URL to receive webhook POST requests' }))
    expect(mockPText).toHaveBeenCalledWith(expect.objectContaining({ message: 'Event type to subscribe to' }))
    expect(mockRunCommand).toHaveBeenCalledWith('test:command', ['--target-url', 'https://example.com', '--event', 'video.uploaded'])
  })

  it('throws CLIError on cancel (p.isCancel returns true)', async () => {
    mockPText.mockResolvedValue(Symbol('clack:cancel'))
    mockPIsCancel.mockReturnValue(true)

    const Cmd = makeBaseCommandClass()
    const cmd = new Cmd([], makeOclifConfig())
    const err = makeFailedFlagError(['name'], { name: { description: 'Your name' } })

    await expect((cmd as any).catch(err)).rejects.toThrow('Cancelled')
    expect(mockPCancel).toHaveBeenCalledWith('Cancelled')
    expect(mockRunCommand).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Permission levels
// ---------------------------------------------------------------------------

describe('permissionBelow', () => {
  it('orders none < anonymous < read < write < admin < super', () => {
    expect(permissionBelow('read', 'write')).toBe(true)
    expect(permissionBelow('write', 'admin')).toBe(true)
    expect(permissionBelow('anonymous', 'read')).toBe(true)
    expect(permissionBelow('write', 'write')).toBe(false)
    expect(permissionBelow('admin', 'write')).toBe(false)
    expect(permissionBelow('super', 'admin')).toBe(false)
  })

  it('never fails for unknown or missing levels — the API stays the authority', () => {
    expect(permissionBelow(undefined, 'write')).toBe(false)
    expect(permissionBelow('read', undefined)).toBe(false)
    expect(permissionBelow('bogus', 'write')).toBe(false)
    expect(permissionBelow('read', 'bogus')).toBe(false)
  })
})

describe('AuthenticatedCommand — permission level fast-fail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEnsureFreshToken.mockResolvedValue(null)
    mockGetActiveWorkspace.mockReturnValue('company.video23.com')
  })

  function makeScopedClass(scope: string) {
    class Scoped extends AuthenticatedCommand<typeof Scoped> {
      static id = 'video:delete'
      static flags = {}
      static args = {}
      static strict = true
      static enableJsonFlag = true
      static agentMetadata = { api_endpoint: 'POST /photo/delete', auth_scope: scope, output_shape: { type: 'none' }, side_effects: 'destructive' }
      async run() { /* no-op */ }
    }
    return Scoped as unknown as ReturnType<typeof makeBaseCommandClass>
  }

  it('refuses a write command when the stored login is read-only, naming the command', async () => {
    mockGetWorkspaceForDomain.mockReturnValue({ ...WORKSPACE_WITH_TOKEN, permission_level: 'read' })

    await expect(initCommand(makeScopedClass('write'), [])).rejects.toThrow(
      /read-only, but `video delete` requires write permission/,
    )
  })

  it('allows a read command on a read-only login', async () => {
    mockGetWorkspaceForDomain.mockReturnValue({ ...WORKSPACE_WITH_TOKEN, permission_level: 'read' })

    await expect(initCommand(makeScopedClass('read'), [])).resolves.toBeDefined()
    expect(mockError).not.toHaveBeenCalled()
  })

  it('skips the check when the stored entry has no permission level (pre-existing configs)', async () => {
    mockGetWorkspaceForDomain.mockReturnValue(WORKSPACE_WITH_TOKEN)

    await expect(initCommand(makeScopedClass('admin'), [])).resolves.toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// confirmDestructive()
// ---------------------------------------------------------------------------

describe('BaseCommand.confirmDestructive()', () => {
  let originalIsTTY: boolean | undefined
  let exitSpy: ReturnType<typeof vi.spyOn>

  function makeDestructiveClass() {
    class Destructive extends BaseCommand<typeof Destructive> {
      static id = 'test:remove'
      static flags = { ...BaseCommand.destructiveFlags }
      static args = {}
      static strict = true
      static enableJsonFlag = true
      async run() { /* no-op */ }
      public confirmForTest(message: string) {
        return this.confirmDestructive(message)
      }
    }
    return Destructive
  }

  async function initDestructive(argv: string[]) {
    const cmd = new (makeDestructiveClass())(argv, makeOclifConfig())
    cmd.log = mockLog
    cmd.error = mockError as typeof cmd.error
    await cmd.init()
    return cmd
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockEnsureFreshToken.mockResolvedValue(null)
    mockGetActiveWorkspace.mockReturnValue('company.video23.com')
    mockGetWorkspaceForDomain.mockReturnValue(WORKSPACE_WITH_TOKEN)
    mockPIsCancel.mockReturnValue(false)
    originalIsTTY = process.stdin.isTTY
    Object.defineProperty(process.stdin, 'isTTY', { value: true, writable: true, configurable: true })
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`process.exit(${code})`)
    }) as never)
  })

  afterEach(() => {
    Object.defineProperty(process.stdin, 'isTTY', { value: originalIsTTY, writable: true, configurable: true })
    exitSpy.mockRestore()
  })

  it('--yes skips the prompt', async () => {
    const cmd = await initDestructive(['--yes'])
    await cmd.confirmForTest('Delete it?')
    expect(mockPConfirm).not.toHaveBeenCalled()
  })

  it('-y is the short form of --yes', async () => {
    const cmd = await initDestructive(['-y'])
    await cmd.confirmForTest('Delete it?')
    expect(mockPConfirm).not.toHaveBeenCalled()
  })

  it('--json skips the prompt (backwards compatible scripting mode)', async () => {
    const cmd = await initDestructive(['--json'])
    await cmd.confirmForTest('Delete it?')
    expect(mockPConfirm).not.toHaveBeenCalled()
  })

  it('without a TTY and without --yes it exits 2 with a message naming the flag', async () => {
    Object.defineProperty(process.stdin, 'isTTY', { value: false, writable: true, configurable: true })
    const cmd = await initDestructive([])

    await expect(cmd.confirmForTest('Delete video 1 from company.video23.com?')).rejects.toThrow(
      /Confirmation required but no interactive terminal is attached.*--yes/s,
    )
    expect(mockError).toHaveBeenCalledWith(expect.stringContaining('Delete video 1 from company.video23.com?'), { exit: 2 })
    expect(mockPConfirm).not.toHaveBeenCalled()
  })

  it('prompts on a TTY and continues when confirmed', async () => {
    mockPConfirm.mockResolvedValue(true)
    const cmd = await initDestructive([])

    await cmd.confirmForTest('Delete it?')
    expect(mockPConfirm).toHaveBeenCalledWith({ message: 'Delete it?' })
    expect(exitSpy).not.toHaveBeenCalled()
  })

  it('says "Cancelled." and exits 2 when the prompt is declined', async () => {
    mockPConfirm.mockResolvedValue(false)
    const cmd = await initDestructive([])

    await expect(cmd.confirmForTest('Delete it?')).rejects.toMatchObject({ oclif: { exit: 2 } })
    expect(mockLog).toHaveBeenCalledWith('Cancelled.')
  })
})
