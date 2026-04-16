import { Args, Flags } from '@oclif/core'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, renderTable, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar transcription locales command — lists available transcription locales for a webinar.
 *
 * Uses token auto-lookup (Decision D-4): accepts optional --token flag,
 * auto-looks up via fetchWebinarToken if not provided.
 *
 * Threat mitigations:
 *   T-05-12: applyCliTerms() on all error messages
 */
export default class WebinarTranscriptionLocales extends AuthenticatedCommand<typeof WebinarTranscriptionLocales> {
  static description = 'List available transcription locales for a webinar'

  static examples = [
    '<%= config.bin %> webinar transcription locales 12345',
    '<%= config.bin %> webinar transcription locales 12345 --json',
    '<%= config.bin %> webinar transcription locales 12345 --token mytoken',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    token: Flags.string({
      description: 'Webinar token (auto-looked up if not provided)',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'GET /live/transcription/locales',
    auth_scope: 'read' as const,
    output_shape: {
      type: 'table' as const,
      columns: ['Locale', 'Name'],
    },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarTranscriptionLocales)
    this.printWorkspaceHeader()

    // Token auto-lookup (Decision D-4): use provided token or fetch automatically
    const token = flags.token ?? await this.fetchWebinarToken(args.id)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.apiClient as any).GET('/live/transcription/locales', {
      params: { query: { live_id: Number(args.id), token } },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: any[] = Array.isArray((data as any)?.data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (data as any).data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : (data as any)?.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? [(data as any).data]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : Array.isArray(data) ? data as any[] : []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: items,
        summary: `${items.length} locale${items.length === 1 ? '' : 's'} available`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
          { resource: 'transcription' },
        ],
      })
    }

    if (items.length === 0) {
      this.log('No transcription locales found.')
      return
    }

    const table = renderTable(
      ['Locale', 'Name'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items.map((l: any) => [
        String(l.locale ?? l.code ?? l.id ?? ''),
        String(l.name ?? l.label ?? ''),
      ]),
    )

    this.log(table.toString())
  }
}
