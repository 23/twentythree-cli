import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Player styles command — lists available player visual styles.
 *
 * Each entry includes a style key, human-readable name, and icon identifier.
 */
export default class PlayerStyles extends AuthenticatedCommand<typeof PlayerStyles> {
  static description = 'List available player visual styles'

  static agentMetadata = {
    api_endpoint: 'GET /player/styles',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['Style', 'Name', 'Icon'] },
    side_effects: 'none' as const,
  }

  static examples = [
    '<%= config.bin %> player styles',
    '<%= config.bin %> player styles --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    fields: Flags.string({
      description: 'Comma-separated list of fields to return',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(PlayerStyles)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/player/styles', {
      params: {
        query: {
          fields: flags.fields,
        },
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    const items: unknown[] = Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: items,
        summary: `${items.length} player style${items.length === 1 ? '' : 's'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'player' },
        ],
      })
    }

    if (items.length === 0) {
      this.log('No player styles found.')
      return
    }

    const headers = ['Style', 'Name', 'Icon']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = items.map((s: any) => [
      String(s.style ?? ''),
      applyCliTerms(String(s.name ?? '')),
      String(s.icon ?? ''),
    ])

    const table = renderTable(headers, rows)
    this.log(table.toString())
    this.log(chalk.dim(`${items.length} player style${items.length === 1 ? '' : 's'}`))
  }
}
