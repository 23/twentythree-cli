import { Command } from '@oclif/core'
import * as p from '@clack/prompts'
import { setCredential } from '../../auth/credential-store.js'
import {
  setWorkspaces,
  setActiveWorkspace,
  type WorkspaceEntry,
} from '../../auth/workspace-config.js'
import { fetchWorkspaceTokens } from '../../auth/token-refresh.js'

export default class Credentials extends Command {
  static description = 'Configure domain and bearer token for a TwentyThree workspace'

  static examples = ['<%= config.bin %> auth credentials']

  public async run(): Promise<void> {
    await this.parse(Credentials)
    p.intro('TwentyThree credentials')

    const domain = await p.text({
      message: 'Domain (e.g. company.video23.com)',
      validate: (v) => (v.includes('.') ? undefined : 'Enter a valid domain'),
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
      // AUTH-01: Store login token in OS keychain
      setCredential(domain as string, trimmedToken)

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

      // AUTH-03: Prompt user to select workspaces when multiple returned
      if (workspaces.length > 1) {
        const selectedDomains = await p.multiselect({
          message: 'Select workspaces to activate',
          options: workspaces.map((w) => ({
            value: w.domain,
            label: `${w.display_name} (${w.domain})`,
          })),
          required: true,
        })

        if (p.isCancel(selectedDomains)) {
          p.cancel('Cancelled')
          return
        }

        selectedWorkspaces = workspaces.filter((w) =>
          (selectedDomains as string[]).includes(w.domain),
        )
      } else {
        selectedWorkspaces = workspaces
      }

      // Prompt to set default workspace
      let defaultDomain: string
      if (selectedWorkspaces.length > 1) {
        const chosen = await p.select({
          message: 'Default workspace',
          options: selectedWorkspaces.map((w) => ({
            value: w.domain,
            label: `${w.display_name} (${w.domain})`,
          })),
        })

        if (p.isCancel(chosen)) {
          p.cancel('Cancelled')
          return
        }

        defaultDomain = chosen as string
      } else if (selectedWorkspaces.length === 1) {
        defaultDomain = selectedWorkspaces[0].domain
      } else {
        // Fallback: use the entered domain itself
        defaultDomain = domain as string
      }

      setWorkspaces(selectedWorkspaces)
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
