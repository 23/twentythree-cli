import { Command } from '@oclif/core'
import * as p from '@clack/prompts'
import {
  getWorkspaces,
  getActiveWorkspace,
  setActiveWorkspace,
} from '../../auth/workspace-config.js'

export default class Switch extends Command {
  static description = 'Switch the active workspace'

  static agentMetadata = {
    api_endpoint: 'interactive',
    auth_scope: 'none' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'updates' as const,
  }

  static examples = ['<%= config.bin %> auth switch']

  public async run(): Promise<void> {
    p.intro('Switch workspace')

    const workspaces = getWorkspaces()

    if (workspaces.length === 0) {
      this.error('No workspaces configured — run `twentythree auth credentials` first', { exit: 1 })
      return
    }

    if (workspaces.length === 1) {
      this.log(`Only one workspace configured: ${workspaces[0].display_name} (${workspaces[0].domain})`)
      return
    }

    const activeDomain = getActiveWorkspace()

    const selectedDomain = await p.select({
      message: 'Select workspace',
      options: workspaces.map((w) => ({
        value: w.domain,
        label:
          w.domain === activeDomain
            ? `${w.display_name} (${w.domain}) [active]`
            : `${w.display_name} (${w.domain})`,
      })),
    })

    if (p.isCancel(selectedDomain)) {
      p.cancel('Cancelled')
      return
    }

    setActiveWorkspace(selectedDomain as string)

    const selectedWorkspace = workspaces.find((w) => w.domain === (selectedDomain as string))!
    p.outro(`Switched to ${selectedWorkspace.display_name} (${selectedDomain})`)
  }
}
