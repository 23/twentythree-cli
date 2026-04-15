import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { confirm, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar series cancel command — cancels a series after confirmation.
 *
 * CRITICAL: Uses live_series_id (NOT live_id).
 * Supports --cancel-associations to also cancel associated webinars.
 *
 * Threat mitigations:
 *   T-05-17: Confirmation prompt includes domain
 *   T-05-16: applyCliTerms() on all error messages
 */
export default class WebinarSeriesCancel extends AuthenticatedCommand<typeof WebinarSeriesCancel> {
  static description = 'Cancel a webinar series'

  static examples = [
    '<%= config.bin %> webinar series cancel 42',
    '<%= config.bin %> webinar series cancel 42 --cancel-associations',
    '<%= config.bin %> webinar series cancel 42 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'cancel-associations': Flags.boolean({
      description: 'Also cancel associated webinars',
      allowNo: true,
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Series ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarSeriesCancel)
    this.printWorkspaceHeader()

    if (!this.jsonEnabled()) {
      // T-05-17: Confirmation includes domain
      const confirmed = await confirm({
        message: `Cancel series ${args.id} on ${this.activeWorkspace.domain}? This cannot be undone.`,
      })

      if (isCancel(confirmed) || !confirmed) {
        process.exit(EXIT_CANCELLED)
      }
    }

    // CRITICAL: live_series_id NOT live_id
    const body: Record<string, unknown> = { live_series_id: Number(args.id) }
    if (flags['cancel-associations'] !== undefined) {
      body.cancel_associations_p = flags['cancel-associations'] ? 1 : 0
    }

    const { data, error } = await this.apiClient.POST('/live/series/cancel', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Series ${args.id} cancelled`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Series ${args.id} cancelled`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'series', id: args.id },
        ],
      })
    }
  }
}
