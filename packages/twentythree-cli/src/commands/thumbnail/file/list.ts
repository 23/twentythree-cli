import { Args } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Thumbnail file list command — lists files associated with a thumbnail template.
 *
 * Maps to GET /thumbnail/template/list-files.
 * 3-level oclif topic via directory structure (thumbnail/file/list.ts).
 *
 * Threat mitigations:
 *   T-08-09: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class ThumbnailFileList extends AuthenticatedCommand<typeof ThumbnailFileList> {
  static description = 'List files associated with a thumbnail template'

  static examples = [
    '<%= config.bin %> thumbnail file list 42',
    '<%= config.bin %> thumbnail file list 42 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Thumbnail template ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'GET /thumbnail/template/list-files',
    auth_scope: 'read' as const,
    output_shape: {
      type: 'table' as const,
      columns: ['Filename', 'Size', 'URL'],
    },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(ThumbnailFileList)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/thumbnail/template/list-files', {
      params: {
        query: {
          thumbnail_template_id: Number(args.id),
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
        summary: `${rows.length} file(s)`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'thumbnail', id: args.id },
        ],
      })
    }

    if (rows.length === 0) {
      this.log('No files found.')
      return
    }

    const headers = ['Filename', 'Size', 'URL']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableRows = rows.map((r: any) => [
      String(r.filename ?? ''),
      String(r.size_fmt ?? r.size ?? ''),
      String(r.url ?? ''),
    ])

    const table = renderTable(headers, tableRows)
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} file(s)`))
  }
}
