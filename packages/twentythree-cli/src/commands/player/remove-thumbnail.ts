import { Args } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Player remove-thumbnail command — removes the custom thumbnail for a player,
 * reverting it to the default generated thumbnail image.
 *
 * Maps to POST /player/remove-thumbnail.
 */
export default class PlayerRemoveThumbnail extends AuthenticatedCommand<typeof PlayerRemoveThumbnail> {
  static description = 'Remove the custom thumbnail for a player, reverting to the default'

  static examples = [
    '<%= config.bin %> player remove-thumbnail 42',
    '<%= config.bin %> player remove-thumbnail 42 --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /player/remove-thumbnail',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'updates' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Player ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(PlayerRemoveThumbnail)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.POST('/player/remove-thumbnail', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: { player_id: Number(args.id) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Thumbnail removed for player ${args.id}`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Thumbnail removed for player ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'player', id: args.id },
        ],
      })
    }
  }
}
