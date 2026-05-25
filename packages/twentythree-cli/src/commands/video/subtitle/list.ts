import { Args, Flags } from '@oclif/core'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, renderTable, parseBoolParam, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Video subtitle list command — lists all subtitle tracks for a video.
 */
export default class VideoSubtitleList extends AuthenticatedCommand<typeof VideoSubtitleList> {
  static description = 'List all subtitle tracks for a video'

  static examples = [
    '<%= config.bin %> video subtitle list 12345',
    '<%= config.bin %> video subtitle list 12345 --json',
    '<%= config.bin %> video subtitle list 12345 --include-drafts',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'GET /photo/subtitle/list',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['Locale', 'Language', 'Type', 'Status', 'Primary'] },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'include-drafts': Flags.boolean({
      description: 'Include draft (unpublished) subtitle tracks',
      allowNo: true,
      required: false,
    }),
    'include-drafts-p': Flags.string({ hidden: true, required: false }),
    'subtitle-format': Flags.string({
      description: 'Format to use for subtitle download URLs',
      options: ['websrt', 'json', 'adobe', 'subviewer', 'webvtt'],
      required: false,
    }),
    type: Flags.string({
      description: 'Filter by subtitle type',
      options: ['general', 'closedcaptions', 'audiodescriptions'],
      required: false,
    }),
    stripped: Flags.boolean({
      description: 'Return a stripped (timing-only) version of the subtitle file',
      required: false,
    }),
    'detect-language': Flags.boolean({
      description: 'Use the viewer\'s browser language to determine the default subtitle',
      required: false,
    }),
    fields: Flags.string({
      description: 'Comma-separated list of fields to return in the API response',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Video ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(VideoSubtitleList)

    this.printWorkspaceHeader()

    const token = await this.fetchVideoToken(args.id)

    const { data, error } = await this.apiClient.GET('/photo/subtitle/list', {
      params: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        query: {
          photo_id: Number(args.id),
          token,
          ...(parseBoolParam(flags['include-drafts'], flags['include-drafts-p']) && { include_drafts_p: true }),
          ...(flags['subtitle-format'] !== undefined && { subtitle_format: flags['subtitle-format'] as any }),
          ...(flags.type !== undefined && { type: flags.type as any }),
          ...(flags.stripped && { stripped_p: true }),
          ...(flags['detect-language'] && { detect_subtitle_language_p: true }),
          ...(flags.fields !== undefined && { fields: flags.fields }),
        },
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subtitles: any[] = (data as any)?.subtitles ?? (data as any)?.data ?? []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: subtitles,
        summary: `Subtitles for video ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'video', id: args.id },
          { resource: 'subtitle' },
        ],
      })
    }

    if (subtitles.length === 0) {
      this.log('No subtitle tracks found.')
      return
    }

    const table = renderTable(
      ['Locale', 'Language', 'Type', 'Status', 'Primary'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      subtitles.map((s: any) => [
        String(s.locale ?? ''),
        String(s.language ?? ''),
        String(s.type ?? ''),
        s.draft_p ? 'draft' : 'published',
        s.default_p ? 'yes' : 'no',
      ]),
    )

    this.log(table.toString())
  }
}
