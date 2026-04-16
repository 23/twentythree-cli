import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Open upload update-file command — updates metadata for an open upload entry.
 *
 * Requires token-upload-id, token, and upload-key to identify the entry.
 * Optional title, description, and tags can be updated.
 *
 * Threat mitigations:
 *   T-08-21: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class OpenuploadUpdateFile extends AuthenticatedCommand<typeof OpenuploadUpdateFile> {
  static description = 'Update metadata for an open upload entry'

  static examples = [
    '<%= config.bin %> openupload update-file --token-upload-id 123 --token abc123 --upload-key key456 --title "My Video"',
    '<%= config.bin %> openupload update-file --token-upload-id 123 --token abc123 --upload-key key456 --tags "demo tutorial"',
    '<%= config.bin %> openupload update-file --token-upload-id 123 --token abc123 --upload-key key456 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'token-upload-id': Flags.string({
      description: 'Open upload token upload ID',
      required: true,
    }),
    token: Flags.string({
      description: 'Open upload token',
      required: true,
    }),
    'upload-key': Flags.string({
      description: 'Upload key identifying the uploaded file',
      required: true,
    }),
    title: Flags.string({
      description: 'New title for the uploaded file',
      required: false,
    }),
    description: Flags.string({
      description: 'New description for the uploaded file',
      required: false,
    }),
    tags: Flags.string({
      description: 'Tags for the uploaded file (space-separated)',
      required: false,
    }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /openupload/update-file',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'updates' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(OpenuploadUpdateFile)

    this.printWorkspaceHeader()

    const body: Record<string, unknown> = {
      token_upload_id: flags['token-upload-id'],
      token: flags.token,
      upload_key: flags['upload-key'],
    }

    if (flags.title !== undefined) body.title = flags.title
    if (flags.description !== undefined) body.description = flags.description
    if (flags.tags !== undefined) body.tags = flags.tags

    const { data: updateData, error: updateError } = await this.apiClient.POST('/openupload/update-file', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (updateError) {
      this.error(applyCliTerms(formatApiError(updateError)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green('Open upload entry updated'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: updateData,
        summary: 'Open upload entry updated',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'openupload' },
        ],
      })
    }
  }
}
