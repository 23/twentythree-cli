import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, renderTable, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Video subtitle types command — lists all available subtitle types.
 */
export default class VideoSubtitleTypes extends AuthenticatedCommand<typeof VideoSubtitleTypes> {
  static description = 'List all available subtitle types'

  static examples = [
    '<%= config.bin %> video subtitle types',
    '<%= config.bin %> video subtitle types --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'GET /photo/subtitle/types',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['Type', 'Label'] },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  public async run(): Promise<void | object> {
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/photo/subtitle/types', {})

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const types: any[] = (data as any)?.types ?? (data as any)?.data ?? []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: types,
        summary: 'Available subtitle types',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'subtitle-types' },
        ],
      })
    }

    if (types.length === 0) {
      this.log('No subtitle types found.')
      return
    }

    const table = renderTable(
      ['Type', 'Label'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      types.map((t: any) => [
        String(t.type ?? t.value ?? ''),
        String(t.label ?? t.name ?? ''),
      ]),
    )

    this.log(table.toString())
  }
}
