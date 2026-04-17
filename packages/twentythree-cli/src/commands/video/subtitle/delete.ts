import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { confirm, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Video subtitle delete command — removes a subtitle track after confirmation.
 *
 * Posts to /photo/subtitle/remove (not /delete) — the API endpoint is /remove.
 *
 * Prompts user to confirm deletion showing workspace domain and subtitle locale
 * so they know exactly what is being deleted (T-03-14 repudiation mitigation).
 *
 * --json flag skips the confirmation prompt (scripting mode — assume confirmed).
 *
 * Threat mitigations:
 *   T-03-14: Confirmation prompt includes workspace domain and subtitle locale
 */
export default class VideoSubtitleDelete extends AuthenticatedCommand<typeof VideoSubtitleDelete> {
  static description = 'Delete a subtitle track from a video'

  static examples = [
    '<%= config.bin %> video subtitle delete 12345 --subtitle-id en_US',
    '<%= config.bin %> video subtitle delete 12345 --subtitle-id en_US --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /photo/subtitle/remove',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'destructive' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'subtitle-id': Flags.string({
      description: 'Locale of the subtitle track to delete (e.g. en_US)',
      required: true,
    }),
    type: Flags.string({
      description: 'Subtitle type to delete (general, closedcaptions, audiodescriptions)',
      default: 'general',
    }),
  }

  static args = {
    id: Args.string({ description: 'Video ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(VideoSubtitleDelete)

    this.printWorkspaceHeader()

    if (!this.jsonEnabled()) {
      // T-03-14: Confirmation includes workspace domain and subtitle locale
      const confirmed = await confirm({
        message: `Delete subtitle track "${flags['subtitle-id']}" from video ${args.id} on ${this.activeWorkspace.domain}?`,
      })

      if (isCancel(confirmed) || !confirmed) {
        process.exit(EXIT_CANCELLED)
      }
    }

    // Note: API endpoint is /photo/subtitle/remove (not /delete)
    const { data, error } = await this.apiClient.POST('/photo/subtitle/remove', {
      body: {
        photo_id: Number(args.id),
        locale: flags['subtitle-id'],
        type: flags.type as 'general' | 'closedcaptions' | 'audiodescriptions',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Subtitle track "${flags['subtitle-id']}" deleted from video ${args.id}`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Subtitle track "${flags['subtitle-id']}" deleted from video ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'video', id: args.id },
          { resource: 'subtitle', id: flags['subtitle-id'] },
        ],
      })
    }
  }
}
