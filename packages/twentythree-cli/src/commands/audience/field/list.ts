import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Audience field list command — list custom audience fields (AUD-12).
 *
 * CRITICAL: This is a GET endpoint (Pitfall 4). D-5 documentation note claiming POST
 * is an error — the OpenAPI spec confirms GET for /audience/field/list.
 *
 * 3-level oclif topic via directory structure (audience/field/list.ts).
 */
export default class AudienceFieldList extends AuthenticatedCommand<typeof AudienceFieldList> {
  static description = 'List custom audience fields'

  static examples = [
    '<%= config.bin %> audience field list',
    '<%= config.bin %> audience field list --include-widget-html',
    '<%= config.bin %> audience field list --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'include-widget-html': Flags.boolean({
      description: 'Include HTML widget for each field',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AudienceFieldList)
    this.printWorkspaceHeader()

    // CRITICAL: GET endpoint (Pitfall 4) — D-5 note about POST is a documentation error
    const { data, error } = await this.apiClient.GET('/audience/field/list', {
      params: {
        query: {
          include_widget_html_p: flags['include-widget-html'] || undefined,
        },
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: rows,
        summary: `${rows.length} field(s)`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'audience' },
        ],
      })
    }

    if (rows.length === 0) {
      this.log('No custom fields found.')
      return
    }

    const headers = ['Key', 'Label', 'Type', 'Priority', 'Options']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableRows = rows.map((r: any) => [
      String(r.key ?? ''),
      String(r.label ?? ''),
      String(r.type ?? ''),
      String(r.priority ?? ''),
      String(r.options ?? ''),
    ])

    const table = renderTable(headers, tableRows)
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} field(s)`))
  }
}
