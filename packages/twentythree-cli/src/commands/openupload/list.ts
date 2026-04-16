import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, parseBoolParam, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Open upload list command — lists open upload tokens in the workspace.
 *
 * Threat mitigations:
 *   T-08-21: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class OpenuploadList extends AuthenticatedCommand<typeof OpenuploadList> {
  static description = 'List open upload tokens in the active workspace'

  static examples = [
    '<%= config.bin %> openupload list',
    '<%= config.bin %> openupload list --token-upload-id 123',
    '<%= config.bin %> openupload list --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'token-upload-id': Flags.string({
      description: 'Filter by open upload token upload ID',
      required: false,
    }),
    token: Flags.string({
      description: 'Filter by open upload token',
      required: false,
    }),
    app: Flags.boolean({
      description: 'Filter by app open uploads',
      allowNo: false,
      required: false,
    }),
    'app-p': Flags.string({ hidden: true, required: false }),
  }

  static agentMetadata = {
    api_endpoint: 'GET /openupload/list',
    auth_scope: 'read' as const,
    output_shape: {
      type: 'table' as const,
      columns: ['ID', 'Name', 'Token', 'Public'],
    },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(OpenuploadList)

    this.printWorkspaceHeader()

    const appVal = parseBoolParam(flags.app, flags['app-p'])

    const { data, error } = await this.apiClient.GET('/openupload/list', {
      params: {
        query: {
          token_upload_id: flags['token-upload-id'] !== undefined ? Number(flags['token-upload-id']) : undefined,
          token: flags.token,
          app_p: appVal,
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
        summary: `${rows.length} open upload(s)`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'openupload' },
        ],
      })
    }

    if (rows.length === 0) {
      this.log('No open uploads found.')
      return
    }

    const table = renderTable(
      ['ID', 'Name', 'Token', 'Public'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rows.map((r: any) => [
        String(r.token_upload_id ?? ''),
        String(r.name ?? ''),
        r.token ? String(r.token).slice(0, 8) + '…' : '',
        String(r.public_p ?? ''),
      ]),
    )
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} open upload(s)`))
  }
}
