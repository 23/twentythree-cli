import { Args } from '@oclif/core'
import chalk from 'chalk'
import { confirm, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Player delete command — deletes a player after confirmation.
 *
 * Prompts user to confirm deletion showing the workspace domain so they know
 * which workspace they are deleting from.
 *
 * --json flag skips the confirmation prompt (scripting mode — assume confirmed).
 *
 * Exit codes:
 *   0 — success
 *   1 — error (player not found, API error)
 *   2 — cancelled (user declined confirmation)
 *
 * Threat mitigations:
 *   T-06-07: Confirmation prompt with workspace domain; exit code 2 on cancel
 */
export default class PlayerDelete extends AuthenticatedCommand<typeof PlayerDelete> {
  static description = 'Delete a player from the active workspace'

  static agentMetadata = {
    api_endpoint: 'POST /player/delete',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'destructive' as const,
  }

  static examples = [
    '<%= config.bin %> player delete 42',
    '<%= config.bin %> player delete 42 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Player ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(PlayerDelete)
    this.printWorkspaceHeader()

    if (!this.jsonEnabled()) {
      const confirmed = await confirm({
        message: `Delete player ${args.id} from ${this.activeWorkspace.domain}? This cannot be undone.`,
      })

      if (isCancel(confirmed) || !confirmed) {
        process.exit(EXIT_CANCELLED)
      }
    }

    const { data: deleteData, error: deleteError } = await this.apiClient.POST('/player/delete', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: { player_id: Number(args.id) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (deleteError) {
      this.error(applyCliTerms(formatApiError(deleteError)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green('Player deleted'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: deleteData,
        summary: `Player ${args.id} deleted`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'player', id: args.id },
        ],
      })
    }
  }
}
