import { Args, Flags } from '@oclif/core'
import { stat } from 'node:fs/promises'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatBytes, EXIT_ERROR, formatApiError } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'
import { uploadChunked } from '../../upload/chunked-upload.js'
import { DEFAULT_CHUNK_SIZE, DEFAULT_CONCURRENCY } from '../../upload/types.js'

/**
 * Simple inline progress bar that writes directly to stderr using \r.
 * Avoids all TTY-detection issues that afflict cli-progress.
 * T-03-10: shows only byte counts, never the replace_token.
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
    process.stderr.write('\n')
    this.lastLen = 0
  }
}

/**
 * Video replace command — replaces a video file using the replace-token flow.
 *
 * Flow:
 *   1. GET /photo/get-replace-token (with photo_id)
 *   2. Upload replacement file in chunks using chunked-upload engine to /photo/replace
 *   3. Display success message; optionally return --json result
 *
 * Threat mitigations:
 *   T-03-10: replace_token is never logged — only byte counts shown in progress bar
 *   T-03-09: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class VideoReplace extends AuthenticatedCommand<typeof VideoReplace> {
  static description = 'Replace the video file for an existing video'

  static examples = [
    '<%= config.bin %> video replace 12345 ./new-video.mp4',
    '<%= config.bin %> video replace 12345 ./new-video.mp4 --chunk-size 52428800 --concurrency 3',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /photo/replace',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'updates' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
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
    id: Args.string({ description: 'Video ID to replace', required: true }),
    file: Args.string({ description: 'Path to the replacement video file', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(VideoReplace)

    this.printWorkspaceHeader()

    // Validate file exists
    try {
      await stat(args.file)
    } catch {
      this.error(`File not found: ${args.file}`, { exit: EXIT_ERROR })
    }

    // Step 1: Get replace token (not upload token — T-03-10, Pitfall 1)
    const { data: tokenData, error: tokenError } = await this.apiClient.GET('/photo/get-replace-token', {
      params: {
        query: { photo_id: Number(args.id) },
      },
    })

    if (tokenError) {
      this.error(applyCliTerms(formatApiError(tokenError)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const replaceToken = (tokenData as any)?.data?.replace_token as string | undefined
    if (!replaceToken) {
      this.error('Failed to obtain replace token from API', { exit: EXIT_ERROR })
    }

    // Step 2: Upload chunks with inline progress bar
    const fileStat = await stat(args.file)
    const totalBytes = fileStat.size
    const bar = new ProgressBar()
    const startTime = Date.now()
    let result: Awaited<ReturnType<typeof uploadChunked>> | undefined

    // Show initial 0% so the bar is visible from the start
    bar.render(0, totalBytes, 0)

    try {
      result = await uploadChunked({
        filePath: args.file,
        uploadToken: replaceToken,
        tokenFieldName: 'replace_token',
        uploadUrl: `${this.apiBaseUrl}photo/replace`,
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

    // Should never be undefined — uploadChunked throws on failure, which propagates
    // through finally and skips the code below. Guard here for static analysis safety.
    if (!result) return

    const adminUrl = `https://${this.activeWorkspace.domain}/manage/video/${args.id}`
    this.log(chalk.green(`Video ${args.id} replaced successfully`))
    this.log(`ID:    ${args.id}`)
    this.log(`Admin: ${adminUrl}`)

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: { ...result, admin_url: adminUrl },
        summary: `Video ${args.id} replaced`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'video', id: args.id },
        ],
      })
    }
  }
}
