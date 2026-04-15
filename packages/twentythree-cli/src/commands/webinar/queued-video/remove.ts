import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { text, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar queued-video remove command — removes a queued video from a webinar.
 *
 * Action command pattern (Decision D-1): outputs a single green success line only.
 *
 * CRITICAL terminology mapping:
 *   CLI flag: --video-id (user-facing, maps to "video" terminology)
 *   API body field: photo_id (internal API term)
 *
 * Threat mitigations:
 *   T-05-12: applyCliTerms() on all error messages
 *   T-05-13: Validate video-id is numeric before sending as photo_id
 */
export default class WebinarQueuedVideoRemove extends AuthenticatedCommand<typeof WebinarQueuedVideoRemove> {
  static description = 'Remove a queued video from a webinar'

  static examples = [
    '<%= config.bin %> webinar queued-video remove 12345 --video-id 67890',
    '<%= config.bin %> webinar queued-video remove 12345 --video-id 67890 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'video-id': Flags.string({
      description: 'Video ID to remove from queue',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarQueuedVideoRemove)
    this.printWorkspaceHeader()

    let videoId = flags['video-id']

    // Interactive fallback when video-id not provided in non-JSON mode
    if (!videoId && !this.jsonEnabled()) {
      const result = await text({ message: 'Video ID to remove from queue' })
      if (isCancel(result)) {
        process.exit(EXIT_CANCELLED)
      }
      videoId = result as string
    }

    if (!videoId) {
      this.error('--video-id is required in non-interactive mode', { exit: EXIT_ERROR })
    }

    // SECURITY T-05-13: Validate video-id is numeric before sending as photo_id
    const photoId = Number(videoId)
    if (!Number.isFinite(photoId) || photoId <= 0) {
      this.error('--video-id must be a positive integer', { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.apiClient as any).POST('/live/queuedvideos/remove', {
      // CRITICAL: CLI flag is --video-id, but API field is photo_id
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: { live_id: Number(args.id), photo_id: photoId } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // Action command pattern: single green success line
    this.log(chalk.green('Video removed from queue'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Video removed from queue',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
          { resource: 'queued-video' },
        ],
      })
    }
  }
}
