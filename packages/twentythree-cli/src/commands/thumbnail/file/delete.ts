import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { confirm, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Thumbnail file delete command — deletes a file from a thumbnail template.
 *
 * Maps to POST /thumbnail/template/delete-file.
 * Prompts user to confirm deletion with workspace domain (T-08-07 repudiation mitigation).
 * --json flag skips the confirmation prompt (scripting mode — assume confirmed).
 *
 * Threat mitigations:
 *   T-08-07: Confirmation prompt includes workspace domain
 *   T-08-09: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class ThumbnailFileDelete extends AuthenticatedCommand<typeof ThumbnailFileDelete> {
  static description = 'Delete a file from a thumbnail template'

  static examples = [
    '<%= config.bin %> thumbnail file delete --template-id 42 --filename logo.png',
    '<%= config.bin %> thumbnail file delete --template-id 42 --filename logo.png --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'template-id': Flags.string({
      description: 'Thumbnail template ID',
      required: true,
    }),
    filename: Flags.string({
      description: 'Filename to delete',
      required: true,
    }),
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'POST /thumbnail/template/delete-file',
    auth_scope: 'write' as const,
    output_shape: {
      type: 'key-value' as const,
    },
    side_effects: 'destructive' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(ThumbnailFileDelete)
    this.printWorkspaceHeader()

    if (!this.jsonEnabled()) {
      // T-08-07: Confirmation prompt includes workspace domain
      const confirmed = await confirm({
        message: `Delete file "${flags.filename}" from template ${flags['template-id']} on ${this.activeWorkspace.domain}?`,
      })

      if (isCancel(confirmed) || !confirmed) {
        process.exit(EXIT_CANCELLED)
      }
    }

    const { data: deleteData, error: deleteError } = await this.apiClient.POST('/thumbnail/template/delete-file', {
      body: {
        thumbnail_template_id: Number(flags['template-id']),
        filename: flags.filename,
      } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (deleteError) {
      this.error(applyCliTerms(String(deleteError)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`File "${flags.filename}" deleted from template ${flags['template-id']}`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: deleteData,
        summary: `File "${flags.filename}" deleted from thumbnail template ${flags['template-id']}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'thumbnail', id: flags['template-id'] },
        ],
      })
    }
  }
}
