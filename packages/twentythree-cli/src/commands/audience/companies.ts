import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Audience companies command — list audience companies (AUD-09).
 *
 * Paginated list of companies associated with audience members.
 */
export default class AudienceCompanies extends AuthenticatedCommand<typeof AudienceCompanies> {
  static description = 'List audience companies'

  static agentMetadata = {
    api_endpoint: 'GET /audience/companies',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['UUID', 'Name', 'Domain', 'Score', 'Profiles', 'Timelines'] },
    side_effects: 'none' as const,
  }

  static examples = [
    '<%= config.bin %> audience companies',
    '<%= config.bin %> audience companies --identified --size 50',
    '<%= config.bin %> audience companies --domains "acme.com" --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    page: Flags.integer({
      description: 'Page number',
      required: false,
    }),
    size: Flags.integer({
      description: 'Page size',
      required: false,
    }),
    offset: Flags.integer({
      description: 'Offset for pagination',
      required: false,
    }),
    orderby: Flags.string({
      description: 'Order by field',
      required: false,
    }),
    order: Flags.string({
      description: 'Sort direction (asc/desc)',
      required: false,
    }),
    identified: Flags.boolean({
      description: 'Filter to identified companies only',
      required: false,
      allowNo: true,
    }),
    domains: Flags.string({
      description: 'Filter by company domains (space-separated)',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AudienceCompanies)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/audience/companies', {
      params: {
        query: {
          p: flags.page,
          size: flags.size,
          offset: flags.offset,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          orderby: flags.orderby as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          order: flags.order as any,
          identified: flags.identified,
          domains: flags.domains,
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
        summary: `${rows.length} compan${rows.length === 1 ? 'y' : 'ies'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'audience' },
        ],
      })
    }

    if (rows.length === 0) {
      this.log('No companies found.')
      return
    }

    const headers = ['UUID', 'Name', 'Domain', 'Score', 'Profiles', 'Timelines']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableRows = rows.map((r: any) => [
      String(r.uuid ?? ''),
      String(r.name ?? ''),
      String(r.domain ?? ''),
      String(r.score ?? ''),
      String(r.profile_count ?? ''),
      String(r.timeline_count ?? ''),
    ])

    const table = renderTable(headers, tableRows)
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} compan${rows.length === 1 ? 'y' : 'ies'}`))
  }
}
