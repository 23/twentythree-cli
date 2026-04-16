import { Flags } from '@oclif/core'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Audience metrics command — aggregate metrics for the audience (AUD-06).
 *
 * Returns a single object (Pitfall 6) — key-value rendering, NOT renderTable.
 * Metrics: profile_count, identified_count, timeline_count, timeline_engagement,
 * event_count, score_avg.
 */
export default class AudienceMetrics extends AuthenticatedCommand<typeof AudienceMetrics> {
  static description = 'Get audience aggregate metrics'

  static agentMetadata = {
    api_endpoint: 'GET /audience/metrics',
    auth_scope: 'read' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'none' as const,
  }

  static examples = [
    '<%= config.bin %> audience metrics',
    '<%= config.bin %> audience metrics --identified --json',
    '<%= config.bin %> audience metrics --search "acme" --size 100',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    page: Flags.integer({
      description: 'Page number',
      required: false,
    }),
    size: Flags.integer({
      description: 'Page size',
      required: false,
    }),
    offset: Flags.integer({
      description: 'Offset for pagination',
      required: false,
    }),
    search: Flags.string({
      description: 'Free-text search filter',
      required: false,
    }),
    identified: Flags.boolean({
      description: 'Filter to identified profiles only',
      required: false,
      allowNo: true,
    }),
    objects: Flags.string({
      description: 'Filter by viewed object IDs (space-separated)',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AudienceMetrics)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/audience/metrics', {
      params: {
        query: {
          p: flags.page,
          size: flags.size,
          offset: flags.offset,
          search: flags.search,
          identified: flags.identified,
          objects: flags.objects,
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
        summary: 'Audience metrics',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'audience' },
        ],
      })
    }

    if (!metrics || Object.keys(metrics).length === 0) {
      this.log('No metrics data found.')
      return
    }

    // Single-object response (Pitfall 6) — key-value rendering, not renderTable
    this.log(`Profile count:       ${metrics.profile_count ?? ''}`)
    this.log(`Identified count:    ${metrics.identified_count ?? ''}`)
    this.log(`Timeline count:      ${metrics.timeline_count ?? ''}`)
    this.log(`Timeline engagement: ${metrics.timeline_engagement ?? ''}`)
    this.log(`Event count:         ${metrics.event_count ?? ''}`)
    this.log(`Score average:       ${metrics.score_avg ?? ''}`)
  }
}
