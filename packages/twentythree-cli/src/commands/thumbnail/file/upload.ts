import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Thumbnail file upload command — uploads an image file to a thumbnail template.
 *
 * Maps to POST /thumbnail/template/upload-file.
 * Uses direct multipart POST with bodySerializer to create FormData (Pattern F).
 * Per D-3: this is NOT the chunked engine — thumbnail files are images uploaded directly.
 *
 * Threat mitigations:
 *   T-08-08: Validates file exists via fs.existsSync before reading (prevents misleading errors)
 *   T-08-09: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class ThumbnailFileUpload extends AuthenticatedCommand<typeof ThumbnailFileUpload> {
  static description = 'Upload an image file to a thumbnail template'

  static examples = [
    '<%= config.bin %> thumbnail file upload ./logo.png --template-id 42',
    '<%= config.bin %> thumbnail file upload ./banner.jpg --template-id 42 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'template-id': Flags.string({
      description: 'Thumbnail template ID',
      required: true,
    }),
  }

  static args = {
    file: Args.string({ description: 'Path to the image file to upload', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /thumbnail/template/upload-file',
    auth_scope: 'write' as const,
    output_shape: {
      type: 'key-value' as const,
    },
    side_effects: 'creates' as const,
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(ThumbnailFileUpload)
    this.printWorkspaceHeader()

    // T-08-08: Validate file exists before reading
    const filePath = path.resolve(args.file)
    if (!fs.existsSync(filePath)) {
      this.error(`File not found: ${filePath}`, { exit: EXIT_ERROR })
    }

    // Read file into Buffer and create Blob for multipart upload
    const fileBuffer = fs.readFileSync(filePath)
    const fileName = path.basename(filePath)
    const fileBlob = new Blob([fileBuffer])

    // D-3: Direct multipart POST (NOT chunked engine) — thumbnail files use bodySerializer FormData
    const { data, error } = await this.apiClient.POST('/thumbnail/template/upload-file', {
      body: {
        thumbnail_template_id: Number(flags['template-id']),
        file: fileBlob as unknown as Record<string, never>,
      },
      bodySerializer(body) {
        const fd = new FormData()
        for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
          if (v !== undefined) {
            if (v instanceof Blob) {
              fd.append(k, v, fileName)
            } else {
              fd.append(k, String(v))
            }
          }
        }
        return fd
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green('File uploaded'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `File "${fileName}" uploaded to thumbnail template ${flags['template-id']}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'thumbnail', id: flags['template-id'] },
        ],
      })
    }
  }
}
