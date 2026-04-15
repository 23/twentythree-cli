import { Args } from '@oclif/core'
import chalk from 'chalk'
import { confirm, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Action delete command — deletes a CTA action after confirmation.
 *
 * Prompts user to confirm deletion showing the workspace domain (T-06-03 mitigation).
 * --json flag skips the confirmation prompt (scripting mode — assume confirmed).
 *
 * Exit codes:
 *   0 — success
 *   1 — error
 *   2 — cancelled (user declined confirmation)
 *
 * Threat mitigations:
 *   T-06-03: Confirmation prompt includes workspace domain
 */
export default class ActionDelete extends AuthenticatedCommand<typeof ActionDelete> {
  static description = 'Delete a CTA action'

  static examples = [
    '<%= config.bin %> action delete 12345',
    '<%= config.bin %> action delete 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Action ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(ActionDelete)

    this.printWorkspaceHeader()

    if (!this.jsonEnabled()) {
      // T-06-03: Confirmation prompt includes workspace domain
      const confirmed = await confirm({
        message: `Delete action ${args.id} from ${this.activeWorkspace.domain}? This cannot be undone.`,
      })

      if (isCancel(confirmed) || !confirmed) {
        process.exit(EXIT_CANCELLED)
      }
    }

    const { data: deleteData, error: deleteError } = await this.apiClient.POST('/action/delete', {
      body: { action_id: Number(args.id) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (deleteError) {
      this.error(applyCliTerms(formatApiError(deleteError)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green('Action deleted'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: deleteData,
        summary: `Action ${args.id} deleted`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'action', id: args.id },
        ],
      })
    }
  }
}
