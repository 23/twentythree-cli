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

    const { data, error } = await this.apiClient.GET('/user/list', {
      params: {
        query: {
          search: flags.search,
          user_id: flags['user-id'] ? Number(flags['user-id']) : undefined,
          p: flags.page,
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
