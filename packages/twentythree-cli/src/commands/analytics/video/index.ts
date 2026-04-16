import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'
import {
  ANALYTICS_DATE_FLAGS,
  ANALYTICS_FILTER_FLAGS,
  ANALYTICS_PAGINATION_FLAGS,
} from '../../../lib/analytics-flags.js'

/**
 * Analytics video index command — returns paginated video analytics data.
 *
 * Uses GET /analytics/data/videos (root endpoint with p/size pagination).
 * Closes ANL-01 gap: provides the bare `analytics video` command.
 */
export default class AnalyticsVideoIndex extends AuthenticatedCommand<typeof AnalyticsVideoIndex> {
  static description = 'Get video analytics data'

  static examples = [
    '<%= config.bin %> analytics video --date-expression thisweek',
    '<%= config.bin %> analytics video --date-start 2024-01-01 --date-end 2024-01-31 --page 1 --size 20',
    '<%= config.bin %> analytics video --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'GET /analytics/data/videos',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['Plays', 'Engagement', 'Playrate', 'Avg View Time', 'Traffic'] },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    ...ANALYTICS_DATE_FLAGS,
    ...ANALYTICS_PAGINATION_FLAGS,
    ...ANALYTICS_FILTER_FLAGS,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AnalyticsVideoIndex)

    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/analytics/data/videos', {
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
          p: flags.page,
          size: flags.size,
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

    const headers = ['Plays', 'Engagement', 'Playrate', 'Avg View Time', 'Traffic']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableRows = rows.map((row: any) => [
      String(row.plays ?? ''),
      String(row.engagement ?? ''),
      String(row.playrate ?? ''),
      String(row.avg_viewtime ?? ''),
      String(row.traffic ?? ''),
    ])

    const table = renderTable(headers, tableRows)
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} row(s)`))
  }
}
