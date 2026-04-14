import { Args } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Webinar metrics command — retrieves aggregate metrics for a webinar.
 *
 * CRITICAL: API response uses `formated` (one t) not `formatted` for the display value.
 * Falls back to `value` if `formated` is absent.
 */
export default class WebinarMetrics extends AuthenticatedCommand<typeof WebinarMetrics> {
  static description = 'Retrieve metrics for a webinar'

  static examples = [
    '<%= config.bin %> webinar metrics 12345',
    '<%= config.bin %> webinar metrics 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(WebinarMetrics)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/live/metrics', {
      params: { query: { live_id: Number(args.id) } },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metrics: any[] = Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: metrics,
        summary: `${metrics.length} metric${metrics.length === 1 ? '' : 's'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
        ],
      })
    }

    if (metrics.length === 0) {
      this.log('No metrics available.')
      return
    }

    const headers = ['Metric', 'Value']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = metrics.map((m: any) => [
      applyCliTerms(String(m.metric ?? '')),
      String(m.formated ?? m.value ?? ''),  // CRITICAL: 'formated' not 'formatted' (API typo)
    ])

    const table = renderTable(headers, rows)
    this.log(table.toString())
    this.log(chalk.dim(`${metrics.length} metric${metrics.length === 1 ? '' : 's'}`))
  }
}
