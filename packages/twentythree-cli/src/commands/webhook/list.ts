import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Webhook list command — lists all webhook subscriptions (WHK-01).
 *
 * Threat mitigations:
 *   T-08-05: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class WebhookList extends AuthenticatedCommand<typeof WebhookList> {
  static description = 'List webhook subscriptions for the active workspace'

  static examples = [
    '<%= config.bin %> webhook list',
    '<%= config.bin %> webhook list --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'GET /webhook/list',
    auth_scope: 'read' as const,
    output_shape: {
      type: 'table' as const,
      columns: ['ID', 'Event', 'Target URL'],
    },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const {} = await this.parse(WebhookList)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/webhook/list', {})

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
        summary: `${rows.length} webhook(s)`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webhook' },
        ],
      })
    }

    if (rows.length === 0) {
      this.log('No webhooks found.')
      return
    }

    const headers = ['ID', 'Event', 'Target URL']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableRows = rows.map((r: any) => [
      String(r.webhook_id ?? ''),
      String(r.event ?? ''),
      String(r.target_url ?? ''),
    ])

    const table = renderTable(headers, tableRows)
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} webhook(s)`))
  }
}
