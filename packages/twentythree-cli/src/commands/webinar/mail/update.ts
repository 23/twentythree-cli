import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar mail update command — updates fields on an existing webinar email.
 *
 * CRITICAL: uses live_mail_id (the mail ID), NOT live_id.
 * Only fields explicitly provided are included in the body — prevents clearing unset fields.
 *
 * Threat mitigations:
 *   T-05-07: applyCliTerms() on all error messages
 */
export default class WebinarMailUpdate extends AuthenticatedCommand<typeof WebinarMailUpdate> {
  static description = 'Update a webinar email'

  static examples = [
    '<%= config.bin %> webinar mail update 555 --subject "Updated Subject"',
    '<%= config.bin %> webinar mail update 555 --message "New content"',
    '<%= config.bin %> webinar mail update 555 --subject "Updated" --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
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
    id: Args.string({ description: 'Mail ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarMailUpdate)
    this.printWorkspaceHeader()

    // CRITICAL: body uses live_mail_id (NOT live_id)
    const body: Record<string, unknown> = { live_mail_id: Number(args.id) }
    if (flags.subject !== undefined) body.subject = flags.subject
    if (flags.message !== undefined) body.message = flags.message

    const { data, error } = await this.apiClient.POST('/live/mail/update', {
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
        summary: 'Mail updated',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'mail', id: args.id },
        ],
      })
    }

    this.log(chalk.green('Mail updated'))
  }
}
