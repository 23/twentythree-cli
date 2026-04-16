import { Args } from '@oclif/core'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Video get command — retrieves details of a single video by ID.
 *
 * Uses GET /photo/list?photo_id=<id> as the lookup mechanism — there is no
 * separate /photo/get endpoint (per RESEARCH.md Pitfall 8).
 *
 * Supports --json output with { ok, data, summary, breadcrumbs } shape (CLI-01).
 */
export default class VideoGet extends AuthenticatedCommand<typeof VideoGet> {
  static description = 'Get details of a specific video'

  static examples = [
    '<%= config.bin %> video get 12345',
    '<%= config.bin %> video get 12345 --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'GET /photo/list',
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
    const { args } = await this.parse(VideoGet)

    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/photo/list', {
      params: { query: { photo_id: Number(args.id), include_unpublished_p: 1 } },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // Cast to any to handle real runtime shape (API returns list data under data field)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any

    // Extract single video from the response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let video: any
    if (Array.isArray(resp?.data)) {
      video = resp.data[0]
    } else if (resp?.data) {
      video = resp.data
    }

    if (!video) {
      this.error(`Video ${args.id} not found`, { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: video,
        summary: video.title ?? `Video ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'video', id: args.id },
        ],
      })
    }

    // Label-value output (similar to auth status pattern)
    const tags = Array.isArray(video.tags) ? video.tags.join(', ') : (video.tags ?? '')
    const status = video.video_encoded_p ? 'encoded' : 'processing'
    const published = video.published_p ? 'yes' : 'no'

    this.log(`ID:          ${video.photo_id ?? args.id}`)
    this.log(`Title:       ${applyCliTerms(String(video.title ?? ''))}`)
    this.log(`Description: ${applyCliTerms(String(video.content_text ?? ''))}`)
    this.log(`Duration:    ${String(video.video_length_fmt ?? '')}`)
    this.log(`Status:      ${status}`)
    this.log(`Published:   ${published}`)
    this.log(`Tags:        ${applyCliTerms(tags)}`)
    this.log(`Category:    ${applyCliTerms(String(video.album_title ?? ''))}`)
    this.log(`Created:     ${String(video.creation_date_ansi ?? '')}`)
    this.log(`Updated:     ${String(video.publish_date_ansi ?? '')}`)
  }
}
