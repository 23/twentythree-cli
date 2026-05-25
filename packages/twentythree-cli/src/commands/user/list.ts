import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR, resolveUrl } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * User list command — lists users in the active workspace (USR-01).
 *
 * Maps to the GET /user/list API endpoint.
 */
export default class UserList extends AuthenticatedCommand<typeof UserList> {
  static description = 'List users in the workspace'

  static examples = [
    '<%= config.bin %> user list',
    '<%= config.bin %> user list --search "alice"',
    '<%= config.bin %> user list --page 2 --size 20',
    '<%= config.bin %> user list --json',
    '<%= config.bin %> user list --only-admins --json',
    '<%= config.bin %> user list --user-group-id 5 --orderby display_name --json',
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
      description: 'Search query (username, display name, or email)',
      required: false,
    }),
    'user-id': Flags.string({
      description: 'Filter by user ID',
      required: false,
    }),
    'user-group-id': Flags.string({
      description: 'Filter to users assigned to a specific user group',
      required: false,
    }),
    'only-admins': Flags.boolean({
      description: 'Return only admin users',
      required: false,
    }),
    'only-owner': Flags.boolean({
      description: 'Return only the workspace owner',
      required: false,
    }),
    seated: Flags.boolean({
      description: 'Filter by seated status',
      allowNo: true,
      required: false,
    }),
    'include-disabled-login': Flags.boolean({
      description: 'Include users with disabled login',
      required: false,
    }),
    'include-metrics': Flags.boolean({
      description: 'Include per-user performance metrics',
      required: false,
    }),
    orderby: Flags.string({
      description: 'Field to order results by',
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

  static agentMetadata = {
    api_endpoint: 'GET /user/list',
    auth_scope: 'admin',
    output_shape: { type: 'table', columns: ['ID', 'Username', 'Display Name', 'URL'] },
    side_effects: 'none',
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(UserList)
    this.printWorkspaceHeader()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {}
    if (flags.search !== undefined) query.search = flags.search
    if (flags['user-id'] !== undefined) query.user_id = Number(flags['user-id'])
    if (flags['user-group-id'] !== undefined) query.user_group_id = flags['user-group-id']
    if (flags['only-admins']) query.only_admins_p = true
    if (flags['only-owner']) query.only_owner_p = true
    if (flags.seated !== undefined) query.seated_p = flags.seated
    if (flags['include-disabled-login']) query.include_disabled_login_p = true
    if (flags['include-metrics']) query.include_metrics_p = true
    if (flags.orderby !== undefined) query.orderby = flags.orderby
    if (flags.order !== undefined) query.order = flags.order
    if (flags.fields !== undefined) query.fields = flags.fields
    if (flags.page !== undefined) query.p = flags.page
    if (flags.size !== undefined) query.size = flags.size

    const { data, error } = await this.apiClient.GET('/user/list', {
      params: { query },
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
        summary: `${rows.length} user(s)`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'user' },
        ],
      })
    }

    if (rows.length === 0) {
      this.log('No users found.')
      return
    }

    const headers = ['ID', 'Username', 'Display Name', 'URL']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableRows = rows.map((r: any) => [
      String(r.user_id ?? ''),
      String(r.username ?? ''),
      String(r.display_name ?? ''),
      String(resolveUrl(r.url, this.activeWorkspace.api_base_url) ?? ''),
    ])

    const table = renderTable(headers, tableRows)
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} user(s)`))
  }
}
