import { Args } from '@oclif/core'
import chalk from 'chalk'
import { confirm, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, EXIT_ERROR, EXIT_CANCELLED } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Thumbnail template delete command — deletes a thumbnail template after confirmation.
 *
 * Maps to POST /thumbnail/template/delete.
 * Prompts user to confirm deletion with workspace domain (T-08-07 repudiation mitigation).
 * --json flag skips the confirmation prompt (scripting mode — assume confirmed).
 *
 * Threat mitigations:
 *   T-08-07: Confirmation prompt includes workspace domain
 *   T-08-09: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class ThumbnailDelete extends AuthenticatedCommand<typeof ThumbnailDelete> {
  static description = 'Delete a thumbnail template from the active workspace'

  static examples = [
    '<%= config.bin %> thumbnail delete 42',
    '<%= config.bin %> thumbnail delete 42 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Thumbnail template ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /thumbnail/template/delete',
    auth_scope: 'write' as const,
    output_shape: {
      type: 'key-value' as const,
    },
    side_effects: 'destructive' as const,
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(ThumbnailDelete)
    this.printWorkspaceHeader()

    if (!this.jsonEnabled()) {
      // T-08-07: Confirmation prompt includes workspace domain
      const confirmed = await confirm({
        message: `Delete thumbnail template ${args.id} from ${this.activeWorkspace.domain}? This cannot be undone.`,
      })

      if (isCancel(confirmed) || !confirmed) {
        process.exit(EXIT_CANCELLED)
      }
    }

    const { data: deleteData, error: deleteError } = await this.apiClient.POST('/thumbnail/template/delete', {
      body: { thumbnail_template_id: Number(args.id) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (deleteError) {
      this.error(applyCliTerms(String(deleteError)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Thumbnail template ${args.id} deleted`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: deleteData,
        summary: `Thumbnail template ${args.id} deleted`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'thumbnail', id: args.id },
        ],
      })
    }
  }
}
