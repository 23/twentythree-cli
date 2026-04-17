import { Args } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Video transcoding-progress command — checks transcoding status for a video.
 *
 * Threat mitigations:
 *   T-03-09: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class VideoTranscodingProgress extends AuthenticatedCommand<typeof VideoTranscodingProgress> {
  static description = 'Check the transcoding progress for a video'

  static examples = [
    '<%= config.bin %> video transcoding-progress 12345',
    '<%= config.bin %> video transcoding-progress 12345 --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'GET /photo/get-transcoding-progress',
    auth_scope: 'read' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Video ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(VideoTranscodingProgress)

    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/photo/get-transcoding-progress', {
      params: { query: { photo_id: Number(args.id) } },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const progressData = (data as any)?.data ?? data

    if (!this.jsonEnabled()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = progressData as any

      // Each format field is a 0–1 float. Skip non-progress fields.
      const SKIP = new Set(['all', 'video_mobile_high_projected_finish'])
      const FORMAT_LABELS: Record<string, string> = {
        video_frames:      'Frames',
        analysis:          'Analysis',
        video_4k:          '4K',
        video_hd:          'HD',
        video_1080p:       '1080p',
        video_mobile_high: 'Mobile (high)',
        video_mobile_low:  'Mobile (low)',
      }

      const entries = Object.entries(d ?? {}).filter(
        ([k, v]) => !SKIP.has(k) && typeof v === 'string' && !isNaN(parseFloat(v as string)),
      )

      if (entries.length === 0) {
        this.log('No transcoding data available.')
        return
      }

      for (const [key, val] of entries) {
        const pct = Math.round(parseFloat(val as string) * 100)
        const label = FORMAT_LABELS[key] ?? key
        const filled = Math.floor(pct / 5)
        const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(20 - filled)
        this.log(`  ${label.padEnd(14)} [${bar}] ${String(pct).padStart(3)}%`)
      }
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: progressData,
        summary: `Transcoding progress for video ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'video', id: args.id },
        ],
      })
    }
  }
}
