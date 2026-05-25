import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { fetchAllPages } from '../../lib/pagination.js'
import { renderTable, formatJsonOutput, parseBoolParam, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Category list command — lists all categories in the active workspace with auto-pagination.
 * Renders a cli-table3 table with columns: ID, Title, Hidden, Created.
 * Supports --json output with { ok, data, summary, breadcrumbs } shape (CLI-01).
 *
 * Maps to the /album/list API endpoint.
 * "album" is the API term; "category" is the CLI user-facing term (term-map.ts).
 *
 * Threat mitigations:
 *   T-04-04: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class CategoryList extends AuthenticatedCommand<typeof CategoryList> {
  static description = 'List categories in the active workspace'

  static agentMetadata = {
    api_endpoint: 'GET /album/list',
    auth_scope: 'anonymous' as const,
    output_shape: { type: 'table' as const, columns: ['ID', 'Title', 'Hidden', 'Created'] },
    side_effects: 'none' as const,
  }

  static examples = [
    '<%= config.bin %> category list',
    '<%= config.bin %> category list --json',
    '<%= config.bin %> category list --include-hidden',
    '<%= config.bin %> category list --search "webinar" --orderby title --order asc',
    '<%= config.bin %> category list --user-id 42 --json',
    '<%= config.bin %> category list --photo-id 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    search: Flags.string({
      description: 'Search categories by title or keyword',
      required: false,
    }),
    'album-id': Flags.integer({
      description: 'Return information for a specific category by its ID',
      required: false,
    }),
    'photo-id': Flags.integer({
      description: 'Filter to categories that contain a specific video',
      required: false,
    }),
    'user-id': Flags.integer({
      description: 'Filter by the ID of the user that created the category',
      required: false,
    }),
    'include-hidden': Flags.boolean({
      description: 'Include hidden categories in the results',
      allowNo: true,
      required: false,
    }),
    'include-hidden-p': Flags.string({ hidden: true, required: false }),
    orderby: Flags.string({
      description: 'Field to order results by',
      options: ['sortkey', 'title', 'editing_date', 'creation_date', 'live_create'],
      required: false,
    }),
    order: Flags.string({
      description: 'Sort direction',
      options: ['asc', 'desc'],
      required: false,
    }),
    fields: Flags.string({
      description: 'Comma-separated list of fields to return in the API response',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(CategoryList)
    this.printWorkspaceHeader()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categories = await fetchAllPages<any>(async (page, size) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: Record<string, any> = { p: page, size }
      const includeHidden = parseBoolParam(flags['include-hidden'], flags['include-hidden-p'])
      if (includeHidden !== undefined) query.include_hidden_p = includeHidden
      if (flags.search !== undefined) query.search = flags.search
      if (flags['album-id'] !== undefined) query.album_id = flags['album-id']
      if (flags['photo-id'] !== undefined) query.photo_id = flags['photo-id']
      if (flags['user-id'] !== undefined) query.user_id = flags['user-id']
      if (flags.orderby !== undefined) query.orderby = flags.orderby
      if (flags.order !== undefined) query.order = flags.order
      if (flags.fields !== undefined) query.fields = flags.fields

      const { data, error } = await this.apiClient.GET('/album/list', {
        params: { query },
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
        data: categories,
        summary: `${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'category' },
        ],
      })
    }

    if (categories.length === 0) {
      this.log('No categories found.')
      return
    }

    const headers = ['ID', 'Title', 'Hidden', 'Created']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = categories.map((c: any) => [
      String(c.album_id ?? ''),
      applyCliTerms(String(c.title ?? '')),
      c.hide_p ? 'yes' : 'no',
      String(c.creation_date_ansi ?? ''),
    ])

    const table = renderTable(headers, rows)
    this.log(table.toString())
    this.log(chalk.dim(`${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}`))
  }
}
