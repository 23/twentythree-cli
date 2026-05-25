import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { fetchAllPages } from '../../../lib/pagination.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar series list command — lists all webinar series in the active workspace.
 * Uses fetchAllPages for auto-pagination.
 *
 * NOTE: Series list does NOT require a token param (workspace-scoped).
 *
 * Threat mitigations:
 *   T-05-16: applyCliTerms() on all error messages
 */
export default class WebinarSeriesList extends AuthenticatedCommand<typeof WebinarSeriesList> {
  static description = 'List webinar series'

  static examples = [
    '<%= config.bin %> webinar series list',
    '<%= config.bin %> webinar series list --json',
    '<%= config.bin %> webinar series list --search "Q4" --ordering live_date --order asc',
    '<%= config.bin %> webinar series list --series-type series --include-speakers --json',
    '<%= config.bin %> webinar series list --user-id me --include-stats --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    search: Flags.string({
      description: 'Search for specific series by keyword',
      required: false,
    }),
    'live-series-id': Flags.integer({
      description: 'Limit results to a single series by its ID',
      required: false,
    }),
    'live-id': Flags.integer({
      description: 'Filter to series that contain a specific webinar ID',
      required: false,
    }),
    'album-id': Flags.integer({
      description: 'Filter to series belonging to a specific category',
      required: false,
    }),
    'user-id': Flags.string({
      description: 'Filter to series created by a specific user (use "me" for the authenticated user)',
      required: false,
    }),
    'series-type': Flags.string({
      description: 'Filter by series type',
      options: ['liveevent', 'series'],
      required: false,
    }),
    ordering: Flags.string({
      description: 'Field to order results by',
      options: ['name', 'private', 'live_status', 'live_date', 'creation_date', 'updated_date'],
      required: false,
    }),
    order: Flags.string({
      description: 'Sort direction',
      options: ['asc', 'desc'],
      required: false,
    }),
    cancelled: Flags.boolean({
      description: 'Filter by cancelled status',
      allowNo: true,
      required: false,
    }),
    draft: Flags.boolean({
      description: 'Filter by draft status',
      allowNo: true,
      required: false,
    }),
    private: Flags.boolean({
      description: 'Filter by private status',
      allowNo: true,
      required: false,
    }),
    'include-private': Flags.boolean({
      description: 'Include private series in results',
      required: false,
    }),
    'include-speakers': Flags.boolean({
      description: 'Include speaker information for each series',
      required: false,
    }),
    'include-stats': Flags.boolean({
      description: 'Include performance statistics for each series',
      required: false,
    }),
    'include-albums': Flags.boolean({
      description: 'Include category information for each series',
      required: false,
    }),
    fields: Flags.string({
      description: 'Comma-separated list of fields to return in the API response',
      required: false,
    }),
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'GET /live/series/list',
    auth_scope: 'read' as const,
    output_shape: {
      type: 'table' as const,
      columns: ['ID', 'Name', 'Status', 'Created'],
    },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(WebinarSeriesList)
    this.printWorkspaceHeader()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buildQuery = (page: number, size: number): Record<string, any> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const q: Record<string, any> = { p: page, size }
      if (flags.search !== undefined) q.search = flags.search
      if (flags['live-series-id'] !== undefined) q.live_series_id = flags['live-series-id']
      if (flags['live-id'] !== undefined) q.live_id = flags['live-id']
      if (flags['album-id'] !== undefined) q.album_id = flags['album-id']
      if (flags['user-id'] !== undefined) q.user_id = flags['user-id']
      if (flags['series-type'] !== undefined) q.series_type = flags['series-type']
      if (flags.ordering !== undefined) q.orderby = flags.ordering
      if (flags.order !== undefined) q.order = flags.order
      if (flags.cancelled !== undefined) q.cancelled_p = flags.cancelled
      if (flags.draft !== undefined) q.draft_p = flags.draft
      if (flags.private !== undefined) q.private_p = flags.private
      if (flags['include-private']) q.include_private_p = true
      if (flags['include-speakers']) q.include_speakers_p = true
      if (flags['include-stats']) q.include_stats_p = true
      if (flags['include-albums']) q.include_albums_p = true
      if (flags.fields !== undefined) q.fields = flags.fields
      return q
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const series = await fetchAllPages<any>(async (page, size) => {
      const { data, error } = await this.apiClient.GET('/live/series/list', {
        params: { query: buildQuery(page, size) },
      })
      if (error) {
        this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resp = data as any
      const items: unknown[] = Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : []
      return { data: items, total_count: resp?.total_count }
    })

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: series,
        summary: `${series.length} series`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'series' },
        ],
      })
    }

    if (series.length === 0) {
      this.log('No series found.')
      return
    }

    const headers = ['ID', 'Name', 'Status', 'Created']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = series.map((s: any) => [
      String(s.live_series_id ?? ''),
      applyCliTerms(String(s.name ?? '')),
      String(s.status ?? ''),
      String(s.creation_date_ansi ?? ''),
    ])

    const table = renderTable(headers, rows)
    this.log(table.toString())
    this.log(chalk.dim(`${series.length} series`))
  }
}
