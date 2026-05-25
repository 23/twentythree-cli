import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { fetchAllPages } from '../../lib/pagination.js'
import { renderTable, formatJsonOutput, parseBoolParam, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Webinar list command — lists webinars in the active workspace.
 * Defaults to the first 20 results; use --limit N or --all for more.
 * Streaming details are excluded by default (include_streaming_details_p: false)
 * to avoid slow per-webinar credential fetches.
 *
 * CRITICAL schema note: API schema uses photo_id but runtime response includes live_id.
 * Use `item.live_id ?? item.photo_id` defensively for the ID column.
 */
export default class WebinarList extends AuthenticatedCommand<typeof WebinarList> {
  static description = 'List webinars in the active workspace'

  static examples = [
    '<%= config.bin %> webinar list',
    '<%= config.bin %> webinar list --limit 50',
    '<%= config.bin %> webinar list --all',
    '<%= config.bin %> webinar list --status upcoming --json',
    '<%= config.bin %> webinar list --live-format webinar --ordering live_date --order asc',
    '<%= config.bin %> webinar list --user-id me --include-speakers --json',
    '<%= config.bin %> webinar list --live-series-id 42 --all --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    limit: Flags.integer({
      description: 'Maximum number of webinars to return (default: 20)',
      default: 20,
    }),
    all: Flags.boolean({
      description: 'Fetch all webinars across all pages (overrides --limit)',
      required: false,
    }),
    search: Flags.string({
      description: 'Search webinars by keyword',
      required: false,
    }),
    status: Flags.string({
      description: 'Filter by status: upcoming, live, or previous',
      options: ['upcoming', 'live', 'previous'],
      required: false,
    }),
    'include-private': Flags.boolean({
      description: 'Include private webinars in the results',
      allowNo: true,
      required: false,
    }),
    'include-private-p': Flags.string({ hidden: true, required: false }),
    'live-id': Flags.integer({
      description: 'Limit to a single webinar by ID',
      required: false,
    }),
    'album-id': Flags.integer({
      description: 'Filter to webinars in a specific category',
      required: false,
    }),
    'user-id': Flags.string({
      description: 'Filter to webinars created by a specific user (use "me" for the authenticated user)',
      required: false,
    }),
    'live-format': Flags.string({
      description: 'Filter by live format',
      options: ['event', 'webinar'],
      required: false,
    }),
    'live-series-id': Flags.integer({
      description: 'Filter to webinars in a specific series',
      required: false,
    }),
    ordering: Flags.string({
      description: 'Field to order results by',
      options: ['private', 'promoted', 'streaming', 'broadcasting', 'name', 'live_label', 'live_status', 'live_date', 'creation_date'],
      required: false,
    }),
    order: Flags.string({
      description: 'Sort direction',
      options: ['asc', 'desc'],
      required: false,
    }),
    promoted: Flags.boolean({
      description: 'Filter by promoted status',
      allowNo: true,
      required: false,
    }),
    draft: Flags.boolean({
      description: 'Filter by draft status',
      allowNo: true,
      required: false,
    }),
    cancelled: Flags.boolean({
      description: 'Filter by cancelled status',
      allowNo: true,
      required: false,
    }),
    streaming: Flags.boolean({
      description: 'Filter to currently streaming webinars only',
      required: false,
    }),
    template: Flags.boolean({
      description: 'Filter to webinar templates only',
      required: false,
    }),
    'include-stats': Flags.boolean({
      description: 'Include performance statistics for each webinar',
      required: false,
    }),
    'include-speakers': Flags.boolean({
      description: 'Include speaker information for each webinar',
      required: false,
    }),
    'include-albums': Flags.boolean({
      description: 'Include category information for each webinar',
      required: false,
    }),
    fields: Flags.string({
      description: 'Comma-separated list of fields to return in the API response',
      required: false,
    }),
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'GET /live/list',
    auth_scope: 'read' as const,
    output_shape: {
      type: 'table' as const,
      columns: ['ID', 'Title', 'Status', 'Date', 'Private'],
    },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(WebinarList)
    this.printWorkspaceHeader()

    const includePrivate = parseBoolParam(flags['include-private'], flags['include-private-p'])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buildQuery = (page: number, size: number): Record<string, any> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const q: Record<string, any> = {
        p: page,
        size,
        include_streaming_details_p: false,
      }
      if (includePrivate !== undefined) q.include_private_p = includePrivate
      if (flags.status !== undefined) q.live_status = flags.status
      if (flags.search !== undefined) q.search = flags.search
      if (flags['live-id'] !== undefined) q.live_id = flags['live-id']
      if (flags['album-id'] !== undefined) q.album_id = flags['album-id']
      if (flags['user-id'] !== undefined) q.user_id = flags['user-id']
      if (flags['live-format'] !== undefined) q.live_format = flags['live-format']
      if (flags['live-series-id'] !== undefined) q.live_series_id = flags['live-series-id']
      if (flags.ordering !== undefined) q.ordering = flags.ordering
      if (flags.order !== undefined) q.order = flags.order
      if (flags.promoted !== undefined) q.promoted_p = flags.promoted
      if (flags.draft !== undefined) q.draft_p = flags.draft
      if (flags.cancelled !== undefined) q.cancelled_p = flags.cancelled
      if (flags.streaming) q.streaming_p = true
      if (flags.template) q.template_p = true
      if (flags['include-stats']) q.include_stats_p = true
      if (flags['include-speakers']) q.include_speakers_p = true
      if (flags['include-albums']) q.include_albums_p = true
      if (flags.fields !== undefined) q.fields = flags.fields
      return q
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let webinars: any[]

    if (flags.all) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      webinars = await fetchAllPages<any>(async (page, size) => {
        const { data, error } = await this.apiClient.GET('/live/list', {
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
    } else {
      const { data, error } = await this.apiClient.GET('/live/list', {
        params: { query: buildQuery(1, flags.limit) },
      })
      if (error) {
        this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resp = data as any
      webinars = Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : []
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: webinars,
        summary: `${webinars.length} webinar${webinars.length === 1 ? '' : 's'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar' },
        ],
      })
    }

    if (webinars.length === 0) {
      this.log('No webinars found.')
      return
    }

    const headers = ['ID', 'Title', 'Status', 'Date', 'Private']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = webinars.map((w: any) => [
      String(w.live_id ?? w.photo_id ?? ''),
      applyCliTerms(String(w.name ?? w.title ?? '')),
      String(w.live_status ?? ''),
      String(w.live_date ?? ''),
      w.private_p ? 'yes' : 'no',
    ])

    const table = renderTable(headers, rows)
    this.log(table.toString())
    this.log(chalk.dim(`${webinars.length} webinar${webinars.length === 1 ? '' : 's'}`))
  }
}
