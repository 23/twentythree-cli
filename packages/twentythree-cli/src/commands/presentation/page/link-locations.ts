import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Presentation page link-locations command — lists available link locations (PRS-03).
 *
 * Uses GET /presentation/page/link-locations — returns a list of link location options.
 * Pattern A: standard GET list with table output.
 *
 * 3-level oclif topic via directory structure (presentation/page/link-locations.ts).
 *
 * Threat mitigations:
 *   T-08-16: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class PresentationPageLinkLocations extends AuthenticatedCommand<typeof PresentationPageLinkLocations> {
  static description = 'List available presentation page link locations'

  static examples = [
    '<%= config.bin %> presentation page link-locations',
    '<%= config.bin %> presentation page link-locations --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'GET /presentation/page/link-locations',
    auth_scope: 'read' as const,
    output_shape: {
      type: 'table' as const,
      columns: ['Link Location', 'Label'],
    },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const {} = await this.parse(PresentationPageLinkLocations)

    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/presentation/page/link-locations', {})

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
        summary: `${rows.length} link location(s)`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'presentation' },
        ],
      })
    }

    if (rows.length === 0) {
      this.log('No link locations found.')
      return
    }

    const headers = ['Link Location', 'Label']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableRows = rows.map((r: any) => [
      String(r.link_location ?? ''),
      applyCliTerms(String(r.label ?? '')),
    ])

    const table = renderTable(headers, tableRows)
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} link location(s)`))
  }
}
