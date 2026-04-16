import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, parseBoolParam, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Webhook events command — lists available webhook event types (WHK-04).
 *
 * Threat mitigations:
 *   T-08-05: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class WebhookEvents extends AuthenticatedCommand<typeof WebhookEvents> {
  static description = 'List available webhook event types'

  static examples = [
    '<%= config.bin %> webhook events',
    '<%= config.bin %> webhook events --test-authentication',
    '<%= config.bin %> webhook events --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'test-authentication': Flags.boolean({
      description: 'Include test authentication events',
      required: false,
    }),
    'test-authentication-p': Flags.string({ hidden: true, required: false }),
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'GET /webhook/events',
    auth_scope: 'read' as const,
    output_shape: {
      type: 'table' as const,
      columns: ['Event'],
    },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(WebhookEvents)
    this.printWorkspaceHeader()

    const testAuthVal = parseBoolParam(flags['test-authentication'], flags['test-authentication-p'])

    const { data, error } = await this.apiClient.GET('/webhook/events', {
      params: {
        query: {
          test_authentication_p: testAuthVal !== undefined ? (testAuthVal ? 1 : 0) : undefined,
        } as any,
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
        summary: `${rows.length} event type(s)`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webhook' },
        ],
      })
    }

    if (rows.length === 0) {
      this.log('No event types found.')
      return
    }

    const headers = ['Event']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableRows = rows.map((item: any) => [String(item.event ?? item)])

    const table = renderTable(headers, tableRows)
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} event type(s)`))
  }
}
