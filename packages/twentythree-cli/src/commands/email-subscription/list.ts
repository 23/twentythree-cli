import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'
import { fetchAllPages } from '../../lib/pagination.js'

/**
 * Email subscription list command — lists the addresses that receive a digest
 * of newly published videos.
 *
 * Maps to GET /email-subscription/list. The endpoint is paginated (default 50,
 * max 500 per page); without --page/--size the command fetches every page.
 */
export default class EmailSubscriptionList extends AuthenticatedCommand<typeof EmailSubscriptionList> {
  static description = 'List email subscriptions to new-video digests in the active workspace'

  static examples = [
    '<%= config.bin %> email-subscription list',
    '<%= config.bin %> email-subscription list --email anna@example.com --json',
    '<%= config.bin %> email-subscription list --user-id 42 --json',
    '<%= config.bin %> email-subscription list --page 2 --size 50',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    email: Flags.string({
      description: 'Only return subscriptions for this email address',
      required: false,
    }),
    'user-id': Flags.integer({
      description: 'Only return subscriptions belonging to this user',
      required: false,
    }),
    page: Flags.integer({
      description: 'Page number (default: fetch all pages)',
      required: false,
    }),
    size: Flags.integer({
      description: 'Number of results per page (default 50, max 500)',
      required: false,
    }),
    fields: Flags.string({
      description: 'Comma-separated list of fields to return in the API response',
      required: false,
    }),
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'GET /email-subscription/list',
    auth_scope: 'write' as const,
    output_shape: {
      type: 'table' as const,
      columns: ['ID', 'Email', 'User', 'Scope', 'Frequency', 'Created'],
    },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(EmailSubscriptionList)
    this.printWorkspaceHeader()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseQuery: Record<string, any> = {}
    if (flags.email !== undefined) baseQuery.email = flags.email
    if (flags['user-id'] !== undefined) baseQuery.user_id = flags['user-id']
    if (flags.fields !== undefined) baseQuery.fields = flags.fields

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fetchPage = async (p: number, size: number): Promise<{ data?: any[]; total_count?: number }> => {
      const { data, error } = await this.apiClient.GET('/email-subscription/list', {
        params: { query: { ...baseQuery, p, size } },
      })
      if (error) {
        this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resp = data as any
      return {
        data: Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : [],
        total_count: Number(resp?.total_count ?? 0),
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let rows: any[]
    if (flags.page !== undefined || flags.size !== undefined) {
      rows = (await fetchPage(flags.page ?? 1, flags.size ?? 50)).data ?? []
    } else {
      rows = await fetchAllPages(fetchPage)
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: rows,
        summary: `${rows.length} email subscription(s)`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'email-subscription' },
        ],
      })
    }

    if (rows.length === 0) {
      this.log('No email subscriptions found.')
      return
    }

    const headers = ['ID', 'Email', 'User', 'Scope', 'Frequency', 'Created']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableRows = rows.map((r: any) => [
      String(r.photo_subscription_id ?? ''),
      String(r.email ?? ''),
      String(r.full_name || r.username || r.user_id || ''),
      String(r.object_pretty ?? ''),
      String(r.frequency ?? ''),
      String(r.creation_time_fmt ?? r.creation_time_ansi ?? ''),
    ])

    this.log(renderTable(headers, tableRows).toString())
    this.log(chalk.dim(`${rows.length} email subscription(s)`))
  }
}
