import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Audience field types command — list valid audience field types (AUD-12).
 *
 * POST form with no required body fields. Returns list of valid type identifiers
 * with human-readable labels — used to discover valid values for audience field set --type.
 *
 * 3-level oclif topic via directory structure (audience/field/types.ts).
 */
export default class AudienceFieldTypes extends AuthenticatedCommand<typeof AudienceFieldTypes> {
  static description = 'List valid audience field types'

  static agentMetadata = {
    api_endpoint: 'POST /audience/field/types',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['Type', 'Label'] },
    side_effects: 'none' as const,
  }

  static examples = [
    '<%= config.bin %> audience field types',
    '<%= config.bin %> audience field types --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags: _flags } = await this.parse(AudienceFieldTypes)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.POST('/audience/field/types', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: {} as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
        summary: `${rows.length} field type(s)`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'audience' },
        ],
      })
    }

    if (rows.length === 0) {
      this.log('No field types found.')
      return
    }

    const headers = ['Type', 'Label']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableRows = rows.map((r: any) => [
      String(r.type ?? ''),
      String(r.label ?? ''),
    ])

    const table = renderTable(headers, tableRows)
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} field type(s)`))
  }
}
