import { Flags } from '@oclif/core'
import { stat } from 'node:fs/promises'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatBytes, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'
import { uploadChunked } from '../../upload/chunked-upload.js'
import { DEFAULT_CHUNK_SIZE, DEFAULT_CONCURRENCY } from '../../upload/types.js'

/**
 * Simple inline progress bar that writes directly to stderr using \r.
 * T-08-18: shows only byte counts, never the open upload token.
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
 * Open upload file command — uploads a file using the chunked upload engine
 * via an open upload token.
 *
 * CRITICAL (Pitfall 3): tokenFieldName must be 'token', NOT 'upload_token'.
 * The open upload endpoint uses 'token' as the field name for the upload token.
 *
 * Flow:
 *   1. Validate file exists
 *   2. Upload file in chunks via chunked engine with tokenFieldName: 'token'
 *   3. Display success message; optionally return --json result
 *
 * Threat mitigations:
 *   T-08-18: Token not logged in progress output — only byte counts shown
 *   T-08-19: uploadUrl HTTPS validation enforced by chunked-upload.ts (T-03-02)
 *   T-08-21: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class OpenuploadUploadFile extends AuthenticatedCommand<typeof OpenuploadUploadFile> {
  static description = 'Upload a file via an open upload token using the chunked upload engine'

  static examples = [
    '<%= config.bin %> openupload upload-file --file-path ./video.mp4 --token-upload-id 123 --token abc123',
    '<%= config.bin %> openupload upload-file --file-path ./video.mp4 --token-upload-id 123 --token abc123 --chunk-size 52428800',
    '<%= config.bin %> openupload upload-file --file-path ./video.mp4 --token-upload-id 123 --token abc123 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'file-path': Flags.string({
      description: 'Path to the file to upload',
      required: true,
    }),
    'token-upload-id': Flags.string({
      description: 'Open upload token upload ID',
      required: true,
    }),
    token: Flags.string({
      description: 'Open upload token',
      required: true,
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

  static agentMetadata = {
    api_endpoint: 'POST /openupload/upload-file',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'creates' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(OpenuploadUploadFile)

    this.printWorkspaceHeader()

    // Validate file exists and capture size in a single syscall
    let fileStat: import('node:fs').Stats
    try {
      fileStat = await stat(flags['file-path'])
    } catch {
      this.error(`File not found: ${flags['file-path']}`, { exit: EXIT_ERROR })
      return // unreachable but satisfies TypeScript definite assignment
    }

    const totalBytes = fileStat.size
    const bar = new ProgressBar()
    const startTime = Date.now()
    // Show initial 0% so the bar is visible from the start
    bar.render(0, totalBytes, 0)

    // CRITICAL (Pitfall 3): tokenFieldName must be 'token', NOT 'upload_token'
    // The open upload endpoint uses 'token' as the multipart field name.
    let result: Awaited<ReturnType<typeof uploadChunked>>
    try {
      result = await uploadChunked({
        filePath: flags['file-path'],
        uploadToken: flags.token,
        tokenFieldName: 'token',
        uploadUrl: `${this.apiBaseUrl}openupload/upload-file`,
        bearerToken: this.activeWorkspace.bearer_token || undefined,
        chunkSize: flags['chunk-size'],
        concurrency: flags.concurrency,
        extraFields: {
          token_upload_id: flags['token-upload-id'],
        },
        onProgress(bytesUploaded, total) {
          const elapsed = (Date.now() - startTime) / 1000
          const speed = elapsed > 0 ? bytesUploaded / elapsed : 0
          bar.render(bytesUploaded, total, speed)
        },
      })
    } catch (err) {
      bar.finish()
      throw err
    }
    bar.finish()

    this.log(chalk.green('File uploaded via open upload'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: result,
        summary: 'File uploaded via open upload',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'openupload' },
        ],
      })
    }
  }
}
