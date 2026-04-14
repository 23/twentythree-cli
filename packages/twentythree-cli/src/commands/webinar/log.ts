import { Args } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Webinar log command — retrieves the event log for a webinar.
 * Concatenates date + time fields into single Start/End columns.
 */
export default class WebinarLog extends AuthenticatedCommand<typeof WebinarLog> {
  static description = 'Retrieve the event log for a webinar'

  static examples = [
    '<%= config.bin %> webinar log 12345',
    '<%= config.bin %> webinar log 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(WebinarLog)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/live/log', {
      params: { query: { live_id: Number(args.id) } },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const events: any[] = Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: events,
        summary: `${events.length} event${events.length === 1 ? '' : 's'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
        ],
      })
    }

    if (events.length === 0) {
      this.log('No log events found.')
      return
    }

    const headers = ['Event', 'Start', 'End']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = events.map((e: any) => [
      String(e.event ?? ''),
      [e.start_time__date, e.start_time__time].filter(Boolean).join(' '),
      [e.end_time__date, e.end_time__time].filter(Boolean).join(' '),
    ])

    const table = renderTable(headers, rows)
    this.log(table.toString())
    this.log(chalk.dim(`${events.length} event${events.length === 1 ? '' : 's'}`))
  }
}
