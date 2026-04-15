import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { text, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Poll set-options command — sets options for a poll.
 *
 * Decision D-2: uses repeated --option flags: `--option "Yes" --option "No"`
 * CRITICAL (Pitfall 7): options must be serialized as JSON string, not array.
 *   Correct:   options='["Yes","No","Maybe"]'
 *   Incorrect: options[]=Yes&options[]=No (would fail silently)
 *
 * Threat mitigations:
 *   T-05-20: Options validated as non-empty before serialization
 *   T-05-18: applyCliTerms() on all error messages
 */
export default class PollSetOptions extends AuthenticatedCommand<typeof PollSetOptions> {
  static description = 'Set options for a poll'

  static examples = [
    '<%= config.bin %> poll set-options 99 --option "Yes" --option "No" --option "Maybe"',
    '<%= config.bin %> poll set-options 99 --option "Option A" --option "Option B" --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    option: Flags.string({
      description: 'Poll option (repeat for multiple)',
      multiple: true,
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Poll ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(PollSetOptions)
    this.printWorkspaceHeader()

    let options: string[] = flags.option ?? []

    // Interactive fallback: collect options one by one until user enters empty string
    if (options.length === 0 && !this.jsonEnabled()) {
      this.log('Enter poll options one at a time. Press Enter on an empty line when done.')
      while (true) {
        const result = await text({
          message: `Option ${options.length + 1} (leave empty to finish)`,
          placeholder: options.length >= 2 ? 'Press Enter to finish' : 'e.g. Yes',
        })
        if (isCancel(result)) {
          process.exit(EXIT_CANCELLED)
        }
        const val = (result as string).trim()
        if (!val) break
        options.push(val)
      }
    }

    // T-05-20: validate non-empty
    if (options.length === 0) {
      this.error('At least one --option is required', { exit: EXIT_ERROR })
    }

    // CRITICAL (Pitfall 7): serialize as JSON string, not array
    const optionsJson = JSON.stringify(options)

    const { data, error } = await this.apiClient.POST('/poll/set-options', {
      body: { poll_id: Number(args.id), options: optionsJson } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Poll options set (${options.length} options)`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'poll', id: args.id },
        ],
      })
    }

    this.log(chalk.green(`Poll options set (${options.length} options)`))
  }
}
