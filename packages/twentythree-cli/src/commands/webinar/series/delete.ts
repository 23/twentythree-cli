import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { confirm, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar series delete command — deletes a series after confirmation.
 *
 * CRITICAL: Uses live_series_id (NOT live_id).
 * Supports --delete-associations to also delete associated webinars.
 *
 * Threat mitigations:
 *   T-05-17: Confirmation prompt includes domain
 *   T-05-16: applyCliTerms() on all error messages
 */
export default class WebinarSeriesDelete extends AuthenticatedCommand<typeof WebinarSeriesDelete> {
  static description = 'Delete a webinar series'

  static examples = [
    '<%= config.bin %> webinar series delete 42',
    '<%= config.bin %> webinar series delete 42 --delete-associations',
    '<%= config.bin %> webinar series delete 42 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'delete-associations': Flags.boolean({
      description: 'Also delete associated webinars',
      allowNo: true,
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Series ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /live/series/delete',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'destructive' as const,
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarSeriesDelete)
    this.printWorkspaceHeader()

    if (!this.jsonEnabled()) {
      // T-05-17: Confirmation includes domain
      const confirmed = await confirm({
        message: `Delete series ${args.id} from ${this.activeWorkspace.domain}? This cannot be undone.`,
      })

      if (isCancel(confirmed) || !confirmed) {
        process.exit(EXIT_CANCELLED)
      }
    }

    // CRITICAL: live_series_id NOT live_id
    const body: Record<string, unknown> = { live_series_id: Number(args.id) }
    if (flags['delete-associations'] !== undefined) {
      body.delete_associations_p = flags['delete-associations'] ? 1 : 0
    }

    const { data, error } = await this.apiClient.POST('/live/series/delete', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Series ${args.id} deleted`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Series ${args.id} deleted`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'series', id: args.id },
        ],
      })
    }
  }
}
