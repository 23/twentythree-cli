import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, renderTable, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Video subtitle locales command — lists all available subtitle locales.
 */
export default class VideoSubtitleLocales extends AuthenticatedCommand<typeof VideoSubtitleLocales> {
  static description = 'List all available subtitle locales'

  static examples = [
    '<%= config.bin %> video subtitle locales',
    '<%= config.bin %> video subtitle locales --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'GET /photo/subtitle/locales',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['Code', 'Name', 'Auto Transcribe', 'Auto Translate', 'Live'] },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  public async run(): Promise<void | object> {
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/photo/subtitle/locales', {})

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const locales: any[] = (data as any)?.locales ?? (data as any)?.data ?? []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: locales,
        summary: 'Available subtitle locales',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'subtitle-locales' },
        ],
      })
    }

    if (locales.length === 0) {
      this.log('No locales found.')
      return
    }

    const table = renderTable(
      ['Code', 'Name', 'Auto Transcribe', 'Auto Translate', 'Live'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      locales.map((l: any) => [
        String(l.locale ?? l.code ?? ''),
        String(l.label ?? l.name ?? ''),
        l.auto_transcribe_p ? 'yes' : 'no',
        l.auto_translate_p ? 'yes' : 'no',
        l.live_p ? 'yes' : 'no',
      ]),
    )

    this.log(table.toString())
  }
}
