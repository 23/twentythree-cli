import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * App set-thumbnail command — uploads and sets a custom thumbnail image for an app.
 *
 * Uses direct multipart POST with bodySerializer to create FormData.
 * Per D-3: NOT the chunked engine — thumbnail images use direct multipart upload.
 *
 * Threat mitigations:
 *   T-08-08: Validates file exists via fs.existsSync before reading
 *   T-08-05: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class AppSetThumbnail extends AuthenticatedCommand<typeof AppSetThumbnail> {
  static description = 'Upload and set a custom thumbnail image for an app'

  static examples = [
    '<%= config.bin %> app set-thumbnail ./thumbnail.png --app-id 42',
    '<%= config.bin %> app set-thumbnail ./thumbnail.jpg --app-id 42 --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /app/set-thumbnail',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'updates' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'app-id': Flags.integer({
      description: 'App ID to update',
      required: true,
    }),
  }

  static args = {
    file: Args.string({ description: 'Path to the thumbnail image file', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(AppSetThumbnail)
    this.printWorkspaceHeader()

    // T-08-08: Validate file exists before reading
    const filePath = path.resolve(args.file)
    if (!fs.existsSync(filePath)) {
      this.error(`File not found: ${filePath}`, { exit: EXIT_ERROR })
    }

    const fileBuffer = fs.readFileSync(filePath)
    const fileName = path.basename(filePath)
    const fileBlob = new Blob([fileBuffer])

    // D-3: Direct multipart POST — app thumbnails use bodySerializer FormData
    const { data, error } = await this.apiClient.POST('/app/set-thumbnail', {
      body: {
        app_id: flags['app-id'],
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

    this.log(chalk.green(`Thumbnail set for app ${flags['app-id']}`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Thumbnail set for app ${flags['app-id']}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'app', id: String(flags['app-id']) },
        ],
      })
    }
  }
}
