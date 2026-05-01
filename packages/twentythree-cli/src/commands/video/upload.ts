import { Args, Flags } from '@oclif/core'
import { stat } from 'node:fs/promises'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatBytes, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'
import { uploadChunked } from '../../upload/chunked-upload.js'
import { DEFAULT_CHUNK_SIZE, DEFAULT_CONCURRENCY } from '../../upload/types.js'

/**
 * Simple inline progress bar that writes directly to stderr using \r.
 * Avoids all TTY-detection issues that afflict cli-progress.
 * T-03-06: shows only byte counts, never the upload_token.
 */
class ProgressBar {
  private lastLen = 0

  render(bytesUploaded: number, total: number, speed: number): void {
    const pct = total > 0 ? Math.floor((bytesUploaded / total) * 100) : 0
    const filled = Math.floor(pct / 5)
    const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(20 - filled)
    const line = `[${bar}] ${pct}% | ${formatBytes(bytesUploaded)} / ${formatBytes(total)} | ${formatBytes(speed)}/s`
    const padding = ' '.repeat(Math.max(0, this.lastLen - line.length))
    process.stderr.write(`\r${line}${padding}`)
    this.lastLen = line.length
  }

  finish(): void {
    // Commit the final state with a newline so the 100% bar stays visible
    process.stderr.write('\n')
    this.lastLen = 0
  }
}

/**
 * Video upload command — uploads a video file using the chunked upload engine.
 *
 * Flow:
 *   1. GET /photo/get-upload-token (with optional metadata)
 *   2. Upload file in chunks with inline progress bar
 *   3. Display success message; optionally return --json result
 *
 * Threat mitigations:
 *   T-03-06: upload_token is never logged to stdout — only byte counts shown
 *   T-03-09: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class VideoUpload extends AuthenticatedCommand<typeof VideoUpload> {
  static description = 'Upload a video file to the active workspace'

  static examples = [
    '<%= config.bin %> video upload ./video.mp4',
    '<%= config.bin %> video upload ./video.mp4 --title "My Video" --publish',
    '<%= config.bin %> video upload ./video.mp4 --chunk-size 52428800 --concurrency 3',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /photo/redeem-upload-token',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'creates' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    title: Flags.string({
      description: 'Title for the uploaded video',
      required: false,
    }),
    description: Flags.string({
      description: 'Description for the uploaded video',
      required: false,
    }),
    tags: Flags.string({
      description: 'Space-separated tags for the uploaded video',
      required: false,
    }),
    'category-id': Flags.string({
      description: 'Category ID (or comma-separated IDs) to assign the video to',
      required: false,
    }),
    publish: Flags.boolean({
      description: 'Publish the video immediately after upload',
      default: false,
    }),
    'chunk-size': Flags.integer({
      description: `Chunk size in bytes (default: ${DEFAULT_CHUNK_SIZE} = 100MB)`,
      default: DEFAULT_CHUNK_SIZE,
    }),
    concurrency: Flags.integer({
      description: `Number of chunks to upload in parallel (default: ${DEFAULT_CONCURRENCY})`,
      default: DEFAULT_CONCURRENCY,
    }),
  }

  static args = {
    file: Args.string({ description: 'Path to the video file to upload', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(VideoUpload)

    this.printWorkspaceHeader()

    // Validate file exists
    try {
      await stat(args.file)
    } catch {
      this.error(`File not found: ${args.file}`, { exit: EXIT_ERROR })
    }

    // Step 1: Get upload token
    const { data: tokenData, error: tokenError } = await this.apiClient.GET('/photo/get-upload-token', {
      params: {
        query: {
          title: flags.title,
          description: flags.description,
          tags: flags.tags,
          album_id: flags['category-id'],
        },
      },
    })

    if (tokenError) {
      this.error(applyCliTerms(String(tokenError)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uploadToken = (tokenData as any)?.data?.upload_token as string | undefined
    if (!uploadToken) {
      this.error('Failed to obtain upload token from API', { exit: EXIT_ERROR })
    }

    // Step 2: Upload chunks with inline progress bar
    const fileStat = await stat(args.file)
    const totalBytes = fileStat.size
    const bar = new ProgressBar()
    const startTime = Date.now()
    let result: Awaited<ReturnType<typeof uploadChunked>>

    // Show initial 0% so the bar is visible from the start
    bar.render(0, totalBytes, 0)

    try {
      result = await uploadChunked({
        filePath: args.file,
        uploadToken,
        uploadUrl: `${this.apiBaseUrl}photo/redeem-upload-token`,
        bearerToken: this.activeWorkspace.bearer_token || undefined,
        chunkSize: flags['chunk-size'],
        concurrency: flags.concurrency,
        onProgress(bytesUploaded, total) {
          const elapsed = (Date.now() - startTime) / 1000
          const speed = elapsed > 0 ? bytesUploaded / elapsed : 0
          bar.render(bytesUploaded, total, speed)
        },
      })
    } finally {
      bar.finish()
    }

    const videoId = result!.photo_id
    this.log(chalk.green('Video uploaded successfully'))
    if (videoId) {
      const adminUrl = `https://${this.activeWorkspace.domain}/manage/video/${videoId}`
      this.log(`ID:    ${videoId}`)
      this.log(`Admin: ${adminUrl}`)
      if (this.jsonEnabled()) {
        return formatJsonOutput({
          ok: true,
          data: { ...result!, admin_url: adminUrl },
          summary: 'Video uploaded',
          breadcrumbs: [
            { domain: this.activeWorkspace.domain },
            { resource: 'video', id: String(videoId) },
          ],
        })
      }
    } else if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: result!,
        summary: 'Video uploaded',
        breadcrumbs: [{ domain: this.activeWorkspace.domain }],
      })
    }
  }
}
