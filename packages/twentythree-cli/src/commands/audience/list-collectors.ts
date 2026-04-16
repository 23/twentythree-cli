import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Audience list-collectors command — list collectors linked to audience (AUD-11).
 *
 * Non-paginated list of collectors (forms/actions) tied to audience registration.
 * No pagination flags per spec.
 */
export default class AudienceListCollectors extends AuthenticatedCommand<typeof AudienceListCollectors> {
  static description = 'List collectors linked to audience'

  static agentMetadata = {
    api_endpoint: 'GET /audience/list-collectors',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['Action ID', 'Name', 'Start', 'End', 'Require Email'] },
    side_effects: 'none' as const,
  }

  static examples = [
    '<%= config.bin %> audience list-collectors',
    '<%= config.bin %> audience list-collectors --object-id 123',
    '<%= config.bin %> audience list-collectors --action-id 456 --json',
  ]

  static enableJsonFlag = true

  // No pagination flags — /audience/list-collectors has no p/size/offset per spec
  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'object-id': Flags.string({
      description: 'Filter by object ID',
      required: false,
    }),
    'action-id': Flags.string({
      description: 'Filter by action ID',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AudienceListCollectors)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/audience/list-collectors', {
      params: {
        query: {
          object_id: flags['object-id'] ? Number(flags['object-id']) : undefined,
          action_id: flags['action-id'] ? Number(flags['action-id']) : undefined,
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
        summary: `${rows.length} collector(s)`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'audience' },
        ],
      })
    }

    if (rows.length === 0) {
      this.log('No collectors found.')
      return
    }

    const headers = ['Action ID', 'Name', 'Start', 'End', 'Require Email']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableRows = rows.map((r: any) => [
      String(r.action_id ?? ''),
      String(r.name ?? ''),
      String(r.start_time ?? ''),
      String(r.end_time ?? ''),
      String(r.require_email_p ?? ''),
    ])

    const table = renderTable(headers, tableRows)
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} collector(s)`))
  }
}
