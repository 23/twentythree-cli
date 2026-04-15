import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { text, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar mail test command — sends a test email to a specified address.
 *
 * Action command pattern (Decision D-1): outputs a single green success line only.
 * Interactive fallback when --email not provided (Decision D-2).
 *
 * Threat mitigations:
 *   T-05-07: applyCliTerms() on all error messages
 */
export default class WebinarMailTest extends AuthenticatedCommand<typeof WebinarMailTest> {
  static description = 'Send a test email'

  static examples = [
    '<%= config.bin %> webinar mail test 555 --webinar-id 12345 --email me@example.com',
    '<%= config.bin %> webinar mail test 555 --series-id 67890',
    '<%= config.bin %> webinar mail test 555 --webinar-id 12345 --email me@example.com --json',
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
    email: Flags.string({
      description: 'Recipient email for test',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Mail ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarMailTest)
    this.printWorkspaceHeader()

    const contextField = flags['webinar-id']
      ? { live_id: Number(flags['webinar-id']) }
      : flags['series-id']
        ? { live_series_id: Number(flags['series-id']) }
        : null

    if (!contextField) {
      this.error(applyCliTerms('Either --webinar-id or --series-id is required'), { exit: EXIT_ERROR })
    }

    let email = flags.email

    // Interactive fallback (Decision D-2)
    if (!email && !this.jsonEnabled()) {
      const result = await text({ message: 'Recipient email for test' })
      if (isCancel(result)) process.exit(EXIT_CANCELLED)
      email = result as string
    }

    if (!email) {
      this.error('--email is required in non-interactive mode', { exit: EXIT_ERROR })
    }

    const { data, error } = await this.apiClient.POST('/live/mail/test', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: { ...contextField, live_mail_id: Number(args.id), email } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // Action command pattern: single green success line
    this.log(chalk.green('Test email sent'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Test email sent',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'mail', id: args.id },
        ],
      })
    }
  }
}
