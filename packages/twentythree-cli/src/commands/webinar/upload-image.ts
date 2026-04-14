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
 * T-04-09: shows only byte counts, never the live_id token.
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
 * Webinar upload-image command — uploads a thumbnail, preview, or before-webinar image.
 *
 * Uses the chunked upload engine with live_id as the token field name.
 * Image type is sent via extraFields so it reaches every chunk's FormData.
 *
 * Threat mitigations:
 *   T-04-09: live_id never logged to stdout — only byte counts shown in progress bar
 *   T-04-11: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class WebinarUploadImage extends AuthenticatedCommand<typeof WebinarUploadImage> {
  static description = 'Upload an image for a webinar (thumbnail, preview, or before-webinar)'

  static examples = [
    '<%= config.bin %> webinar upload-image 12345 ./thumb.jpg',
    '<%= config.bin %> webinar upload-image 12345 ./preview.png --type preview',
    '<%= config.bin %> webinar upload-image 12345 ./before.jpg --type before_webinar',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    type: Flags.string({
      description: 'Image type',
      options: ['thumbnail', 'preview', 'before_webinar'],
      default: 'thumbnail',
    }),
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
    id: Args.string({ description: 'Webinar ID', required: true }),
    file: Args.string({ description: 'Path to the image file to upload', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarUploadImage)
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
        uploadToken: String(args.id),       // live_id is the "token" value
        tokenFieldName: 'live_id',          // Field name for the webinar ID
        uploadUrl: `${this.apiBaseUrl}live/upload-image`,
        bearerToken: this.activeWorkspace.bearer_token || undefined,
        chunkSize: flags['chunk-size'],
        concurrency: flags.concurrency,
        extraFields: { type: flags.type },  // thumbnail|preview|before_webinar
        onProgress(bytesUploaded, total) {
          const elapsed = (Date.now() - startTime) / 1000
          const speed = elapsed > 0 ? bytesUploaded / elapsed : 0
          bar.render(bytesUploaded, total, speed)
        },
      })
    } finally {
      bar.finish()
    }

    this.log(chalk.green('Webinar image uploaded'))
    this.log(`ID:    ${args.id}`)
    this.log(`Type:  ${flags.type}`)
    this.log(`Admin: https://${this.activeWorkspace.domain}/manage/webinar/${args.id}`)

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: result!,
        summary: 'Webinar image uploaded',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
        ],
      })
    }
  }
}
