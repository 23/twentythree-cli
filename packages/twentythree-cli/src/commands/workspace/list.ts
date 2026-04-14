import chalk from 'chalk'
import { BaseCommand } from '../../lib/base-command.js'
import { getWorkspaces, getActiveWorkspace, type WorkspaceEntry } from '../../auth/workspace-config.js'

function formatExpiryShort(expirationTime: string): string {
  if (!expirationTime) return ''

  const expiryMs = new Date(expirationTime).getTime()
  if (isNaN(expiryMs)) return ''

  const diffMs = expiryMs - Date.now()
  if (diffMs <= 0) return 'expired'

  const diffMins = Math.floor(diffMs / (1000 * 60))
  if (diffMins < 60) return `expires in ${diffMins}m`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `expires in ${diffHours}h`

  const diffDays = Math.floor(diffHours / 24)
  return `expires in ${diffDays}d`
}

export default class List extends BaseCommand<typeof List> {
  static description = 'List all configured workspaces'

  static examples = ['<%= config.bin %> workspace list']

  static enableJsonFlag = true

  public async run(): Promise<void | Array<WorkspaceEntry & { isDefault: boolean }>> {
    this.printWorkspaceHeader()

    const workspaces = getWorkspaces()
    const activeDomain = getActiveWorkspace()

    if (workspaces.length === 0) {
      this.log(
        'No workspaces configured. Run `twentythree auth credentials` to set up.',
      )
      if (this.jsonEnabled()) return []
      return
    }

    const result = workspaces.map((w) => {
      const isDefault = w.domain === activeDomain
      const marker = isDefault ? chalk.green('*') : ' '

      let status: string
      if (w.bearer_token) {
        const expiry = formatExpiryShort(w.expiration_time)
        status = expiry ? `authenticated, ${expiry}` : 'authenticated'
      } else {
        status = 'anonymous'
      }

      this.log(`  ${marker} ${w.domain}  ${w.display_name}  (${status})`)

      return { ...w, isDefault }
    })

    if (this.jsonEnabled()) return result
  }
}
