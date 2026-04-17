import { Flags } from '@oclif/core'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, renderTable, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * App list command — returns paginated list of player design apps on the workspace.
 */
export default class AppList extends AuthenticatedCommand<typeof AppList> {
  static description = 'List player design apps on the active workspace'

  static examples = [
    '<%= config.bin %> app list',
    '<%= config.bin %> app list --app-id 42',
    '<%= config.bin %> app list --page 2 --size 50',
    '<%= config.bin %> app list --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /app/list',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['ID', 'Name', 'Type', 'Description'] },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'app-id': Flags.integer({
      description: 'Filter results to a specific app ID',
      required: false,
    }),
    page: Flags.integer({
      description: 'Page offset',
      required: false,
    }),
    size: Flags.integer({
      description: 'Number of results per page (default 20, max 100)',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AppList)

    this.printWorkspaceHeader()

    const body: Record<string, unknown> = {}
    if (flags['app-id'] !== undefined) body.app_id = flags['app-id']
    if (flags.page !== undefined) body.p = flags.page
    if (flags.size !== undefined) body.size = flags.size

    const { data, error } = await this.apiClient.POST('/app/list', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apps: any[] = (data as any)?.apps ?? (data as any)?.data ?? []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: apps,
        summary: 'App list',
        breadcrumbs: [{ domain: this.activeWorkspace.domain }, { resource: 'app' }],
      })
    }

    if (apps.length === 0) {
      this.log('No apps found.')
      return
    }

    const table = renderTable(
      ['ID', 'Name', 'Type', 'Description'],
      apps.map((a: any) => [
        String(a.app_id ?? a.id ?? ''),
        String(a.name ?? ''),
        String(a.type ?? ''),
        String(a.description ?? ''),
      ]),
    )

    this.log(table.toString())
  }
}
