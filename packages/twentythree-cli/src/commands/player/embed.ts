import { Flags } from '@oclif/core'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Player embed command — generates embed code for a video, webinar, or category.
 *
 * CRITICAL: /player/embed returns JSON with data.embed_code — NOT raw HTML.
 * Use apiClient.GET (openapi-fetch), NOT native fetch. Extract embed_code from JSON.
 *
 * Output (D-4): process.stdout.write(embedCode) — pipeable, no trailing newline.
 * In --json mode: returns { ok, data: { embed_code }, summary, breadcrumbs }.
 *
 * Term mappings applied:
 *   photo_id  → --video-id
 *   live_id   → --webinar-id
 *   album_id  → --category-id
 *
 * Threat mitigations:
 *   T-06-08: writes only embed_code string to stdout; no credential data exposed
 */
export default class PlayerEmbed extends AuthenticatedCommand<typeof PlayerEmbed> {
  static description = 'Generate embed code for a video, webinar, or category'

  static examples = [
    '<%= config.bin %> player embed --video-id 123',
    '<%= config.bin %> player embed --video-id 123 --responsive > embed.html',
    '<%= config.bin %> player embed --webinar-id 456 --iframe',
    '<%= config.bin %> player embed --video-id 123 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'video-id': Flags.string({
      description: 'Video ID to embed (maps to photo_id)',
      required: false,
    }),
    'webinar-id': Flags.string({
      description: 'Webinar ID to embed (maps to live_id)',
      required: false,
    }),
    'category-id': Flags.string({
      description: 'Category ID to embed (maps to album_id)',
      required: false,
    }),
    'player-id': Flags.string({
      description: 'Player ID to use (default: workspace default)',
      required: false,
    }),
    url: Flags.string({
      description: 'Workspace URL to resolve to an embed code',
      required: false,
    }),
    width: Flags.integer({
      description: 'Desired embed width in pixels',
      required: false,
    }),
    height: Flags.integer({
      description: 'Desired embed height in pixels',
      required: false,
    }),
    responsive: Flags.boolean({
      description: 'Return a responsive embed code (maps to responsive_p)',
      allowNo: true,
      required: false,
    }),
    autoplay: Flags.boolean({
      description: 'Enable auto-play in the embed code (maps to autoplay_p)',
      allowNo: true,
      required: false,
    }),
    iframe: Flags.boolean({
      description: 'Return an iframe-based embed code (maps to iframe_p)',
      allowNo: true,
      required: false,
    }),
    start: Flags.integer({
      description: 'Start position in seconds',
      required: false,
    }),
    'include-unpublished': Flags.boolean({
      description: 'Include unpublished content in player parameters (maps to include_unpublished_p)',
      allowNo: true,
      required: false,
    }),
    token: Flags.string({
      description: 'Video token for private or token-protected videos',
      required: false,
    }),
    source: Flags.string({
      description: 'Analytics source tag',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(PlayerEmbed)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/player/embed', {
      params: {
        query: {
          photo_id: flags['video-id'] ? Number(flags['video-id']) : undefined,
          live_id: flags['webinar-id'] ? Number(flags['webinar-id']) : undefined,
          album_id: flags['category-id'] ? Number(flags['category-id']) : undefined,
          player_id: flags['player-id'] ? Number(flags['player-id']) : undefined,
          url: flags.url,
          width: flags.width,
          height: flags.height,
          responsive_p: flags.responsive ? true : undefined,
          autoplay_p: flags.autoplay ? true : undefined,
          iframe_p: flags.iframe ? true : undefined,
          start: flags.start,
          include_unpublished_p: flags['include-unpublished'] ? true : undefined,
          token: flags.token,
          source: flags.source,
        },
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const embedCode = (data as any)?.data?.embed_code ?? ''

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: { embed_code: embedCode },
        summary: 'Embed code generated',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'player' },
        ],
      })
    }

    // D-4: pipeable output — no trailing newline
    process.stdout.write(embedCode)
  }
}
