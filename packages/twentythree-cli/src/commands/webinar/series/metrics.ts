import { Args } from '@oclif/core'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar series metrics command — retrieves metrics for a webinar series.
 *
 * Threat mitigations:
 *   T-05-16: applyCliTerms() on all error messages
 */
export default class WebinarSeriesMetrics extends AuthenticatedCommand<typeof WebinarSeriesMetrics> {
  static description = 'Get metrics for a webinar series'

  static examples = [
    '<%= config.bin %> webinar series metrics 42',
    '<%= config.bin %> webinar series metrics 42 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Series ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'GET /live/series/metrics',
    auth_scope: 'read' as const,
    output_shape: {
      type: 'table' as const,
      columns: ['Metric', 'Value'],
    },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(WebinarSeriesMetrics)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/live/series/metrics', {
      params: { query: { live_series_id: Number(args.id) } as any },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Metrics for series ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'series', id: args.id },
        ],
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metrics = data as any
    const metricsObj = metrics?.data ?? metrics ?? {}

    const rows = Object.entries(metricsObj).map(([key, value]) => [
      key,
      String(value ?? ''),
    ])

    if (rows.length === 0) {
      this.log('No metrics available.')
      return
    }

    const table = renderTable(['Metric', 'Value'], rows)
    this.log(table.toString())
  }
}
