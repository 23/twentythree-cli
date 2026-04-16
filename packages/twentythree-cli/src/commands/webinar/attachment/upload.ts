import { Args, Flags } from '@oclif/core'
import { stat } from 'node:fs/promises'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatBytes, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'
import { uploadChunked } from '../../../upload/chunked-upload.js'
import { DEFAULT_CHUNK_SIZE, DEFAULT_CONCURRENCY } from '../../../upload/types.js'

/**
 * Simple inline progress bar that writes directly to stderr using \r.
 * T-05-01: shows only byte counts, never the live_id token value.
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
 * Webinar attachment upload command — uploads a file attachment to a webinar.
 *
 * Uses the chunked upload engine with live_id as the token field name.
 *
 * Threat mitigations:
 *   T-05-01: Progress bar shows only byte counts, never the live_id token value
 *   T-05-02: tokenFieldName explicitly set to 'live_id' — never uses default 'upload_token'
 *   T-05-03: applyCliTerms() on all error messages — no 'live'/'photo'/'album' leaks
 */
export default class WebinarAttachmentUpload extends AuthenticatedCommand<typeof WebinarAttachmentUpload> {
  static description = 'Upload an attachment to a webinar'

  static examples = [
    '<%= config.bin %> webinar attachment upload 12345 ./slides.pdf',
    '<%= config.bin %> webinar attachment upload 12345 ./handout.pdf --hidden',
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
    hidden: Flags.boolean({
      description: 'Upload attachment as hidden',
      allowNo: true,
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
    file: Args.string({ description: 'Path to file to upload', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /live/attachment/upload',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'creates' as const,
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarAttachmentUpload)
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
        uploadToken: String(args.id),        // live_id is the "token" value
        tokenFieldName: 'live_id',           // T-05-02: field name for the webinar ID
        uploadUrl: `${this.apiBaseUrl}live/attachment/upload`,
        bearerToken: this.activeWorkspace.bearer_token || undefined,
        chunkSize: flags['chunk-size'],
        concurrency: flags.concurrency,
        extraFields: flags.hidden !== undefined ? { hidden_p: flags.hidden ? '1' : '0' } : {},
        onProgress(bytesUploaded, total) {
          const elapsed = (Date.now() - startTime) / 1000
          const speed = elapsed > 0 ? bytesUploaded / elapsed : 0
          bar.render(bytesUploaded, total, speed)
        },
      })
    } finally {
      bar.finish()
    }

    this.log(chalk.green('Attachment uploaded'))
    this.log(`ID:    ${args.id}`)
    this.log(`Admin: https://${this.activeWorkspace.domain}/manage/webinar/${args.id}`)

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: result!,
        summary: 'Attachment uploaded',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
          { resource: 'attachment' },
        ],
      })
    }
  }
}
