import { Flags } from '@oclif/core'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Audience funnel command — get audience funnel analytics (AUD-07).
 *
 * Returns a single object (Pitfall 6) — key-value rendering, NOT renderTable.
 * Metrics: visits, views, engagement, conversions, new_conversions.
 * Uses _fmt-suffixed versions when available for human-readable numbers.
 */
export default class AudienceFunnel extends AuthenticatedCommand<typeof AudienceFunnel> {
  static description = 'Get audience funnel analytics'

  static examples = [
    '<%= config.bin %> audience funnel',
    '<%= config.bin %> audience funnel --objects "123 456" --json',
    '<%= config.bin %> audience funnel --live-type on_demand --resolve-recordings',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    objects: Flags.string({
      description: 'Filter by object IDs (space-separated)',
      required: false,
    }),
    'live-type': Flags.string({
      description: 'Live event type filter',
      required: false,
    }),
    'resolve-recordings': Flags.boolean({
      description: 'Resolve recording details',
      required: false,
    }),
    'resolve-live-series': Flags.boolean({
      description: 'Resolve live series details',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AudienceFunnel)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/audience/funnel', {
      params: {
        query: {
          objects: flags.objects,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          live_type: flags['live-type'] as any,
          resolve_recordings_p: flags['resolve-recordings'] || undefined,
          resolve_live_series_p: flags['resolve-live-series'] || undefined,
        },
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    const metrics = resp?.data

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: metrics ?? {},
        summary: 'Audience funnel analytics',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'audience' },
        ],
      })
    }

    if (!metrics || Object.keys(metrics).length === 0) {
      this.log('No funnel data found.')
      return
    }

    // Single-object response (Pitfall 6) — key-value rendering, not renderTable
    // Prefer _fmt-suffixed versions for human-readable numbers
    this.log(`Visits:          ${metrics.visits_fmt ?? metrics.visits ?? ''}`)
    this.log(`Views:           ${metrics.views_fmt ?? metrics.views ?? ''}`)
    this.log(`Engagement:      ${metrics.engagement_fmt ?? metrics.engagement ?? ''}`)
    this.log(`Conversions:     ${metrics.conversions_fmt ?? metrics.conversions ?? ''}`)
    this.log(`New conversions: ${metrics.new_conversions_fmt ?? metrics.new_conversions ?? ''}`)
  }
}
