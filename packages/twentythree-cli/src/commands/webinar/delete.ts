import { Args } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Webinar delete command — deletes a webinar after confirmation.
 *
 * Prompts user to confirm deletion showing the workspace domain and warning
 * that all recordings will be permanently deleted (T-04-06 repudiation mitigation).
 *
 * --yes (or --json) skips the confirmation prompt. Without a TTY and without either
 * flag the command exits 2 and names the flag to pass, instead of hanging.
 *
 * Threat mitigations:
 *   T-04-06: Confirmation prompt includes domain AND "permanently deletes all recordings" warning
 *   T-04-08: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class WebinarDelete extends AuthenticatedCommand<typeof WebinarDelete> {
  static description = 'Delete a webinar from the active workspace'

  static examples = [
    '<%= config.bin %> webinar delete 12345',
    '<%= config.bin %> webinar delete 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    ...AuthenticatedCommand.destructiveFlags,
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /live/delete',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'destructive' as const,
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(WebinarDelete)
    this.printWorkspaceHeader()

    // T-04-06: Confirmation includes domain and recordings warning
    await this.confirmDestructive(`Delete webinar ${args.id} from ${this.activeWorkspace.domain}? This permanently deletes all recordings. This cannot be undone.`)

    const { data: deleteData, error: deleteError } = await this.apiClient.POST('/live/delete', {
      body: { live_id: Number(args.id) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (deleteError) {
      this.error(applyCliTerms(formatApiError(deleteError)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Webinar ${args.id} deleted`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: deleteData,
        summary: `Webinar ${args.id} deleted`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
        ],
      })
    }
  }
}
