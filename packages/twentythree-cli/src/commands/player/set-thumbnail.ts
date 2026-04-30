import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Player set-thumbnail command — uploads and sets a custom thumbnail image for a player.
 *
 * Uses direct multipart POST with bodySerializer to create FormData.
 * Per D-3: NOT the chunked engine — thumbnail images use direct multipart upload.
 *
 * Maps to POST /player/set-thumbnail.
 */
export default class PlayerSetThumbnail extends AuthenticatedCommand<typeof PlayerSetThumbnail> {
  static description = 'Upload and set a custom thumbnail image for a player'

  static examples = [
    '<%= config.bin %> player set-thumbnail ./thumbnail.png --player-id 42',
    '<%= config.bin %> player set-thumbnail ./thumbnail.jpg --player-id 42 --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /player/set-thumbnail',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'updates' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'player-id': Flags.integer({
      description: 'Player ID to update',
      required: true,
    }),
  }

  static args = {
    file: Args.string({ description: 'Path to the thumbnail image file', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(PlayerSetThumbnail)
    this.printWorkspaceHeader()

    const filePath = path.resolve(args.file)
    if (!fs.existsSync(filePath)) {
      this.error(`File not found: ${filePath}`, { exit: EXIT_ERROR })
    }

    const fileBuffer = fs.readFileSync(filePath)
    const fileName = path.basename(filePath)
    const fileBlob = new Blob([fileBuffer])

    const { data, error } = await this.apiClient.POST('/player/set-thumbnail', {
      body: {
        player_id: flags['player-id'],
        file: fileBlob as unknown as Record<string, never>,
      },
      bodySerializer(body) {
        const fd = new FormData()
        for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
          if (v !== undefined) {
            if (v instanceof Blob) {
              fd.append(k, v, fileName)
            } else {
              fd.append(k, String(v))
            }
          }
        }
        return fd
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Thumbnail set for player ${flags['player-id']}`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Thumbnail set for player ${flags['player-id']}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'player', id: String(flags['player-id']) },
        ],
      })
    }
  }
}
