import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Video subtitle archive command — checks workspace-level subtitle archive transcription progress.
 *
 * POST /photo/subtitle/archive/get-progress
 *   Returns a breakdown of the archive transcription queue by status.
 *
 * Note: The /photo/subtitle/archive/transcribe endpoint has been removed from the API.
 */
export default class VideoSubtitleArchive extends AuthenticatedCommand<typeof VideoSubtitleArchive> {
  static description = 'Check workspace subtitle archive transcription progress'

  static examples = [
    '<%= config.bin %> video subtitle archive',
    '<%= config.bin %> video subtitle archive --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /photo/subtitle/archive/get-progress',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  public async run(): Promise<void | object> {
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.POST('/photo/subtitle/archive/get-progress', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: {} as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
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
  }
}
