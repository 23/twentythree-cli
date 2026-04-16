import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../../lib/output.js'
import { applyCliTerms } from '../../../../lib/term-map.js'
import {
  ANALYTICS_DATE_FLAGS,
  ANALYTICS_FILTER_FLAGS,
} from '../../../../lib/analytics-flags.js'

/**
 * Analytics video performance timeseries command — returns video playthrough performance time series data.
 *
 * Uses GET /analytics/data/videos/performance/timeseries (plural 'videos' per OpenAPI spec).
 * No pagination — the timeseries endpoint does not support p/size.
 */
export default class AnalyticsVideoPerformanceTimeseries extends AuthenticatedCommand<typeof AnalyticsVideoPerformanceTimeseries> {
  static description = 'Get video playthrough performance - time series'

  static examples = [
    '<%= config.bin %> analytics video performance timeseries --date-expression thisweek',
    '<%= config.bin %> analytics video performance timeseries --date-start 2024-01-01 --date-end 2024-01-31',
    '<%= config.bin %> analytics video performance timeseries --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'GET /analytics/data/videos/performance/timeseries',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['Date', 'Plays', 'Engagement', 'Playthrough'] },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    ...ANALYTICS_DATE_FLAGS,
    ...ANALYTICS_FILTER_FLAGS,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AnalyticsVideoPerformanceTimeseries)

    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/analytics/data/videos/performance/timeseries', {
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

    const headers = ['Date', 'Plays', 'Engagement', 'Playthrough']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableRows = rows.map((row: any) => [
      String(row.date ?? ''),
      String(row.plays ?? ''),
      String(row.engagement ?? ''),
      String(row.playthrough ?? ''),
    ])

    const table = renderTable(headers, tableRows)
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} row(s)`))
  }
}
