import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { text, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar mail add command — creates a new email for a webinar.
 *
 * Interactive fallback (Decision D-2): if --subject or --message not provided
 * and not in JSON mode, prompts interactively via @clack/prompts.
 *
 * Threat mitigations:
 *   T-05-07: applyCliTerms() on all error messages
 */
export default class WebinarMailAdd extends AuthenticatedCommand<typeof WebinarMailAdd> {
  static description = 'Add an email to a webinar'

  static examples = [
    '<%= config.bin %> webinar mail add 12345 --subject "Reminder" --message "Join us tomorrow!"',
    '<%= config.bin %> webinar mail add --series-id 67890 --subject "Reminder"',
    '<%= config.bin %> webinar mail add 12345 --subject "Reminder" --message "Join us!" --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'series-id': Flags.string({
      description: 'Series ID — add mail to a series instead of a webinar',
    }),
    subject: Flags.string({
      description: 'Email subject',
      required: false,
    }),
    message: Flags.string({
      description: 'Email message body',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Webinar ID (omit when using --series-id)', required: false }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarMailAdd)
    this.printWorkspaceHeader()

    const contextField = flags['series-id']
      ? { live_series_id: Number(flags['series-id']) }
      : args.id
        ? { live_id: Number(args.id) }
        : null

    if (!contextField) {
      this.error(applyCliTerms('Either a webinar ID argument or --series-id is required'), { exit: EXIT_ERROR })
    }

    let subject = flags.subject
    let message = flags.message

    // Interactive fallback (Decision D-2)
    if ((!subject || !message) && !this.jsonEnabled()) {
      if (!subject) {
        const result = await text({ message: 'Email subject' })
        if (isCancel(result)) process.exit(EXIT_CANCELLED)
        subject = result as string
      }
      if (!message) {
        const result = await text({ message: 'Email message' })
        if (isCancel(result)) process.exit(EXIT_CANCELLED)
        message = result as string
      }
    }

    if (!subject) {
      this.error('--subject is required in non-interactive mode', { exit: EXIT_ERROR })
    }
    if (!message) {
      this.error('--message is required in non-interactive mode', { exit: EXIT_ERROR })
    }

    const { data, error } = await this.apiClient.POST('/live/mail/add', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: { ...contextField, subject, message } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mailId = (data as any)?.data?.live_mail_id ?? (data as any)?.live_mail_id

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Mail created',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
          { resource: 'mail', id: String(mailId ?? '') },
        ],
      })
    }

    this.log(chalk.green('Mail created'))
    if (mailId) {
      this.log(`ID: ${mailId}`)
    }
  }
}
