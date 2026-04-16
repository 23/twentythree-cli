import { Args } from '@oclif/core'
import { stat, readFile } from 'node:fs/promises'
import { basename } from 'node:path'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Action upload command — uploads a file to an action variable via simple multipart FormData.
 *
 * D-1: Uses native fetch + FormData — NOT the chunked upload engine.
 * This endpoint does not use an upload_token protocol; the file goes directly to an action variable.
 *
 * Threat mitigations:
 *   T-06-01: File existence is validated via stat() before reading; file path is user-provided CLI arg
 *   T-06-02: Bearer token sent only when configured; only Authorization header used (no URL embedding)
 */
export default class ActionUpload extends AuthenticatedCommand<typeof ActionUpload> {
  static description = 'Upload a file to an action variable'

  static examples = [
    '<%= config.bin %> action upload 12345 image ./banner.png',
    '<%= config.bin %> action upload 12345 video ./clip.mp4',
    '<%= config.bin %> action upload 12345 image ./banner.png --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /action/upload',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'creates' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Action ID', required: true }),
    'variable-name': Args.string({ description: 'Variable name for the file upload', required: true }),
    file: Args.string({ description: 'Path to the file to upload', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(ActionUpload)

    this.printWorkspaceHeader()

    // T-06-01: Validate file exists before reading
    try {
      await stat(args.file)
    } catch {
      this.error(`File not found: ${args.file}`, { exit: EXIT_ERROR })
    }

    // Read the file into memory
    const fileBuffer = await readFile(args.file)

    // Build FormData — D-1: simple one-shot multipart POST
    const formData = new FormData()
    formData.append('action_id', String(Number(args.id)))
    formData.append('variable_name', args['variable-name'])
    formData.append('file', new Blob([fileBuffer]), basename(args.file))

    // T-06-02: Build Authorization header only if token exists
    const headers: Record<string, string> = {}
    const token = this.activeWorkspace.bearer_token
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // D-1: POST via native fetch — NOT this.apiClient.POST (no openapi-fetch for this endpoint)
    const response = await fetch(`${this.apiBaseUrl}action/upload`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      this.error(applyCliTerms(formatApiError(errorText || `HTTP ${response.status}`)), { exit: EXIT_ERROR })
    }

    const json = await response.json() as unknown

    this.log(chalk.green('File uploaded to action variable'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: json,
        summary: 'File uploaded',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'action', id: args.id },
        ],
      })
    }
  }
}
