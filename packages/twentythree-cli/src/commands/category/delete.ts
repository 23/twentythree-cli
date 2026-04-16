import { Args } from '@oclif/core'
import chalk from 'chalk'
import { confirm, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Category delete command — deletes a category after confirmation.
 *
 * Prompts user to confirm deletion showing the workspace domain so they know
 * which workspace they are deleting from (T-04-02 repudiation mitigation).
 *
 * --json flag skips the confirmation prompt (scripting mode — assume confirmed).
 *
 * Maps to the /album/delete API endpoint.
 * "album" is the API term; "category" is the CLI user-facing term (term-map.ts).
 *
 * Exit codes:
 *   0 — success
 *   1 — error (category not found, API error)
 *   2 — cancelled (user declined confirmation)
 *
 * Threat mitigations:
 *   T-04-02: Confirmation prompt includes workspace domain
 *   T-04-04: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class CategoryDelete extends AuthenticatedCommand<typeof CategoryDelete> {
  static description = 'Delete a category from the active workspace'

  static agentMetadata = {
    api_endpoint: 'POST /album/delete',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'destructive' as const,
  }

  static examples = [
    '<%= config.bin %> category delete 42',
    '<%= config.bin %> category delete 42 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Category ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(CategoryDelete)

    this.printWorkspaceHeader()

    if (!this.jsonEnabled()) {
      // T-04-02: Confirmation prompt includes workspace domain so user knows which workspace
      const confirmed = await confirm({
        message: `Delete category ${args.id} from ${this.activeWorkspace.domain}? This cannot be undone.`,
      })

      if (isCancel(confirmed) || !confirmed) {
        process.exit(EXIT_CANCELLED)
      }
    }

    const { data: deleteData, error: deleteError } = await this.apiClient.POST('/album/delete', {
      body: { album_id: Number(args.id) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (deleteError) {
      this.error(applyCliTerms(formatApiError(deleteError)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Category ${args.id} deleted`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: deleteData,
        summary: `Category ${args.id} deleted`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'category', id: args.id },
        ],
      })
    }
  }
}
