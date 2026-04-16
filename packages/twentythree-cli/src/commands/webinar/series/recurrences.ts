import { Args } from '@oclif/core'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar series recurrences command — lists recurrences for a webinar series.
 *
 * Threat mitigations:
 *   T-05-16: applyCliTerms() on all error messages
 */
export default class WebinarSeriesRecurrences extends AuthenticatedCommand<typeof WebinarSeriesRecurrences> {
  static description = 'List recurrences for a webinar series'

  static examples = [
    '<%= config.bin %> webinar series recurrences 42',
    '<%= config.bin %> webinar series recurrences 42 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Series ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'GET /live/series/recurrences',
    auth_scope: 'read' as const,
    output_shape: {
      type: 'table' as const,
      columns: ['ID', 'Start Time', 'Status', 'Skipped'],
    },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(WebinarSeriesRecurrences)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/live/series/recurrences', {
      params: { query: { live_series_id: Number(args.id) } as any },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Recurrences for series ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'series', id: args.id },
        ],
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    const recurrences: unknown[] = Array.isArray(resp?.data)
      ? resp.data
      : resp?.data
      ? [resp.data]
      : []

    if (recurrences.length === 0) {
      this.log('No recurrences found.')
      return
    }

    const headers = ['ID', 'Start Time', 'Status', 'Skipped']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = recurrences.map((r: any) => [
      String(r.recurrence_id ?? r.id ?? ''),
      String(r.start_time ?? r.scheduled_at ?? ''),
      String(r.status ?? ''),
      r.skipped_p ? 'yes' : 'no',
    ])

    const table = renderTable(headers, rows)
    this.log(table.toString())
    this.log(`${recurrences.length} recurrence${recurrences.length === 1 ? '' : 's'}`)
  }
}
