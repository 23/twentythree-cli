import { Command, Flags } from '@oclif/core'
import * as p from '@clack/prompts'
import { setCredential } from '../../auth/credential-store.js'
import {
  setWorkspaces,
  setActiveWorkspace,
  setCredentialDomain,
  findWorkspace,
  type WorkspaceEntry,
} from '../../auth/workspace-config.js'
import { fetchWorkspaceTokens } from '../../auth/token-refresh.js'

/**
 * Build the workspace entry used for anonymous (domain-only) access — no token,
 * no workspace discovery. Shared by the interactive and non-interactive paths.
 */
function buildDomainOnlyEntry(domain: string): WorkspaceEntry {
  return {
    domain,
    display_name: domain,
    bearer_token: '',
    expiration_time: '',
    api_base_url: `https://${domain}/`,
    site_name: domain,
    canonical_user_p: false,
    starred_p: false,
  }
}

export default class Credentials extends Command {
  static description = 'Configure domain and bearer token for a TwentyThree workspace'

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'interactive',
    auth_scope: 'none' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'creates' as const,
  }

  static flags = {
    domain: Flags.string({
      description:
        'Workspace domain (e.g. company.video23.com). Passing this runs the command non-interactively (no prompts).',
    }),
    token: Flags.string({
      description:
        'Bearer/login token. Falls back to the TWENTYTHREE_TOKEN env var. Omit for anonymous (domain-only) access.',
    }),
    workspace: Flags.string({
      description:
        'Which discovered workspace to set active (domain or display name) when the token unlocks several. Non-interactive mode only.',
    }),
  }

  static examples = [
    '<%= config.bin %> auth credentials',
    '<%= config.bin %> auth credentials --domain company.video23.com --token <token>',
    '<%= config.bin %> auth credentials --domain company.video23.com --token <token> --workspace "Marketing"',
    'TWENTYTHREE_TOKEN=<token> <%= config.bin %> auth credentials --domain company.video23.com --json',
  ]

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(Credentials)

    // Non-interactive when --domain is supplied. This is the agent/CI path.
    if (flags.domain !== undefined) {
      return this.runNonInteractive(
        flags.domain,
        flags.token ?? process.env.TWENTYTHREE_TOKEN,
        flags.workspace,
      )
    }

    // Interactive mode requires a TTY — @clack prompts cannot run otherwise.
    if (!process.stdin.isTTY) {
      this.error(
        'No interactive terminal detected. Run non-interactively instead:\n' +
          '  twentythree auth credentials --domain <domain> [--token <token>]\n' +
          '(the token can also be supplied via the TWENTYTHREE_TOKEN env var).',
        { exit: 1 },
      )
    }

    return this.runInteractive()
  }

  /**
   * Non-interactive configuration driven entirely by flags / env vars.
   * Returns a JSON-serializable summary when --json is set.
   */
  private async runNonInteractive(
    domain: string,
    token: string | undefined,
    workspaceSelector: string | undefined,
  ): Promise<void | object> {
    if (!domain.includes('.')) {
      this.error(
        `Invalid domain '${domain}' — expected something like company.video23.com`,
        { exit: 1 },
      )
    }

    const trimmedToken = (token ?? '').trim()
    const json = this.jsonEnabled()

    // Domain-only / anonymous mode — no token, no discovery.
    if (!trimmedToken) {
      const entry = buildDomainOnlyEntry(domain)
      setWorkspaces([entry])
      setActiveWorkspace(domain)
      if (json) {
        return { domain, mode: 'anonymous', active_workspace: domain, workspaces: [domain] }
      }
      this.log(
        `Anonymous mode configured for ${domain}. Only endpoints that do not require authentication are accessible.`,
      )
      this.log('Re-run with --token to add a bearer token.')
      return
    }

    // Authenticated mode — store token and discover workspaces.
    setCredential(domain, trimmedToken)
    setCredentialDomain(domain)

    let workspaces: WorkspaceEntry[]
    try {
      workspaces = await fetchWorkspaceTokens(domain, trimmedToken)
    } catch (err) {
      this.error(
        `Could not discover workspaces: ${err instanceof Error ? err.message : String(err)}`,
        { exit: 1 },
      )
      return
    }

    if (workspaces.length === 0) {
      this.error('No workspaces were returned for the provided token.', { exit: 1 })
      return
    }

    let active: WorkspaceEntry
    if (workspaceSelector) {
      const match = findWorkspace(workspaceSelector, workspaces)
      if (match === null) {
        this.error(
          `No workspace matching '${workspaceSelector}'. Available: ` +
            workspaces.map((w) => `${w.display_name} (${w.domain})`).join(', '),
          { exit: 1 },
        )
        return
      }
      if (Array.isArray(match)) {
        this.error(
          `'${workspaceSelector}' is ambiguous — matches: ${match
            .map((w) => w.domain)
            .join(', ')}. Use the exact domain.`,
          { exit: 1 },
        )
        return
      }
      active = match
    } else {
      // Default selection: starred, then canonical, then the first returned.
      active =
        workspaces.find((w) => w.starred_p) ??
        workspaces.find((w) => w.canonical_user_p) ??
        workspaces[0]
    }

    setWorkspaces(workspaces)
    setActiveWorkspace(active.domain)

    if (json) {
      return {
        domain,
        mode: 'authenticated',
        active_workspace: active.domain,
        workspaces: workspaces.map((w) => ({ domain: w.domain, display_name: w.display_name })),
      }
    }

    this.log(`Credentials saved for ${domain}.`)
    if (workspaces.length > 1 && !workspaceSelector) {
      this.log(
        `Discovered ${workspaces.length} workspaces; set '${active.display_name} (${active.domain})' active. ` +
          'Use --workspace to choose a different one.',
      )
    } else {
      this.log(`Active workspace: ${active.display_name} (${active.domain}).`)
    }
  }

  /**
   * Interactive configuration via @clack prompts (the original flow).
   */
  private async runInteractive(): Promise<void> {
    p.intro('TwentyThree credentials')

    const domain = await p.text({
      message: 'Domain (e.g. company.video23.com)',
      validate: (v) => (v?.includes('.') ? undefined : 'Enter a valid domain'),
    })

    if (p.isCancel(domain)) {
      p.cancel('Cancelled')
      return
    }

    const token = await p.text({
      message: 'Bearer token (press Enter to skip for anonymous access)',
      placeholder: 'optional',
    })

    if (p.isCancel(token)) {
      p.cancel('Cancelled')
      return
    }

    const trimmedToken = (token as string).trim()

    if (trimmedToken) {
      // AUTH-01: Store login token in OS keychain; record which domain it belongs to
      setCredential(domain as string, trimmedToken)
      setCredentialDomain(domain as string)

      // AUTH-02: Discover workspaces using login token
      const s = p.spinner()
      s.start('Discovering workspaces...')

      let workspaces: WorkspaceEntry[] = []
      try {
        workspaces = await fetchWorkspaceTokens(domain as string, trimmedToken)
        s.stop('Workspaces discovered')
      } catch (err) {
        s.stop('Failed to discover workspaces')
        this.error(
          `Could not discover workspaces: ${err instanceof Error ? err.message : String(err)}`,
          { exit: 1 },
        )
        return // unreachable but makes the flow explicit for static analysis
      }

      let selectedWorkspaces: WorkspaceEntry[]

      // AUTH-03: Prompt user to select default workspace when multiple returned
      if (workspaces.length > 1) {
        const selectedDomain = await p.select({
          message: 'Select default workspace',
          options: workspaces.map((w) => ({
            value: w.domain,
            label: `${w.display_name} (${w.domain})`,
          })),
        })

        if (p.isCancel(selectedDomain)) {
          p.cancel('Cancelled')
          return
        }

        selectedWorkspaces = workspaces.filter((w) => w.domain === (selectedDomain as string))
      } else {
        selectedWorkspaces = workspaces
      }

      const defaultDomain =
        selectedWorkspaces.length === 1 ? selectedWorkspaces[0].domain : (domain as string)

      setWorkspaces(workspaces)
      setActiveWorkspace(defaultDomain)
    } else {
      // Domain-only mode: store entry without token, skip discovery
      const domainOnlyEntry = buildDomainOnlyEntry(domain as string)
      setWorkspaces([domainOnlyEntry])
      setActiveWorkspace(domain as string)
      this.log(
        'Anonymous mode: only endpoints that do not require authentication are accessible.',
      )
      this.log('Run `twentythree auth credentials` again to add a bearer token.')
    }

    p.outro('Credentials saved')
  }
}
