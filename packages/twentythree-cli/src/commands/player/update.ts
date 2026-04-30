import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Player update command — updates settings for an existing player configuration.
 *
 * Only the flags explicitly provided are sent to the API (Pitfall 3 mitigation).
 * If --data JSON is provided it is merged into the request body for untyped player properties.
 *
 * Threat mitigations:
 *   T-06-07: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class PlayerUpdate extends AuthenticatedCommand<typeof PlayerUpdate> {
  static description = 'Update settings for a player'

  static agentMetadata = {
    api_endpoint: 'POST /player/update',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'updates' as const,
  }

  static examples = [
    '<%= config.bin %> player update 42 --name "My Player"',
    '<%= config.bin %> player update 42 --description "New description"',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    name: Flags.string({
      description: 'New name for the player',
      required: false,
    }),
    description: Flags.string({
      description: 'New description for the player',
      required: false,
    }),
    data: Flags.string({
      description: 'JSON-encoded player properties to merge into the request body',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Player ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(PlayerUpdate)
    this.printWorkspaceHeader()

    const body: Record<string, unknown> = { player_id: Number(args.id) }

    if (flags.name !== undefined) body.player_name = flags.name
    if (flags.description !== undefined) body.description = flags.description

    if (flags.data !== undefined) {
      let extra: Record<string, unknown>
      try {
        extra = JSON.parse(flags.data)
      } catch {
        this.error('--data must be valid JSON', { exit: EXIT_ERROR })
      }
      Object.assign(body, extra)
    }

    const { data: updateData, error: updateError } = await this.apiClient.POST('/player/update', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (updateError) {
      this.error(applyCliTerms(formatApiError(updateError)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green('Player updated'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: updateData,
        summary: `Player ${args.id} updated`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'player', id: args.id },
        ],
      })
    }
  }
}
