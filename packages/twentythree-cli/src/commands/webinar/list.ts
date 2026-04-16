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
    'include-private': Flags.boolean({
      description: 'Include private webinars in the results',
      allowNo: true,
      required: false,
    }),
    'include-private-p': Flags.string({ hidden: true, required: false }),
    status: Flags.string({
      description: 'Filter by status: upcoming, live, or previous',
      required: false,
    }),
    search: Flags.string({
      description: 'Search webinars by keyword',
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
    let webinars: any[]

    if (flags.all) {
      // Paginate through all results
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      webinars = await fetchAllPages<any>(async (page, size) => {
        const { data, error } = await this.apiClient.GET('/live/list', {
          params: {
            query: {
              p: page,
              size,
              include_private_p: includePrivate ?? undefined,
              live_status: flags.status as any,
              search: flags.search,
              include_streaming_details_p: false,
            },
          },
        })
        if (error) {
          this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const resp = data as any
        const items: unknown[] = Array.isArray(resp?.data)
          ? resp.data
          : resp?.data
          ? [resp.data]
          : []
        return { data: items, total_count: resp?.total_count }
      })
    } else {
      // Single page up to --limit (default 20) — fast path
      const { data, error } = await this.apiClient.GET('/live/list', {
        params: {
          query: {
            p: 1,
            size: flags.limit,
            include_private_p: includePrivate ?? undefined,
            live_status: flags.status as any,
            search: flags.search,
            include_streaming_details_p: false,
          },
        },
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
      // CRITICAL: use live_id ?? photo_id defensively (schema mismatch)
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
