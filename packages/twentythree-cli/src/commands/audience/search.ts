import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Audience search command — searches audience members by text (AUD-02).
 *
 * CRITICAL: /audience/search is a GET endpoint (Pitfall 3). Uses GET not POST.
 * The --text flag is required per the OpenAPI spec.
 */
export default class AudienceSearch extends AuthenticatedCommand<typeof AudienceSearch> {
  static description = 'Search audience members'

  static agentMetadata = {
    api_endpoint: 'GET /audience/search',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['UUID', 'Name', 'Email', 'Company', 'Score', 'Last Seen'] },
    side_effects: 'none' as const,
  }

  static examples = [
    '<%= config.bin %> audience search --text "john doe"',
    '<%= config.bin %> audience search --text "acme" --size 20 --json',
    '<%= config.bin %> audience search --text "jane" --orderby score --order desc',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    text: Flags.string({
      description: 'Search text (required)',
      required: true,
    }),
    size: Flags.integer({
      description: 'Number of results',
      required: false,
    }),
    offset: Flags.integer({
      description: 'Results offset',
      required: false,
    }),
    orderby: Flags.string({
      description: 'Order by field',
      required: false,
    }),
    order: Flags.string({
      description: 'Sort direction (asc/desc)',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AudienceSearch)
    this.printWorkspaceHeader()

    // CRITICAL: GET endpoint (Pitfall 3) — not POST
    const { data, error } = await this.apiClient.GET('/audience/search', {
      params: {
        query: {
          text: flags.text,
          size: flags.size,
          offset: flags.offset,
          orderby: flags.orderby,
          order: flags.order,
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
          { resource: 'audience' },
        ],
      })
    }

    if (rows.length === 0) {
      this.log('No audience members found.')
      return
    }

    const headers = ['UUID', 'Name', 'Email', 'Company', 'Score', 'Last Seen']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableRows = rows.map((r: any) => [
      String(r.uuid ?? ''),
      String(r.name ?? ''),
      String(r.email ?? ''),
      String(r.company ?? ''),
      String(r.score ?? ''),
      String(r.last_seen ?? ''),
    ])

    const table = renderTable(headers, tableRows)
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} result(s)`))
  }
}
