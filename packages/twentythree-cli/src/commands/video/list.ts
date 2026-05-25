import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { fetchAllPages } from '../../lib/pagination.js'
import { renderTable, formatJsonOutput, parseBoolParam, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

export default class VideoList extends AuthenticatedCommand<typeof VideoList> {
  static description = 'List videos in the active workspace'

  static examples = [
    '<%= config.bin %> video list',
    '<%= config.bin %> video list --json',
    '<%= config.bin %> video list --search "intro" --order-by views --order desc',
    '<%= config.bin %> video list --album-id 42 --include-unpublished',
    '<%= config.bin %> video list --user-id me --limit 10',
    '<%= config.bin %> video list --after-time 2024-01-01T00:00:00Z --fields photo_id,title',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'GET /photo/list',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['ID', 'Title', 'Duration', 'Status', 'Published', 'Updated'] },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    limit: Flags.integer({
      description: 'Maximum number of videos to return (default: all)',
      required: false,
    }),
    search: Flags.string({
      description: 'Search by title, description, or tags',
      required: false,
    }),
    'album-id': Flags.string({
      description: 'Filter to videos in one or more categories (comma-separated IDs)',
      required: false,
    }),
    'user-id': Flags.string({
      description: 'Filter to videos uploaded by a specific user (use "me" for the authenticated user)',
      required: false,
    }),
    'photo-id': Flags.integer({
      description: 'Limit results to a single video by its ID',
      required: false,
    }),
    'live-id': Flags.integer({
      description: 'Filter to videos associated with a specific webinar',
      required: false,
    }),
    tag: Flags.string({
      description: 'Filter to videos with a specific tag',
      required: false,
    }),
    tags: Flags.string({
      description: 'Space-separated list of tags to filter by',
      required: false,
    }),
    'tag-mode': Flags.string({
      description: 'How to combine tag filters: "and" requires all tags to match, "or" requires any',
      options: ['and', 'or'],
      required: false,
    }),
    'order-by': Flags.string({
      description: 'Order results by this field',
      options: ['uploaded', 'published', 'created', 'creation', 'taken', 'title', 'views', 'comments', 'rating', 'numratings', 'video_length', 'words', 'related', 'posted', 'rank', 'default-published'],
      required: false,
    }),
    order: Flags.string({
      description: 'Sort direction',
      options: ['asc', 'desc'],
      required: false,
    }),
    'before-time': Flags.string({
      description: 'Filter to videos uploaded before this timestamp (ISO 8601)',
      required: false,
    }),
    'after-time': Flags.string({
      description: 'Filter to videos uploaded after this timestamp (ISO 8601)',
      required: false,
    }),
    year: Flags.integer({
      description: 'Filter to videos from a specific year',
      required: false,
    }),
    month: Flags.integer({
      description: 'Filter to videos from a specific month (1–12, requires --year)',
      required: false,
    }),
    day: Flags.integer({
      description: 'Filter to videos from a specific day (1–31, requires --year and --month)',
      required: false,
    }),
    published: Flags.boolean({
      description: 'Filter by published status',
      allowNo: true,
      required: false,
    }),
    promoted: Flags.boolean({
      description: 'Filter to promoted videos only',
      allowNo: true,
      required: false,
    }),
    unalbummed: Flags.boolean({
      description: 'Filter to videos not assigned to any category',
      required: false,
    }),
    'include-unpublished': Flags.boolean({
      description: 'Include unpublished videos in the results',
      allowNo: true,
      required: false,
    }),
    'include-stats': Flags.boolean({
      description: 'Include per-video performance statistics (view count, play rate, engagement)',
      required: false,
    }),
    'include-sections-count': Flags.boolean({
      description: 'Include the number of chapters for each video',
      required: false,
    }),
    'include-user-group': Flags.boolean({
      description: 'Include the user group assignment for each video',
      required: false,
    }),
    fields: Flags.string({
      description: 'Comma-separated list of fields to return in the API response',
      required: false,
    }),
    'include-unpublished-p': Flags.string({ hidden: true, required: false }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(VideoList)
    this.printWorkspaceHeader()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allVideos = await fetchAllPages<any>(async (page, size) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: Record<string, any> = {
        p: page,
        size,
      }

      if (flags.search !== undefined) query.search = flags.search
      if (flags['album-id'] !== undefined) query.album_id = flags['album-id']
      if (flags['user-id'] !== undefined) query.user_id = flags['user-id']
      if (flags['photo-id'] !== undefined) query.photo_id = flags['photo-id']
      if (flags['live-id'] !== undefined) query.live_id = flags['live-id']
      if (flags.tag !== undefined) query.tag = flags.tag
      if (flags.tags !== undefined) query.tags = flags.tags
      if (flags['tag-mode'] !== undefined) query.tag_mode = flags['tag-mode']
      if (flags['order-by'] !== undefined) query.orderby = flags['order-by']
      if (flags.order !== undefined) query.order = flags.order
      if (flags['before-time'] !== undefined) query.before_time = flags['before-time']
      if (flags['after-time'] !== undefined) query.after_time = flags['after-time']
      if (flags.year !== undefined) query.year = flags.year
      if (flags.month !== undefined) query.month = flags.month
      if (flags.day !== undefined) query.day = flags.day
      if (flags.published !== undefined) query.published_p = flags.published
      if (flags.promoted !== undefined) query.promoted_p = flags.promoted
      if (flags.unalbummed) query.unalbummed_p = true
      if (flags['include-stats']) query.include_stats_p = true
      if (flags['include-sections-count']) query.include_number_of_sections_p = true
      if (flags['include-user-group']) query.include_user_group_p = true
      if (flags.fields !== undefined) query.fields = flags.fields

      const includeUnpublished = parseBoolParam(flags['include-unpublished'], flags['include-unpublished-p'])
      if (includeUnpublished) query.include_unpublished_p = '1'

      const { data, error } = await this.apiClient.GET('/photo/list', {
        params: { query },
      })
      if (error) {
        this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resp = data as any
      const items: unknown[] = Array.isArray(resp?.data)
        ? resp.data
        : resp?.data
        ? [resp.data]
        : []
      return { data: items, total_count: resp?.total_count }
    })

    const videos = flags.limit !== undefined ? allVideos.slice(0, flags.limit) : allVideos

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: videos,
        summary: `${videos.length} video${videos.length === 1 ? '' : 's'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'video' },
        ],
      })
    }

    if (videos.length === 0) {
      this.log('No videos found.')
      return
    }

    const headers = ['ID', 'Title', 'Duration', 'Status', 'Published', 'Updated']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = videos.map((v: any) => [
      String(v.photo_id ?? ''),
      applyCliTerms(String(v.title ?? '')),
      String(v.video_length_fmt ?? ''),
      v.video_encoded_p ? 'encoded' : 'processing',
      v.published_p ? 'yes' : 'no',
      String(v.publish_date_ansi ?? v.creation_date_ansi ?? ''),
    ])

    const table = renderTable(headers, rows)
    this.log(table.toString())
    this.log(chalk.dim(`${videos.length} video${videos.length === 1 ? '' : 's'}`))
  }
}
