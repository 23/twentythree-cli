import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Webinar list-formats command — lists available webinar formats.
 * This is a workspace-level query — no webinar ID required.
 */
export default class WebinarListFormats extends AuthenticatedCommand<typeof WebinarListFormats> {
  static description = 'List available webinar formats'

  static examples = [
    '<%= config.bin %> webinar list-formats',
    '<%= config.bin %> webinar list-formats --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { } = await this.parse(WebinarListFormats)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/live/list-formats', {
      params: { query: {} },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formats: any[] = Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: formats,
        summary: `${formats.length} format${formats.length === 1 ? '' : 's'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar' },
        ],
      })
    }

    if (formats.length === 0) {
      this.log('No formats available.')
      return
    }

    const headers = ['Key', 'Name']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = formats.map((f: any) => [
      String(f.key ?? ''),
      String(f.name ?? ''),
    ])

    const table = renderTable(headers, rows)
    this.log(table.toString())
    this.log(chalk.dim(`${formats.length} format${formats.length === 1 ? '' : 's'}`))
  }
}
