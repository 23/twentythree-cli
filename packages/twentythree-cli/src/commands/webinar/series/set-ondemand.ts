import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar series set-ondemand command — sets a series to on-demand availability.
 *
 * CRITICAL: Uses live_series_id (NOT live_id).
 * Supports --update-associations to also update associated webinars.
 *
 * Threat mitigations:
 *   T-05-16: applyCliTerms() on all error messages
 */
export default class WebinarSeriesSetOndemand extends AuthenticatedCommand<typeof WebinarSeriesSetOndemand> {
  static description = 'Set a webinar series to on-demand'

  static examples = [
    '<%= config.bin %> webinar series set-ondemand 42',
    '<%= config.bin %> webinar series set-ondemand 42 --update-associations',
    '<%= config.bin %> webinar series set-ondemand 42 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'update-associations': Flags.boolean({
      description: 'Also update associated webinars',
      allowNo: true,
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Series ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /live/series/set-ondemand',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'updates' as const,
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarSeriesSetOndemand)
    this.printWorkspaceHeader()

    // CRITICAL: live_series_id NOT live_id
    const body: Record<string, unknown> = { live_series_id: Number(args.id) }
    if (flags['update-associations'] !== undefined) {
      body.update_associations_p = flags['update-associations'] ? 1 : 0
    }

    const { data, error } = await this.apiClient.POST('/live/series/set-ondemand', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Series set to on-demand',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'series', id: args.id },
        ],
      })
    }

    this.log(chalk.green('Series set to on-demand'))
  }
}
