import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Audience list command — lists audience members in the active workspace (AUD-01).
 *
 * Exposes pagination directly (D-4: no fetchAllPages for audience list).
 * Renders a cli-table3 table with: UUID, Name, Email, Company, Score, Timelines.
 */
export default class AudienceList extends AuthenticatedCommand<typeof AudienceList> {
  static description = 'List audience members'

  static examples = [
    '<%= config.bin %> audience list',
    '<%= config.bin %> audience list --page 2 --size 50',
    '<%= config.bin %> audience list --search "john" --identified --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    page: Flags.integer({
      description: 'Page number',
      required: false,
    }),
    size: Flags.integer({
      description: 'Page size (max 500)',
      required: false,
    }),
    offset: Flags.integer({
      description: 'Offset for pagination',
      required: false,
    }),
    orderby: Flags.string({
      description: 'Order by field (recent, timeline_count, score, first)',
      required: false,
    }),
    order: Flags.string({
      description: 'Sort direction (asc/desc)',
      required: false,
    }),
    search: Flags.string({
      description: 'Free-text search across names and emails',
      required: false,
    }),
    identified: Flags.boolean({
      description: 'Filter to identified profiles only',
      required: false,
      allowNo: true,
    }),
    objects: Flags.string({
      description: 'Filter by viewed object IDs (space-separated)',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AudienceList)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/audience/list', {
      params: {
        query: {
          p: flags.page,
          size: flags.size,
          offset: flags.offset,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          orderby: flags.orderby as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          order: flags.order as any,
          search: flags.search,
          identified: flags.identified,
          objects: flags.objects,
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
        summary: `${rows.length} member(s)`,
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

    const headers = ['UUID', 'Name', 'Email', 'Company', 'Score', 'Timelines']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableRows = rows.map((r: any) => [
      String(r.uuid ?? ''),
      String(r.name ?? ''),
      String(r.email ?? ''),
      String(r.company ?? ''),
      String(r.score ?? ''),
      String(r.timeline_count ?? ''),
    ])

    const table = renderTable(headers, tableRows)
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} member(s)`))
  }
}
