import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, parseBoolParam, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Spot list command — lists all spots in the active workspace.
 *
 * Maps to the GET /spot/list API endpoint.
 * Spots are embed containers in TwentyThree.
 *
 * Threat mitigations:
 *   T-08-02: extends AuthenticatedCommand — anonymous mode rejected with AUTH-10 error
 */
export default class SpotList extends AuthenticatedCommand<typeof SpotList> {
  static description = 'List spots in the active workspace'

  static examples = [
    '<%= config.bin %> spot list',
    '<%= config.bin %> spot list --search "my spot"',
    '<%= config.bin %> spot list --active',
    '<%= config.bin %> spot list --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    page: Flags.integer({
      description: 'Page number',
      required: false,
    }),
    size: Flags.integer({
      description: 'Number of results per page',
      required: false,
    }),
    search: Flags.string({
      description: 'Search term',
      required: false,
    }),
    'spot-type': Flags.string({
      description: 'Filter by spot type',
      required: false,
    }),
    active: Flags.boolean({
      description: 'Filter by active status',
      allowNo: true,
      required: false,
    }),
    'active-p': Flags.string({ hidden: true, required: false }),
    orderby: Flags.string({
      description: 'Field to order results by',
      required: false,
    }),
    order: Flags.string({
      description: 'Sort order (asc or desc)',
      required: false,
    }),
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'GET /spot/list',
    auth_scope: 'read' as const,
    output_shape: {
      type: 'table' as const,
      columns: ['ID', 'Name', 'Type', 'Active'],
    },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(SpotList)
    this.printWorkspaceHeader()

    const activeVal = parseBoolParam(flags.active, flags['active-p'])

    const { data, error } = await this.apiClient.GET('/spot/list', {
      params: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        query: {
          search: flags.search,
          spot_type: flags['spot-type'] as any,
          active_p: activeVal !== undefined ? activeVal : undefined,
          p: flags.page,
          size: flags.size,
          orderby: flags.orderby as any,
          order: flags.order as any,
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
        summary: `${rows.length} spot(s)`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'spot' },
        ],
      })
    }

    if (rows.length === 0) {
      this.log('No spots found.')
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableRows = rows.map((r: any) => [
      String(r.spot_id ?? ''),
      String(r.spot_name ?? ''),
      String(r.spot_type ?? ''),
      String(r.active_p ?? ''),
    ])

    const table = renderTable(['ID', 'Name', 'Type', 'Active'], tableRows)
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} spot(s)`))
  }
}
