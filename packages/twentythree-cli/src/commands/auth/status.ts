import { BaseCommand } from '../../lib/base-command.js'
import { getWorkspaces } from '../../auth/workspace-config.js'

/**
 * Format an ISO 8601 expiry string as a human-readable relative time.
 * e.g. "expires in 2 hours", "expires in 45 minutes", "expired"
 */
function formatExpiry(expirationTime: string): string {
  if (!expirationTime) return 'unknown'

  const expiryMs = new Date(expirationTime).getTime()
  if (isNaN(expiryMs)) return 'unknown'

  const diffMs = expiryMs - Date.now()
  if (diffMs <= 0) return 'expired'

  const diffMins = Math.floor(diffMs / (1000 * 60))
  if (diffMins < 60) return `expires in ${diffMins} minute${diffMins === 1 ? '' : 's'}`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `expires in ${diffHours} hour${diffHours === 1 ? '' : 's'}`

  const diffDays = Math.floor(diffHours / 24)
  return `expires in ${diffDays} day${diffDays === 1 ? '' : 's'}`
}

export default class Status extends BaseCommand<typeof Status> {
  static description = 'Show authentication status and active workspace'

  static examples = ['<%= config.bin %> auth status']

  static enableJsonFlag = true

  public async run(): Promise<void | Record<string, unknown>> {
    this.printWorkspaceHeader()

    const workspace = this.activeWorkspace
    const authMode = workspace.bearer_token ? 'authenticated' : 'anonymous (domain-only)'
    const workspaces = getWorkspaces()
    const workspaceCount = workspaces.length

    this.log(`Domain:      ${workspace.domain}`)
    this.log(`Display:     ${workspace.display_name}`)
    this.log(`Auth mode:   ${authMode}`)

    if (workspace.bearer_token) {
      this.log(`Token:       ${formatExpiry(workspace.expiration_time)}`)
    }

    this.log(`Workspaces:  ${workspaceCount} configured`)

    if (this.jsonEnabled()) {
      return {
        domain: workspace.domain,
        display_name: workspace.display_name,
        authMode,
        expiration_time: workspace.expiration_time || null,
        workspaceCount,
      }
    }
  }
}
