import { Args, Flags } from '@oclif/core'
import { stat } from 'node:fs/promises'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatBytes, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'
import { uploadChunked } from '../../../upload/chunked-upload.js'
import { DEFAULT_CHUNK_SIZE, DEFAULT_CONCURRENCY } from '../../../upload/types.js'

/**
 * Simple inline progress bar that writes directly to stderr using \r.
 * T-05-14: shows only byte counts, never the series token.
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
 * Webinar series upload-thumbnail command — uploads a thumbnail for a series.
 *
 * Uses the chunked upload engine with live_series_id as the token field name.
 *
 * Threat mitigations:
 *   T-05-14: live_series_id never logged to stdout — only byte counts shown in progress bar
 *   T-05-15: tokenFieldName explicitly set to 'live_series_id'
 */
export default class WebinarSeriesUploadThumbnail extends AuthenticatedCommand<typeof WebinarSeriesUploadThumbnail> {
  static description = 'Upload a thumbnail for a webinar series'

  static examples = [
    '<%= config.bin %> webinar series upload-thumbnail 42 ./thumb.jpg',
    '<%= config.bin %> webinar series upload-thumbnail 42 ./thumbnail.png --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'chunk-size': Flags.integer({
      description: `Chunk size in bytes (default: ${DEFAULT_CHUNK_SIZE})`,
      default: DEFAULT_CHUNK_SIZE,
    }),
    concurrency: Flags.integer({
      description: `Number of chunks to upload in parallel (default: ${DEFAULT_CONCURRENCY})`,
      default: DEFAULT_CONCURRENCY,
    }),
  }

  static args = {
    id: Args.string({ description: 'Series ID', required: true }),
    file: Args.string({ description: 'Path to the image file to upload', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarSeriesUploadThumbnail)
    this.printWorkspaceHeader()

    // Validate file exists
    try {
      await stat(args.file)
    } catch {
      this.error(applyCliTerms(`File not found: ${args.file}`), { exit: EXIT_ERROR })
    }

    const fileStat = await stat(args.file)
    const totalBytes = fileStat.size
    const bar = new ProgressBar()
    const startTime = Date.now()
    let result: Awaited<ReturnType<typeof uploadChunked>>

    bar.render(0, totalBytes, 0)

    try {
      result = await uploadChunked({
        filePath: args.file,
        uploadToken: String(args.id),            // series ID as the "token" value
        tokenFieldName: 'live_series_id',        // T-05-15: explicit field name
        uploadUrl: `${this.apiBaseUrl}live/series/upload-thumbnail`,
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

    this.log(chalk.green('Series thumbnail uploaded'))
    this.log(`ID:    ${args.id}`)
    this.log(`Admin: https://${this.activeWorkspace.domain}/manage/webinar/series/${args.id}`)

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: result!,
        summary: 'Series thumbnail uploaded',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'series', id: args.id },
        ],
      })
    }
  }
}
