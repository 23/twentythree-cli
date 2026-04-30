import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { text, select, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, parseBoolParam, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Video update command — updates metadata for an existing video.
 *
 * Two modes:
 * - Flag mode: only the flags explicitly provided are sent to the API (Pitfall 3 mitigation)
 * - Interactive mode: triggered when no metadata flags provided and not --json;
 *   uses @clack/prompts with current values pre-filled
 *
 * Threat mitigations:
 *   T-03-07: Only sends fields user explicitly provided (T-03-07 tampering mitigation)
 *            args.id is coerced to Number to validate it is numeric
 *   T-03-09: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class VideoUpdate extends AuthenticatedCommand<typeof VideoUpdate> {
  static description = 'Update metadata for a video'

  static examples = [
    '<%= config.bin %> video update 12345 --title "New Title"',
    '<%= config.bin %> video update 12345 --publish',
    '<%= config.bin %> video update 12345',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /photo/update',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'updates' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    title: Flags.string({
      description: 'New title for the video',
      required: false,
    }),
    description: Flags.string({
      description: 'New description for the video',
      required: false,
    }),
    tags: Flags.string({
      description: 'Space-separated tags (replaces existing tags)',
      required: false,
    }),
    'category-id': Flags.string({
      description: 'Category ID (or comma-separated IDs) to assign the video to',
      required: false,
    }),
    publish: Flags.boolean({
      description: 'Publish or unpublish the video',
      allowNo: true,
      required: false,
    }),
    promote: Flags.boolean({
      description: 'Promote or demote the video',
      allowNo: true,
      required: false,
    }),
    'publish-date': Flags.string({
      description: 'Scheduled publish date/time (ISO 8601)',
      required: false,
    }),
    '360': Flags.boolean({
      description: 'Mark as 360° video',
      allowNo: true,
      required: false,
    }),
    'seo-policy': Flags.string({
      description: 'SEO policy for the video: index, noindex, or empty string to reset',
      options: ['', 'index', 'noindex'],
      required: false,
    }),
    // Hidden raw _p-suffixed alternatives (undocumented, for advanced users)
    'published-p': Flags.string({ hidden: true, required: false }),
    'promoted-p': Flags.string({ hidden: true, required: false }),
    'video-360-p': Flags.string({ hidden: true, required: false }),
  }

  static args = {
    id: Args.string({ description: 'Video ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(VideoUpdate)

    this.printWorkspaceHeader()

    // T-03-07: Validate args.id is numeric before sending to API
    const videoId = Number(args.id)
    if (!Number.isFinite(videoId) || videoId <= 0) {
      this.error(`Invalid video ID: ${args.id}`, { exit: EXIT_ERROR })
    }

    // Detect whether any metadata flags were explicitly provided
    const metadataFlagsProvided = [
      flags.title,
      flags.description,
      flags.tags,
      flags['category-id'],
      flags.publish,
      flags.promote,
      flags['publish-date'],
      flags['360'],
      flags['published-p'],
      flags['promoted-p'],
      flags['video-360-p'],
      flags['seo-policy'],
    ].some((v) => v !== undefined)

    const body: Record<string, unknown> = { photo_id: videoId }

    if (!metadataFlagsProvided && !this.jsonEnabled()) {
      // Interactive mode: fetch current video metadata and pre-fill prompts
      const { data, error } = await this.apiClient.GET('/photo/list', {
        params: { query: { photo_id: videoId } },
      })

      if (error) {
        this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resp = data as any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any
      if (Array.isArray(resp?.data)) {
        current = resp.data[0]
      } else if (resp?.data) {
        current = resp.data
      }

      if (!current) {
        this.error(`Video ${args.id} not found`, { exit: EXIT_ERROR })
      }

      const currentTags = Array.isArray(current.tags)
        ? current.tags.join(' ')
        : (current.tags ?? '')

      const titleResult = await text({
        message: 'Title',
        initialValue: current.title ?? '',
        placeholder: 'Video title',
      })
      if (isCancel(titleResult)) process.exit(EXIT_CANCELLED)

      const descriptionResult = await text({
        message: 'Description',
        initialValue: current.content_text ?? '',
        placeholder: 'Video description',
      })
      if (isCancel(descriptionResult)) process.exit(EXIT_CANCELLED)

      const tagsResult = await text({
        message: 'Tags (space-separated)',
        initialValue: currentTags,
        placeholder: 'tag1 tag2 tag3',
      })
      if (isCancel(tagsResult)) process.exit(EXIT_CANCELLED)

      const publishedResult = await select({
        message: 'Published',
        options: [
          { value: 'yes', label: 'Yes — published' },
          { value: 'no', label: 'No — unpublished' },
        ],
        initialValue: current.published_p ? 'yes' : 'no',
      })
      if (isCancel(publishedResult)) process.exit(EXIT_CANCELLED)

      // Only send fields the user actually filled in; skip empty strings to avoid
      // overwriting existing values with blanks (consistent with flag-mode behaviour)
      const titleVal = titleResult as string
      const descriptionVal = descriptionResult as string
      const tagsVal = tagsResult as string
      if (titleVal !== '') body.title = titleVal
      if (descriptionVal !== '' || current.content_text === '') body.description = descriptionVal
      if (tagsVal !== '' || currentTags === '') body.tags = tagsVal
      body.published_p = publishedResult === 'yes' ? 1 : 0
    } else {
      // Flag mode: only include flags the user explicitly provided (T-03-07 mitigation)
      if (flags.title !== undefined) body.title = flags.title
      if (flags.description !== undefined) body.description = flags.description
      if (flags.tags !== undefined) body.tags = flags.tags
      if (flags['category-id'] !== undefined) body.album_id = flags['category-id']
      const publishVal = parseBoolParam(flags.publish, flags['published-p'])
      const promoteVal = parseBoolParam(flags.promote, flags['promoted-p'])
      const video360Val = parseBoolParam(flags['360'], flags['video-360-p'])
      if (publishVal !== undefined) body.published_p = publishVal ? 1 : 0
      if (promoteVal !== undefined) body.promoted_p = promoteVal ? 1 : 0
      if (flags['publish-date'] !== undefined) body['publish_date'] = flags['publish-date']
      if (video360Val !== undefined) body.video_360_p = video360Val ? 1 : 0
      if (flags['seo-policy'] !== undefined) body.seo_policy = flags['seo-policy']
    }

    const { data: updateData, error: updateError } = await this.apiClient.POST('/photo/update', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (updateError) {
      this.error(applyCliTerms(formatApiError(updateError)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Video ${args.id} updated`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: updateData,
        summary: `Video ${args.id} updated`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'video', id: args.id },
        ],
      })
    }
  }
}
