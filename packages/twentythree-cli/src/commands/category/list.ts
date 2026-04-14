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

  static examples = [
    '<%= config.bin %> category list',
    '<%= config.bin %> category list --json',
    '<%= config.bin %> category list --include-hidden',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'include-hidden': Flags.boolean({
      description: 'Include hidden categories in the results',
      allowNo: true,
      required: false,
    }),
    'include-hidden-p': Flags.string({ hidden: true, required: false }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(CategoryList)
    this.printWorkspaceHeader()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categories = await fetchAllPages<any>(async (page, size) => {
      const { data, error } = await this.apiClient.GET('/album/list', {
        params: {
          query: {
            p: page,
            size,
            include_hidden_p: parseBoolParam(flags['include-hidden'], flags['include-hidden-p']) ?? undefined,
          },
        },
      })
      if (error) {
        this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
      }
      // The API returns paginated items under data (typed as single object in schema
      // but actual response contains a list-like structure with total_count at top level).
      // Cast to any to access the real runtime shape.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resp = data as any
      const items: unknown[] = Array.isArray(resp?.data)
        ? resp.data
        : resp?.data
        ? [resp.data]
        : []
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
