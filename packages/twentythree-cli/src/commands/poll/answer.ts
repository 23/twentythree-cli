import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { text, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Poll answer command — submits a poll answer.
 *
 * CRITICAL (Pitfall 5): Uses `object_id` and `object_token` (NOT `live_id`).
 * Token auto-looked up via fetchWebinarToken if --token not provided.
 *
 * Threat mitigations:
 *   T-05-18: applyCliTerms() on all error messages
 */
export default class PollAnswer extends AuthenticatedCommand<typeof PollAnswer> {
  static description = 'Submit a poll answer'

  static examples = [
    '<%= config.bin %> poll answer 99 --webinar-id 12345 --option-id 3',
    '<%= config.bin %> poll answer 99 --webinar-id 12345 --option-id 3 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'webinar-id': Flags.string({
      description: 'Webinar ID',
      required: false,
    }),
    'option-id': Flags.string({
      description: 'Poll option ID',
      required: false,
    }),
    token: Flags.string({
      description: 'Webinar token (auto-looked up if omitted)',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Poll ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(PollAnswer)
    this.printWorkspaceHeader()

    let webinarId = flags['webinar-id']
    let optionId = flags['option-id']

    // Interactive fallback when required fields not provided in non-JSON mode
    if (!webinarId && !this.jsonEnabled()) {
      const result = await text({ message: 'Webinar ID' })
      if (isCancel(result)) {
        process.exit(EXIT_CANCELLED)
      }
      webinarId = result as string
    }

    if (!webinarId) {
      this.error('--webinar-id is required in non-interactive mode', { exit: EXIT_ERROR })
    }

    if (!optionId && !this.jsonEnabled()) {
      const result = await text({ message: 'Poll option ID' })
      if (isCancel(result)) {
        process.exit(EXIT_CANCELLED)
      }
      optionId = result as string
    }

    if (!optionId) {
      this.error('--option-id is required in non-interactive mode', { exit: EXIT_ERROR })
    }

    // CRITICAL: object_token (not live_token) for poll endpoints
    const objectToken = flags.token ?? await this.fetchWebinarToken(Number(webinarId))

    // CRITICAL: object_id (NOT live_id) for poll endpoints
    const { data, error } = await this.apiClient.POST('/poll/answer', {
      body: {
        poll_id: Number(args.id),
        object_id: Number(webinarId),
        object_token: objectToken,
        poll_option_id: Number(optionId),
      } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Poll answer submitted',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'poll', id: args.id },
        ],
      })
    }

    this.log(chalk.green('Poll answer submitted'))
  }
}
