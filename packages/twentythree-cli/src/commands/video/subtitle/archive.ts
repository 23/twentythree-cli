import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Video subtitle archive command — triggers workspace-level subtitle archive transcription
 * or checks transcription progress.
 *
 * Without --progress: POST /photo/subtitle/archive/transcribe
 *   Queues all eligible workspace videos for automatic transcription.
 *
 * With --progress: POST /photo/subtitle/archive/get-progress
 *   Returns a breakdown of the archive transcription queue by status.
 *
 * Both operations are workspace-level (not video-specific).
 */
export default class VideoSubtitleArchive extends AuthenticatedCommand<typeof VideoSubtitleArchive> {
  static description = 'Manage workspace subtitle archive transcription'

  static examples = [
    '<%= config.bin %> video subtitle archive',
    '<%= config.bin %> video subtitle archive --progress',
    '<%= config.bin %> video subtitle archive --progress --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    progress: Flags.boolean({
      description: 'Check transcription progress instead of triggering transcription',
      default: false,
    }),
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(VideoSubtitleArchive)

    this.printWorkspaceHeader()

    if (flags.progress) {
      // Check archive transcription progress
      const { data, error } = await this.apiClient.POST('/photo/subtitle/archive/get-progress', {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body: {} as any,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })

      if (error) {
        this.error(applyCliTerms(String(error)), { exit: EXIT_ERROR })
      }

      if (this.jsonEnabled()) {
        return formatJsonOutput({
          ok: true,
          data,
          summary: 'Subtitle archive transcription progress',
          breadcrumbs: [
            { domain: this.activeWorkspace.domain },
            { resource: 'subtitle-archive' },
          ],
        })
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const progress = (data as any)?.data ?? data
      this.log(JSON.stringify(progress, null, 2))
    } else {
      // Trigger transcription for all videos in the workspace archive
      const { data, error } = await this.apiClient.POST('/photo/subtitle/archive/transcribe', {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body: {} as any,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })

      if (error) {
        this.error(applyCliTerms(String(error)), { exit: EXIT_ERROR })
      }

      this.log(chalk.green('Transcription started for all videos in the workspace archive'))

      if (this.jsonEnabled()) {
        return formatJsonOutput({
          ok: true,
          data,
          summary: 'Transcription started for all videos in the workspace archive',
          breadcrumbs: [
            { domain: this.activeWorkspace.domain },
            { resource: 'subtitle-archive' },
          ],
        })
      }
    }
  }
}
