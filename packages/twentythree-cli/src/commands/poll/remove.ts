import { Args } from '@oclif/core'
import chalk from 'chalk'
import { confirm, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Poll remove command — removes a poll after confirmation.
 *
 * Threat mitigations:
 *   T-05-19: Confirmation prompt includes domain
 *   T-05-18: applyCliTerms() on all error messages
 */
export default class PollRemove extends AuthenticatedCommand<typeof PollRemove> {
  static description = 'Remove a poll'

  static examples = [
    '<%= config.bin %> poll remove 99',
    '<%= config.bin %> poll remove 99 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Poll ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(PollRemove)
    this.printWorkspaceHeader()

    if (!this.jsonEnabled()) {
      // T-05-19: Confirmation includes domain
      const confirmed = await confirm({
        message: `Remove poll ${args.id} from ${this.activeWorkspace.domain}? This cannot be undone.`,
      })

      if (isCancel(confirmed) || !confirmed) {
        process.exit(EXIT_CANCELLED)
      }
    }

    const { data, error } = await this.apiClient.POST('/poll/remove', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: { poll_id: Number(args.id) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Poll ${args.id} removed`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Poll ${args.id} removed`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'poll', id: args.id },
        ],
      })
    }
  }
}
