import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'
import {
  ANALYTICS_DATE_FLAGS,
  ANALYTICS_FILTER_FLAGS,
} from '../../../lib/analytics-flags.js'

/**
 * Analytics live totals command — returns aggregate live/webinar analytics data.
 *
 * Uses GET /analytics/data/live/totals (no p/size — totals does not support pagination).
 */
export default class AnalyticsLiveTotals extends AuthenticatedCommand<typeof AnalyticsLiveTotals> {
  static description = 'Get live/webinar analytics totals'

  static examples = [
    '<%= config.bin %> analytics live totals --date-expression thisweek',
    '<%= config.bin %> analytics live totals --date-start 2024-01-01 --date-end 2024-01-31',
    '<%= config.bin %> analytics live totals --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'GET /analytics/data/live/totals',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['Plays', 'Peak Viewers', 'Engagement', 'Playrate', 'Avg View Time'] },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    ...ANALYTICS_DATE_FLAGS,
    ...ANALYTICS_FILTER_FLAGS,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AnalyticsLiveTotals)

    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/analytics/data/live/totals', {
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

    const headers = ['Plays', 'Peak Viewers', 'Engagement', 'Playrate', 'Avg View Time']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableRows = rows.map((row: any) => [
      String(row.plays ?? ''),
      String(row.peakviewers ?? ''),
      String(row.engagement ?? ''),
      String(row.playrate ?? ''),
      String(row.avg_viewtime ?? ''),
    ])

    const table = renderTable(headers, tableRows)
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} row(s)`))
  }
}
