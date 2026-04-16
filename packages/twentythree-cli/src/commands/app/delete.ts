import { Args } from '@oclif/core'
import chalk from 'chalk'
import { confirm, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * App delete command — removes an app integration after confirmation (APP-03).
 *
 * Threat mitigations:
 *   T-08-04: confirm() prompt includes workspace domain before destructive POST (repudiation)
 *   T-08-05: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class AppDelete extends AuthenticatedCommand<typeof AppDelete> {
  static description = 'Delete an app integration from the active workspace'

  static examples = [
    '<%= config.bin %> app delete 12345',
    '<%= config.bin %> app delete 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'App ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /app/delete',
    auth_scope: 'write' as const,
    output_shape: {
      type: 'key-value' as const,
    },
    side_effects: 'destructive' as const,
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(AppDelete)
    this.printWorkspaceHeader()

    if (!this.jsonEnabled()) {
      // T-08-04: Confirmation prompt includes workspace domain so user knows which workspace
      const confirmed = await confirm({
        message: `Delete app ${args.id} from ${this.activeWorkspace.domain}? This cannot be undone.`,
      })

      if (isCancel(confirmed) || !confirmed) {
        process.exit(EXIT_CANCELLED)
      }
    }

    const { data: deleteData, error: deleteError } = await this.apiClient.POST('/app/delete', {
      body: { app_id: Number(args.id) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (deleteError) {
      this.error(applyCliTerms(formatApiError(deleteError)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`App ${args.id} deleted`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: deleteData,
        summary: `App ${args.id} deleted`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'app', id: args.id },
        ],
      })
    }
  }
}
