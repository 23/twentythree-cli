import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { detectShell } from '../detect-shell.js'

vi.mock('@clack/prompts', () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  note: vi.fn(),
  confirm: vi.fn(),
  select: vi.fn(),
  spinner: vi.fn(() => ({ start: vi.fn(), stop: vi.fn() })),
  isCancel: vi.fn(() => false),
  cancel: vi.fn(),
}))

describe('autocomplete', () => {
  let originalShell: string | undefined

  beforeEach(() => {
    vi.clearAllMocks()
    originalShell = process.env.SHELL
  })

  afterEach(() => {
    if (originalShell === undefined) {
      delete process.env.SHELL
    } else {
      process.env.SHELL = originalShell
    }
  })

  it('command module is importable and has a run method', async () => {
    const { default: Autocomplete } = await import('../index.js')
    expect(Autocomplete).toBeDefined()
    expect(typeof Autocomplete.prototype.run).toBe('function')
  })

  it('has correct description', async () => {
    const { default: Autocomplete } = await import('../index.js')
    expect(Autocomplete.description).toBe('Set up tab completion for your shell')
  })

  it('has agentMetadata with api_endpoint interactive', async () => {
    const { default: Autocomplete } = await import('../index.js')
    expect(Autocomplete.agentMetadata.api_endpoint).toBe('interactive')
    expect(Autocomplete.agentMetadata.auth_scope).toBe('none')
  })

  describe('shell detection', () => {
    it('detects zsh from $SHELL env var', () => {
      expect(detectShell('/bin/zsh')).toBe('zsh')
    })

    it('detects bash from $SHELL env var', () => {
      expect(detectShell('/usr/local/bin/bash')).toBe('bash')
    })

    it('returns null for unrecognized shell', () => {
      expect(detectShell('/usr/local/bin/fish')).toBeNull()
    })

    it('returns null when $SHELL is unset', () => {
      expect(detectShell('')).toBeNull()
    })
  })
})
