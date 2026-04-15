import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { fetchAllPages } from '../../../lib/pagination.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar series list command — lists all webinar series in the active workspace.
 * Uses fetchAllPages for auto-pagination.
 *
 * NOTE: Series list does NOT require a token param (workspace-scoped).
 *
 * Threat mitigations:
 *   T-05-16: applyCliTerms() on all error messages
 */
export default class WebinarSeriesList extends AuthenticatedCommand<typeof WebinarSeriesList> {
  static description = 'List webinar series'

  static examples = [
    '<%= config.bin %> webinar series list',
    '<%= config.bin %> webinar series list --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(WebinarSeriesList)
    void flags
    this.printWorkspaceHeader()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const series = await fetchAllPages<any>(async (page, size) => {
      const { data, error } = await this.apiClient.GET('/live/series/list', {
        params: { query: { p: page, size } },
      })
      if (error) {
        this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resp = data as any
      const items: unknown[] = Array.isArray(resp?.data)
        ? resp.data
        : resp?.data
        ? [resp.data]
        : []
      return { data: items, total_count: resp?.total_count }
    })

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: series,
        summary: `${series.length} series`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'series' },
        ],
      })
    }

    if (series.length === 0) {
      this.log('No series found.')
      return
    }

    const headers = ['ID', 'Name', 'Status', 'Created']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = series.map((s: any) => [
      String(s.live_series_id ?? ''),
      applyCliTerms(String(s.name ?? '')),
      String(s.status ?? ''),
      String(s.creation_date_ansi ?? ''),
    ])

    const table = renderTable(headers, rows)
    this.log(table.toString())
    this.log(chalk.dim(`${series.length} series`))
  }
}
