import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar mail send command — sends a webinar email to its recipients.
 *
 * Action command pattern (Decision D-1): outputs a single green success line only.
 *
 * Threat mitigations:
 *   T-05-07: applyCliTerms() on all error messages
 */
export default class WebinarMailSend extends AuthenticatedCommand<typeof WebinarMailSend> {
  static description = 'Send a webinar email'

  static examples = [
    '<%= config.bin %> webinar mail send 555 --webinar-id 12345',
    '<%= config.bin %> webinar mail send 555 --series-id 67890 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'webinar-id': Flags.string({
      description: 'Webinar ID (mutually exclusive with --series-id)',
      exclusive: ['series-id'],
    }),
    'series-id': Flags.string({
      description: 'Series ID (mutually exclusive with --webinar-id)',
      exclusive: ['webinar-id'],
    }),
  }

  static args = {
    id: Args.string({ description: 'Mail ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarMailSend)
    this.printWorkspaceHeader()

    const contextField = flags['webinar-id']
      ? { live_id: Number(flags['webinar-id']) }
      : flags['series-id']
        ? { live_series_id: Number(flags['series-id']) }
        : null

    if (!contextField) {
      this.error(applyCliTerms('Either --webinar-id or --series-id is required'), { exit: EXIT_ERROR })
    }

    const { data, error } = await this.apiClient.POST('/live/mail/send', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: { ...contextField, live_mail_id: Number(args.id) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // Action command pattern: single green success line
    this.log(chalk.green('Mail sent'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Mail sent',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'mail', id: args.id },
        ],
      })
    }
  }
}
