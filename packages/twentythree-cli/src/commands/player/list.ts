import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { fetchAllPages } from '../../lib/pagination.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Player list command — lists all players in the active workspace.
 *
 * PITFALL 2: /player/list is POST (not GET). Pagination params go in the form body.
 *
 * Renders a cli-table3 table with columns: ID, Name, Default.
 * Supports --json output with { ok, data, summary, breadcrumbs } shape (CLI-01).
 */
export default class PlayerList extends AuthenticatedCommand<typeof PlayerList> {
  static description = 'List players in the active workspace'

  static agentMetadata = {
    api_endpoint: 'POST /player/list',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['ID', 'Name', 'Default'] },
    side_effects: 'none' as const,
  }

  static examples = [
    '<%= config.bin %> player list',
    '<%= config.bin %> player list --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    source: Flags.string({
      description: 'Analytics source tag',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(PlayerList)
    this.printWorkspaceHeader()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const players = await fetchAllPages<any>(async (page, size) => {
      const { data, error } = await this.apiClient.POST('/player/list', {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body: { p: page, size, source: flags.source } as any,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      if (error) {
        this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resp = data as any
      const items: unknown[] = Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : []
      return { data: items, total_count: resp?.total_count }
    })

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: players,
        summary: `${players.length} player${players.length === 1 ? '' : 's'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'player' },
        ],
      })
    }

    if (players.length === 0) {
      this.log('No players found.')
      return
    }

    const headers = ['ID', 'Name', 'Default']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = players.map((p: any) => [
      String(p.player_id ?? ''),
      applyCliTerms(String(p.player_name ?? '')),
      p.default_p ? 'yes' : 'no',
    ])

    const table = renderTable(headers, rows)
    this.log(table.toString())
    this.log(chalk.dim(`${players.length} player${players.length === 1 ? '' : 's'}`))
  }
}
