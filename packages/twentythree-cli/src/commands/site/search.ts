import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Site search command — searches across all content types in the workspace.
 *
 * Returns a table of results with type, title, and ID columns.
 * Object types (photo, album, live) are mapped to modern CLI terms via applyCliTerms.
 * Threat mitigations:
 *   T-08-21: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class SiteSearch extends AuthenticatedCommand<typeof SiteSearch> {
  static description = 'Search for content across the active workspace'

  static examples = [
    '<%= config.bin %> site search --search "quarterly report"',
    '<%= config.bin %> site search --search "demo" --search-in title --size 20',
    '<%= config.bin %> site search --search "webinar" --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    search: Flags.string({
      description: 'Search query string',
      required: false,
    }),
    'search-in': Flags.string({
      description: 'Where to search (e.g. title, description, tags)',
      required: false,
    }),
    selection: Flags.string({
      description: 'Filter by content selection',
      required: false,
    }),
    size: Flags.integer({
      description: 'Number of results to return',
      required: false,
    }),
  }

  static agentMetadata = {
    api_endpoint: 'GET /site/search',
    auth_scope: 'read' as const,
    output_shape: {
      type: 'table' as const,
      columns: ['Type', 'Title', 'ID'],
    },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(SiteSearch)

    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/site/search', {
      params: {
        query: {
          search: flags.search,
          search_in: flags['search-in'],
          selection: flags.selection,
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
        summary: `${rows.length} result(s)`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'site' },
        ],
      })
    }

    if (rows.length === 0) {
      this.log('No results found.')
      return
    }

    const table = renderTable(
      ['Type', 'Title', 'ID'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rows.map((r: any) => [
        applyCliTerms(String(r.object_type ?? '')),
        String(r.title ?? r.label ?? ''),
        String(r.object_id ?? ''),
      ]),
    )
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} result(s)`))
  }
}
