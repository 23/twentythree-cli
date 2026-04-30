import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar series update command — updates an existing webinar series.
 *
 * CRITICAL: Uses live_series_id (NOT live_id) for identifying the series.
 * Only includes fields in the body where flags are explicitly provided.
 *
 * Threat mitigations:
 *   T-05-16: applyCliTerms() on all error messages
 */
export default class WebinarSeriesUpdate extends AuthenticatedCommand<typeof WebinarSeriesUpdate> {
  static description = 'Update a webinar series'

  static examples = [
    '<%= config.bin %> webinar series update 42 --name "Updated Series"',
    '<%= config.bin %> webinar series update 42 --description "New description"',
    '<%= config.bin %> webinar series update 42 --name "Updated" --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    name: Flags.string({
      description: 'Series name',
      required: false,
    }),
    description: Flags.string({
      description: 'Series description',
      required: false,
    }),
    'seo-policy': Flags.string({
      description: 'SEO policy for the series: index, noindex, or empty string to reset',
      options: ['', 'index', 'noindex'],
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Series ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /live/series/update',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'updates' as const,
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarSeriesUpdate)
    this.printWorkspaceHeader()

    // CRITICAL: live_series_id NOT live_id
    const body: Record<string, unknown> = { live_series_id: Number(args.id) }
    if (flags.name !== undefined) body.name = flags.name
    if (flags.description !== undefined) body.description = flags.description
    if (flags['seo-policy'] !== undefined) body.seo_policy = flags['seo-policy']

    const { data, error } = await this.apiClient.POST('/live/series/update', {
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
        summary: 'Series updated',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'series', id: args.id },
        ],
      })
    }

    this.log(chalk.green('Series updated'))
  }
}
