import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'
import {
  ANALYTICS_DATE_FLAGS,
  ANALYTICS_FILTER_FLAGS,
} from '../../../lib/analytics-flags.js'

/**
 * Analytics conversions timeseries command — returns conversion analytics time series data.
 *
 * Uses GET /analytics/data/conversions/timeseries (no p/size per OpenAPI spec).
 * Satisfies ANL-06.
 */
export default class AnalyticsConversionsTimeseries extends AuthenticatedCommand<typeof AnalyticsConversionsTimeseries> {
  static description = 'Get conversion analytics time series data'

  static examples = [
    '<%= config.bin %> analytics conversions timeseries --date-expression thisweek',
    '<%= config.bin %> analytics conversions timeseries --date-start 2024-01-01 --date-end 2024-01-31',
    '<%= config.bin %> analytics conversions timeseries --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'GET /analytics/data/conversions/timeseries',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['Date', 'Conversions', 'Views', 'Visits'] },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    ...ANALYTICS_DATE_FLAGS,
    ...ANALYTICS_FILTER_FLAGS,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AnalyticsConversionsTimeseries)

    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/analytics/data/conversions/timeseries', {
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

    const headers = ['Date', 'Conversions', 'Views', 'Visits']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableRows = rows.map((row: any) => [
      String(row.date ?? ''),
      String(row.conversions ?? ''),
      String(row.views ?? ''),
      String(row.visits ?? ''),
    ])

    const table = renderTable(headers, tableRows)
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} row(s)`))
  }
}
