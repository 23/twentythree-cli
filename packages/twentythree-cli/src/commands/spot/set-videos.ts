import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Spot set-videos command — assigns videos to a spot.
 *
 * Maps to the POST /spot/set-videos API endpoint.
 * Accepts comma-separated video IDs to assign to the specified spot.
 *
 * Threat mitigations:
 *   T-08-02: extends AuthenticatedCommand — anonymous mode rejected with AUTH-10 error
 *   T-08-03: Video IDs passed as comma-separated string; server-side validation enforces valid IDs
 */
export default class SpotSetVideos extends AuthenticatedCommand<typeof SpotSetVideos> {
  static description = 'Assign videos to a spot'

  static examples = [
    '<%= config.bin %> spot set-videos 12345 --videos "111,222,333"',
    '<%= config.bin %> spot set-videos 12345 --videos "111" --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    videos: Flags.string({
      description: 'Comma-separated video IDs to assign to the spot',
      required: true,
    }),
  }

  static args = {
    id: Args.string({ description: 'Spot ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /spot/set-videos',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'updates' as const,
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(SpotSetVideos)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.POST('/spot/set-videos', {
      body: { spot_id: Number(args.id), videos: flags.videos } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Videos set for spot ${args.id}`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Videos set for spot ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'spot', id: args.id },
        ],
      })
    }
  }
}
