import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'
import {
  ANALYTICS_DATE_FLAGS,
  ANALYTICS_FILTER_FLAGS,
} from '../../../lib/analytics-flags.js'

/**
 * Analytics live timeseries command — returns live/webinar analytics time series data.
 *
 * Uses GET /analytics/data/live/timeseries (no p/size — timeseries does not support pagination).
 */
export default class AnalyticsLiveTimeseries extends AuthenticatedCommand<typeof AnalyticsLiveTimeseries> {
  static description = 'Get live/webinar analytics time series data'

  static examples = [
    '<%= config.bin %> analytics live timeseries --date-expression thisweek',
    '<%= config.bin %> analytics live timeseries --date-start 2024-01-01 --date-end 2024-01-31',
    '<%= config.bin %> analytics live timeseries --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'GET /analytics/data/live/timeseries',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['Date', 'Plays', 'Peak Viewers', 'Engagement', 'Playrate'] },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    ...ANALYTICS_DATE_FLAGS,
    ...ANALYTICS_FILTER_FLAGS,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AnalyticsLiveTimeseries)

    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/analytics/data/live/timeseries', {
      params: {
        query: {
          date_start: flags['date-start'],
          date_end: flags['date-end'],
          date_expression: flags['date-expression'],
          selection: flags.selection,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          groupby: flags.groupby as any,
          orderby: flags.orderby as any,
          order: flags.order as any,
        },
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: rows,
        summary: `${rows.length} row(s)`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'analytics' },
        ],
      })
    }

    if (rows.length === 0) {
      this.log('No data found.')
      return
    }

    const headers = ['Date', 'Plays', 'Peak Viewers', 'Engagement', 'Playrate']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableRows = rows.map((row: any) => [
      String(row.date ?? ''),
      String(row.plays ?? ''),
      String(row.peakviewers ?? ''),
      String(row.engagement ?? ''),
      String(row.playrate ?? ''),
    ])

    const table = renderTable(headers, tableRows)
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} row(s)`))
  }
}
