import { Args } from '@oclif/core'
import chalk from 'chalk'
import * as p from '@clack/prompts'
import { BaseCommand } from '../../lib/base-command.js'
import {
  getWorkspaces,
  setActiveWorkspace,
  findWorkspace,
  type WorkspaceEntry,
} from '../../auth/workspace-config.js'

export default class Use extends BaseCommand<typeof Use> {
  static description = 'Switch the active workspace'

  static examples = [
    '<%= config.bin %> workspace use company.video23.com',
    '<%= config.bin %> workspace use "Company Name"',
  ]

  static enableJsonFlag = true

  static args = {
    name: Args.string({
      description: 'Workspace domain or display name',
      required: true,
    }),
  }

  public async run(): Promise<void | WorkspaceEntry> {
    const { args } = await this.parse(Use)
    const name = args.name

    const workspaces = getWorkspaces()
    const result = findWorkspace(name, workspaces)

    let workspace: WorkspaceEntry

    if (result === null) {
      this.error(
        `No workspace matching '${name}' found. Run \`twentythree workspace list\` to see available workspaces.`,
        { exit: 1 },
      )
    } else if (Array.isArray(result)) {
      // Ambiguous match — prompt user to choose
      const chosen = await p.select({
        message: `Multiple workspaces match '${name}'. Select one:`,
        options: result.map((w) => ({
          value: w.domain,
          label: `${w.display_name} (${w.domain})`,
        })),
      })

      if (p.isCancel(chosen)) {
        p.cancel('Cancelled')
        return
      }

      const found = result.find((w) => w.domain === (chosen as string))
      if (!found) {
        this.error('Selected workspace not found', { exit: 1 })
      }
      workspace = found
    } else {
      workspace = result
    }

    setActiveWorkspace(workspace.domain)
    this.log(
      `Active workspace set to ${chalk.bold(workspace.domain)} (${workspace.display_name})`,
    )

    if (this.jsonEnabled()) return workspace
  }
}
