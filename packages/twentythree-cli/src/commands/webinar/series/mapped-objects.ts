import { Args } from '@oclif/core'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar series mapped-objects command — lists objects mapped to a series.
 *
 * Threat mitigations:
 *   T-05-16: applyCliTerms() on all error messages
 */
export default class WebinarSeriesMappedObjects extends AuthenticatedCommand<typeof WebinarSeriesMappedObjects> {
  static description = 'List mapped objects for a webinar series'

  static examples = [
    '<%= config.bin %> webinar series mapped-objects 42',
    '<%= config.bin %> webinar series mapped-objects 42 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Series ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(WebinarSeriesMappedObjects)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/live/series/mapped-objects', {
      params: { query: { live_series_id: Number(args.id) } as any },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Mapped objects for series ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'series', id: args.id },
        ],
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    const objects: unknown[] = Array.isArray(resp?.data)
      ? resp.data
      : resp?.data
      ? [resp.data]
      : []

    if (objects.length === 0) {
      this.log('No mapped objects found.')
      return
    }

    const headers = ['ID', 'Type', 'Title']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = objects.map((o: any) => [
      String(o.object_id ?? o.id ?? o.live_id ?? ''),
      String(o.object_type ?? o.type ?? ''),
      applyCliTerms(String(o.title ?? o.name ?? '')),
    ])

    const table = renderTable(headers, rows)
    this.log(table.toString())
    this.log(`${objects.length} object${objects.length === 1 ? '' : 's'}`)
  }
}
