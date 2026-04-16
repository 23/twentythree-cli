import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, renderTable, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar room themes command — lists available room themes.
 *
 * Workspace-scoped command — no webinar ID arg needed.
 * NOTE: Uses path /live/webinar/room-themes NOT /live/room/themes.
 * Cast to any because this path may not be in generated OpenAPI types.
 *
 * Threat mitigations:
 *   T-05-12: applyCliTerms() on all error messages
 */
export default class WebinarRoomThemes extends AuthenticatedCommand<typeof WebinarRoomThemes> {
  static description = 'List available room themes'

  static examples = [
    '<%= config.bin %> webinar room themes',
    '<%= config.bin %> webinar room themes --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'GET /live/webinar/room-themes',
    auth_scope: 'read' as const,
    output_shape: {
      type: 'table' as const,
      columns: ['ID', 'Name', 'Description'],
    },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    await this.parse(WebinarRoomThemes)
    this.printWorkspaceHeader()

    // NOTE: path is /live/webinar/room-themes — NOT /live/room/themes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.apiClient as any).GET('/live/webinar/room-themes', {
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
        summary: `${items.length} theme${items.length === 1 ? '' : 's'} available`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'room-theme' },
        ],
      })
    }

    if (items.length === 0) {
      this.log('No room themes found.')
      return
    }

    const table = renderTable(
      ['ID', 'Name', 'Description'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items.map((t: any) => [
        String(t.theme_id ?? t.id ?? ''),
        String(t.name ?? t.title ?? ''),
        String(t.description ?? ''),
      ]),
    )

    this.log(table.toString())
  }
}
