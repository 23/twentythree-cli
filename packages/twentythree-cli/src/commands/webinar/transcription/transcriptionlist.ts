import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, renderTable, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar transcription transcriptionlist command — lists all transcriptions in the workspace.
 *
 * CRITICAL (Pitfall 4): This command calls /live/transcriptionlist (workspace-scoped),
 * NOT /live/transcription/list (webinar-scoped). These are distinct endpoints.
 *
 * This is a workspace-scoped command — no webinar ID arg needed.
 *
 * Threat mitigations:
 *   T-05-12: applyCliTerms() on all error messages
 */
export default class WebinarTranscriptionTranscriptionlist extends AuthenticatedCommand<typeof WebinarTranscriptionTranscriptionlist> {
  static description = 'List all transcriptions in the workspace'

  static examples = [
    '<%= config.bin %> webinar transcription transcriptionlist',
    '<%= config.bin %> webinar transcription transcriptionlist --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'GET /live/transcriptionlist',
    auth_scope: 'read' as const,
    output_shape: {
      type: 'table' as const,
      columns: ['ID', 'Webinar ID', 'Language', 'Status'],
    },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    await this.parse(WebinarTranscriptionTranscriptionlist)
    this.printWorkspaceHeader()

    // CRITICAL: endpoint path is /live/transcriptionlist — NOT /live/transcription/list
    // Cast to any because this path may not be in the generated OpenAPI types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.apiClient as any).GET('/live/transcriptionlist', {
      params: { query: {} },
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
        summary: `${items.length} transcription${items.length === 1 ? '' : 's'} in workspace`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'transcription' },
        ],
      })
    }

    if (items.length === 0) {
      this.log('No transcriptions found.')
      return
    }

    const table = renderTable(
      ['ID', 'Webinar ID', 'Language', 'Status'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items.map((t: any) => [
        String(t.transcription_id ?? t.id ?? ''),
        String(t.live_id ?? ''),
        String(t.language ?? t.locale ?? ''),
        String(t.status ?? ''),
      ]),
    )

    this.log(table.toString())
  }
}
