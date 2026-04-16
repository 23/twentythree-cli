import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { text, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar queued-video add command — adds a queued video to a webinar.
 *
 * Action command pattern (Decision D-1): outputs a single green success line only.
 *
 * CRITICAL terminology mapping (T-05-13):
 *   CLI flag: --video-id (user-facing, maps to "video" terminology)
 *   API body field: photo_id (internal API term)
 *
 * Threat mitigations:
 *   T-05-12: applyCliTerms() on all error messages
 *   T-05-13: Validate video-id is numeric before sending as photo_id
 */
export default class WebinarQueuedVideoAdd extends AuthenticatedCommand<typeof WebinarQueuedVideoAdd> {
  static description = 'Add a queued video to a webinar'

  static examples = [
    '<%= config.bin %> webinar queued-video add 12345 --video-id 67890',
    '<%= config.bin %> webinar queued-video add 12345 --video-id 67890 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'video-id': Flags.string({
      description: 'Video ID to queue',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /live/queuedvideos/add',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'creates' as const,
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarQueuedVideoAdd)
    this.printWorkspaceHeader()

    let videoId = flags['video-id']

    // Interactive fallback when video-id not provided in non-JSON mode
    if (!videoId && !this.jsonEnabled()) {
      const result = await text({ message: 'Video ID to queue' })
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
    const { data, error } = await (this.apiClient as any).POST('/live/queuedvideos/add', {
      // CRITICAL: CLI flag is --video-id, but API field is photo_id
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: { live_id: Number(args.id), photo_id: photoId } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // Action command pattern: single green success line
    this.log(chalk.green('Video queued'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Video queued',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
          { resource: 'queued-video' },
        ],
      })
    }
  }
}
