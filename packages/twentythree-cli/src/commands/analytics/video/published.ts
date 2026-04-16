import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'
import {
  ANALYTICS_DATE_FLAGS,
  ANALYTICS_PAGINATION_FLAGS,
  ANALYTICS_FILTER_FLAGS,
} from '../../../lib/analytics-flags.js'

/**
 * Analytics video published command — returns analytics for published videos.
 *
 * Uses GET /analytics/data/videos/published (plural 'videos' per OpenAPI spec).
 * Supports pagination via p/size query params.
 */
export default class AnalyticsVideoPublished extends AuthenticatedCommand<typeof AnalyticsVideoPublished> {
  static description = 'Get analytics for published videos'

  static examples = [
    '<%= config.bin %> analytics video published --date-expression thismonth',
    '<%= config.bin %> analytics video published --date-start 2024-01-01 --date-end 2024-01-31 --page 1 --size 20',
    '<%= config.bin %> analytics video published --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'GET /analytics/data/videos/published',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['Date', 'Videos', 'Plays', 'Engagement', 'Traffic'] },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    ...ANALYTICS_DATE_FLAGS,
    ...ANALYTICS_PAGINATION_FLAGS,
    ...ANALYTICS_FILTER_FLAGS,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AnalyticsVideoPublished)

    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/analytics/data/videos/published', {
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

    const headers = ['Date', 'Videos', 'Plays', 'Engagement', 'Traffic']
    const tableRows = rows.map((row: any) => [
      String(row.date ?? ''),
      String(row.videos ?? ''),
      String(row.plays ?? ''),
      String(row.engagement ?? ''),
      String(row.traffic ?? ''),
    ])

    const table = renderTable(headers, tableRows)
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} row(s)`))
  }
}
