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
 * T-05-05: shows only byte counts, never the speaker token.
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
 * Webinar speaker set-avatar command — uploads an avatar image for a speaker.
 *
 * CRITICAL: tokenFieldName is 'live_speaker_id' (NOT 'live_id') — the upload
 * token value is the speaker ID, not the webinar ID.
 *
 * Threat mitigations:
 *   T-05-05: Progress bar shows only byte counts, never the speaker token
 *   T-05-06: tokenFieldName explicitly set to 'live_speaker_id'
 *   T-05-07: applyCliTerms() on all error messages
 */
export default class WebinarSpeakerSetAvatar extends AuthenticatedCommand<typeof WebinarSpeakerSetAvatar> {
  static description = 'Upload an avatar image for a speaker'

  static examples = [
    '<%= config.bin %> webinar speaker set-avatar 9900 ./avatar.jpg',
    '<%= config.bin %> webinar speaker set-avatar 9900 ./avatar.png --chunk-size 524288',
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
    id: Args.string({ description: 'Speaker ID', required: true }),
    file: Args.string({ description: 'Path to image file', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarSpeakerSetAvatar)
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
        uploadToken: String(args.id),        // speaker ID is the token value
        tokenFieldName: 'live_speaker_id',   // CRITICAL: NOT 'live_id' (T-05-06)
        uploadUrl: `${this.apiBaseUrl}live/speaker/set-avatar`,
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

    this.log(chalk.green('Speaker avatar uploaded'))
    this.log(`ID: ${args.id}`)

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: result!,
        summary: 'Speaker avatar uploaded',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'speaker', id: args.id },
        ],
      })
    }
  }
}
