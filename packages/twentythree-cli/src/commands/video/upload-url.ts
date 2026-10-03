import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Video upload-url command — creates a video by having the platform download
 * the file from a URL, instead of uploading a local file in chunks.
 *
 * Maps to POST /photo/upload-url. The server fetches the URL and queues the
 * video for transcoding; the command returns as soon as the video exists, so
 * use `video transcoding-progress` to follow it.
 *
 * Unlike `video upload`, the API publishes the video by default — pass
 * --no-publish to keep it unpublished.
 */
export default class VideoUploadUrl extends AuthenticatedCommand<typeof VideoUploadUrl> {
  static description = 'Create a video by downloading the file from a URL'

  static examples = [
    '<%= config.bin %> video upload-url https://example.com/keynote.mp4 --title "Keynote"',
    '<%= config.bin %> video upload-url https://example.com/keynote.mp4 --no-publish --category-id 1234 --json',
    '<%= config.bin %> video upload-url https://example.com/keynote.mp4 --publish-date "2026-11-01 09:00:00"',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /photo/upload-url',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'creates' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    title: Flags.string({
      description: 'Title for the video',
      required: false,
    }),
    description: Flags.string({
      description: 'Description of the video',
      required: false,
    }),
    'content-format': Flags.string({
      description: 'Format of the description',
      options: ['text/enhanced', 'text/plain', 'text/html'],
      required: false,
    }),
    tags: Flags.string({
      description: 'Comma-separated tags for the video',
      required: false,
    }),
    'category-id': Flags.string({
      description: 'Category ID to place the video in',
      required: false,
    }),
    publish: Flags.boolean({
      description: 'Publish the video once it lands (API default). Use --no-publish to keep it unpublished',
      allowNo: true,
      default: true,
    }),
    'publish-date': Flags.string({
      description: 'Publish date (past or future), e.g. "2026-11-01 09:00:00"',
      required: false,
    }),
    'user-id': Flags.integer({
      description: 'Upload on behalf of this user ID (super users only; otherwise ignored)',
      required: false,
    }),
    fields: Flags.string({
      description: 'Comma-separated list of fields to return in the API response',
      required: false,
    }),
  }

  static args = {
    url: Args.string({ description: 'URL of the video file to download', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(VideoUploadUrl)
    this.printWorkspaceHeader()

    if (!/^https?:\/\//i.test(args.url)) {
      this.error(`Invalid URL '${args.url}' — expected an http(s) URL`, { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: Record<string, any> = { url: args.url, publish: flags.publish ? 1 : 0 }
    if (flags.title !== undefined) body.title = flags.title
    if (flags.description !== undefined) body.content = flags.description
    if (flags['content-format'] !== undefined) body.content_format = flags['content-format']
    if (flags.tags !== undefined) body.tags = flags.tags
    if (flags['category-id'] !== undefined) body.album_id = flags['category-id']
    if (flags['publish-date'] !== undefined) body.publish_date = flags['publish-date']
    if (flags['user-id'] !== undefined) body.user_id = flags['user-id']
    if (flags.fields !== undefined) body.fields = flags.fields

    const { data, error } = await this.apiClient.POST('/photo/upload-url', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (data as any)?.data ?? {}
    const videoId = result.photo_id

    this.log(chalk.green('Video queued from URL'))
    const adminUrl = videoId ? `https://${this.activeWorkspace.domain}/manage/video/${videoId}` : undefined
    if (videoId) {
      this.log(`ID:    ${videoId}`)
      this.log(`Admin: ${adminUrl}`)
      this.log(chalk.dim('Transcoding runs in the background — check with `video transcoding-progress`.'))
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: adminUrl ? { ...result, admin_url: adminUrl } : result,
        summary: 'Video queued from URL',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          ...(videoId ? [{ resource: 'video', id: String(videoId) }] : []),
        ],
      })
    }
  }
}
