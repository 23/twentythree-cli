import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Poll update command — updates a poll's settings.
 *
 * Sends only fields where flags are explicitly provided.
 * Boolean flags map to _p suffix fields (open_p, display_results_p).
 *
 * Threat mitigations:
 *   T-05-18: applyCliTerms() on all error messages
 */
export default class PollUpdate extends AuthenticatedCommand<typeof PollUpdate> {
  static description = 'Update a poll'

  static examples = [
    '<%= config.bin %> poll update 99 --question "Updated question?"',
    '<%= config.bin %> poll update 99 --open',
    '<%= config.bin %> poll update 99 --no-display-results',
    '<%= config.bin %> poll update 99 --question "New?" --open --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    question: Flags.string({
      description: 'Poll question',
      required: false,
    }),
    open: Flags.boolean({
      description: 'Open or close the poll',
      allowNo: true,
      required: false,
    }),
    'display-results': Flags.boolean({
      description: 'Show or hide results',
      allowNo: true,
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Poll ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(PollUpdate)
    this.printWorkspaceHeader()

    const body: Record<string, unknown> = { poll_id: Number(args.id) }
    if (flags.question !== undefined) body.question = flags.question
    if (flags.open !== undefined) body.open_p = flags.open ? 1 : 0
    if (flags['display-results'] !== undefined) body.display_results_p = flags['display-results'] ? 1 : 0

    const { data, error } = await this.apiClient.POST('/poll/update', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Poll updated',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'poll', id: args.id },
        ],
      })
    }

    this.log(chalk.green('Poll updated'))
  }
}
