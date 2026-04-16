import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Thumbnail template list command — lists all thumbnail templates in the active workspace.
 *
 * Maps to GET /thumbnail/template/list.
 * Supports optional search and object-type filtering.
 */
export default class ThumbnailList extends AuthenticatedCommand<typeof ThumbnailList> {
  static description = 'List thumbnail templates in the active workspace'

  static examples = [
    '<%= config.bin %> thumbnail list',
    '<%= config.bin %> thumbnail list --search "my template"',
    '<%= config.bin %> thumbnail list --object-type photo',
    '<%= config.bin %> thumbnail list --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    search: Flags.string({
      description: 'Filter by name',
      required: false,
    }),
    'object-type': Flags.string({
      description: 'Filter by object type (photo, live, liveseries)',
      required: false,
    }),
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'GET /thumbnail/template/list',
    auth_scope: 'read' as const,
    output_shape: {
      type: 'table' as const,
      columns: ['ID', 'Name', 'Type', 'Width', 'Height'],
    },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(ThumbnailList)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/thumbnail/template/list', {
      params: {
        query: {
          search: flags.search,
          object_type: flags['object-type'] as 'photo' | 'live' | 'liveseries' | undefined,
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
        summary: `${rows.length} thumbnail template(s)`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'thumbnail' },
        ],
      })
    }

    if (rows.length === 0) {
      this.log('No thumbnail templates found.')
      return
    }

    const headers = ['ID', 'Name', 'Type', 'Width', 'Height']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableRows = rows.map((r: any) => [
      String(r.thumbnail_template_id ?? ''),
      String(r.name ?? ''),
      String(r.object_type ?? ''),
      String(r.width ?? ''),
      String(r.height ?? ''),
    ])

    const table = renderTable(headers, tableRows)
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} thumbnail template(s)`))
  }
}
