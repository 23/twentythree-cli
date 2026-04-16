import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Audience identity-sources command — list audience identity sources (AUD-10).
 *
 * Non-paginated list of identity sources configured in the workspace.
 * No pagination flags per spec.
 */
export default class AudienceIdentitySources extends AuthenticatedCommand<typeof AudienceIdentitySources> {
  static description = 'List audience identity sources'

  static examples = [
    '<%= config.bin %> audience identity-sources',
    '<%= config.bin %> audience identity-sources --json',
  ]

  static enableJsonFlag = true

  // No pagination flags — /audience/identity-sources has no p/size/offset per spec
  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags: _flags } = await this.parse(AudienceIdentitySources)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/audience/identity-sources', {
      params: { query: {} },
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
        summary: `${rows.length} identity source(s)`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'audience' },
        ],
      })
    }

    if (rows.length === 0) {
      this.log('No identity sources found.')
      return
    }

    const headers = ['Source', 'Title', 'Service']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableRows = rows.map((r: any) => [
      String(r.identity_source ?? ''),
      String(r.title ?? ''),
      String(r.service ?? ''),
    ])

    const table = renderTable(headers, tableRows)
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} identity source(s)`))
  }
}
