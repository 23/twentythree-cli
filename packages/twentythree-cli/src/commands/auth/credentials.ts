import { Command } from '@oclif/core'
import * as p from '@clack/prompts'
import { setCredential } from '../../auth/credential-store.js'
import {
  setWorkspaces,
  setActiveWorkspace,
  setCredentialDomain,
  type WorkspaceEntry,
} from '../../auth/workspace-config.js'
import { fetchWorkspaceTokens } from '../../auth/token-refresh.js'

export default class Credentials extends Command {
  static description = 'Configure domain and bearer token for a TwentyThree workspace'

  static agentMetadata = {
    api_endpoint: 'interactive',
    auth_scope: 'none' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'creates' as const,
  }

  static examples = ['<%= config.bin %> auth credentials']

  public async run(): Promise<void> {
    await this.parse(Credentials)
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

      let workspaces: WorkspaceEntry[]
      try {
        workspaces = await fetchWorkspaceTokens(domain as string, trimmedToken)
        s.stop('Workspaces discovered')
      } catch (err) {
        s.stop('Failed to discover workspaces')
        this.error(
          `Could not discover workspaces: ${err instanceof Error ? err.message : String(err)}`,
          { exit: 1 },
        )
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
      const domainStr = domain as string
      const domainOnlyEntry: WorkspaceEntry = {
        domain: domainStr,
        display_name: domainStr,
        bearer_token: '',
        expiration_time: '',
        api_base_url: `https://${domainStr}/`,
        site_name: domainStr,
        canonical_user_p: false,
        starred_p: false,
      }
      setWorkspaces([domainOnlyEntry])
      setActiveWorkspace(domainStr)
      this.log(
        'Anonymous mode: only endpoints that do not require authentication are accessible.',
      )
      this.log('Run `twentythree auth credentials` again to add a bearer token.')
    }

    p.outro('Credentials saved')
  }
}
