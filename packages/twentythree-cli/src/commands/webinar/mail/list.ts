import { Args } from '@oclif/core'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, renderTable, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar mail list command — lists all emails configured for a webinar.
 *
 * Threat mitigations:
 *   T-05-07: applyCliTerms() on all error messages
 */
export default class WebinarMailList extends AuthenticatedCommand<typeof WebinarMailList> {
  static description = 'List emails for a webinar'

  static examples = [
    '<%= config.bin %> webinar mail list 12345',
    '<%= config.bin %> webinar mail list 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(WebinarMailList)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/live/mail/list', {
      params: { query: { live_id: Number(args.id) } },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mails: any[] = Array.isArray((data as any)?.data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (data as any).data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : (data as any)?.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? [(data as any).data]
      : []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: mails,
        summary: `${mails.length} mail${mails.length === 1 ? '' : 's'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
          { resource: 'mail' },
        ],
      })
    }

    if (mails.length === 0) {
      this.log('No mail found.')
      return
    }

    const table = renderTable(
      ['ID', 'Subject', 'Status', 'Send Date'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mails.map((m: any) => [
        String(m.live_mail_id ?? m.id ?? ''),
        applyCliTerms(String(m.subject ?? '')),
        String(m.status ?? ''),
        String(m.send_date ?? ''),
      ]),
    )

    this.log(table.toString())
  }
}
