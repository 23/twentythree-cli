import { Args } from '@oclif/core'
import chalk from 'chalk'
import { confirm, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Spot delete command — deletes a spot after confirmation.
 *
 * Maps to the POST /spot/delete API endpoint.
 * Prompts user to confirm deletion showing the workspace domain so they know
 * which workspace they are deleting from (T-08-01 repudiation mitigation).
 *
 * --json flag skips the confirmation prompt (scripting mode — assume confirmed).
 *
 * Exit codes:
 *   0 — success
 *   1 — error (spot not found, API error)
 *   2 — cancelled (user declined confirmation)
 *
 * Threat mitigations:
 *   T-08-01: Confirmation prompt includes workspace domain
 *   T-08-02: extends AuthenticatedCommand — anonymous mode rejected with AUTH-10 error
 */
export default class SpotDelete extends AuthenticatedCommand<typeof SpotDelete> {
  static description = 'Delete a spot from the active workspace'

  static examples = [
    '<%= config.bin %> spot delete 12345',
    '<%= config.bin %> spot delete 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Spot ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /spot/delete',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'destructive' as const,
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(SpotDelete)

    this.printWorkspaceHeader()

    if (!this.jsonEnabled()) {
      // T-08-01: Confirmation prompt includes workspace domain so user knows which workspace
      const confirmed = await confirm({
        message: `Delete spot ${args.id} from ${this.activeWorkspace.domain}? This cannot be undone.`,
      })

      if (isCancel(confirmed) || !confirmed) {
        process.exit(EXIT_CANCELLED)
      }
    }

    const { data: deleteData, error: deleteError } = await this.apiClient.POST('/spot/delete', {
      body: { spot_id: Number(args.id) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (deleteError) {
      this.error(applyCliTerms(formatApiError(deleteError)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Spot ${args.id} deleted`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: deleteData,
        summary: `Spot ${args.id} deleted`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'spot', id: args.id },
        ],
      })
    }
  }
}
