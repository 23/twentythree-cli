import chalk from 'chalk'
import { BaseCommand } from '../../lib/base-command.js'
import { getWorkspaces, getActiveWorkspace, type WorkspaceEntry } from '../../auth/workspace-config.js'


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

      const status = w.bearer_token ? 'authenticated' : 'anonymous'

      this.log(`  ${marker} ${w.domain}  ${w.display_name}  (${status})`)

      return { ...w, isDefault }
    })

    if (this.jsonEnabled()) return result
  }
}
