import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../../lib/output.js'
import { applyCliTerms } from '../../../../lib/term-map.js'
import {
  ANALYTICS_DATE_FLAGS,
  ANALYTICS_FILTER_FLAGS,
} from '../../../../lib/analytics-flags.js'

/**
 * Analytics usage traffic totals command — returns aggregated traffic usage analytics.
 *
 * Uses GET /analytics/data/usage/traffic/totals.
 * No pagination — the totals endpoint does not support p/size.
 */
export default class AnalyticsUsageTrafficTotals extends AuthenticatedCommand<typeof AnalyticsUsageTrafficTotals> {
  static description = 'Get aggregated traffic usage analytics - totals'

  static examples = [
    '<%= config.bin %> analytics usage traffic totals --date-expression thismonth',
    '<%= config.bin %> analytics usage traffic totals --date-start 2024-01-01 --date-end 2024-01-31',
    '<%= config.bin %> analytics usage traffic totals --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'GET /analytics/data/usage/traffic/totals',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['Traffic Type', 'Plays', 'Engagement', 'Traffic', 'Impressions'] },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    ...ANALYTICS_DATE_FLAGS,
    ...ANALYTICS_FILTER_FLAGS,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AnalyticsUsageTrafficTotals)

    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/analytics/data/usage/traffic/totals', {
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

    const headers = ['Traffic Type', 'Plays', 'Engagement', 'Traffic', 'Impressions']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableRows = rows.map((row: any) => [
      String(row.traffic_type ?? row.type ?? ''),
      String(row.plays ?? ''),
      String(row.engagement ?? ''),
      String(row.traffic ?? ''),
      String(row.impressions ?? ''),
    ])

    const table = renderTable(headers, tableRows)
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} row(s)`))
  }
}
