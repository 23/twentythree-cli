import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Action types command — lists available action type definitions.
 *
 * Calls GET /action/types with optional exclude_internal_p flag.
 * Renders a table with columns [Type, Name/Description].
 */
export default class ActionTypes extends AuthenticatedCommand<typeof ActionTypes> {
  static description = 'List available CTA action types'

  static examples = [
    '<%= config.bin %> action types',
    '<%= config.bin %> action types --exclude-internal',
    '<%= config.bin %> action types --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'GET /action/types',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['Type', 'Name / Description'] },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'exclude-internal': Flags.boolean({
      description: 'Exclude internal action types from the list',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(ActionTypes)

    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/action/types', {
      params: {
        query: {
          exclude_internal_p: flags['exclude-internal'] ? true : undefined,
        },
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: any[] = Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: items,
        summary: `${items.length} action type${items.length === 1 ? '' : 's'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'action/types' },
        ],
      })
    }

    if (items.length === 0) {
      this.log('No action types found.')
      return
    }

    const headers = ['Type', 'Name / Description']
    const rows = items.map((item: any) => [
      applyCliTerms(String(item.type ?? item.action_type ?? '')),
      applyCliTerms(String(item.name ?? item.description ?? item.action_name ?? '')),
    ])

    const table = renderTable(headers, rows)
    this.log(table.toString())
    this.log(chalk.dim(`${items.length} action type${items.length === 1 ? '' : 's'}`))
  }
}
