import { Args } from '@oclif/core'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, renderTable, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar room info command — gets room information for a webinar.
 *
 * NOTE: Room endpoints use path /live/webinar/info NOT /live/room/info.
 * Cast to any because /live/webinar/info may not be in generated OpenAPI types.
 *
 * Threat mitigations:
 *   T-05-12: applyCliTerms() on all error messages
 */
export default class WebinarRoomInfo extends AuthenticatedCommand<typeof WebinarRoomInfo> {
  static description = 'Get room information for a webinar'

  static examples = [
    '<%= config.bin %> webinar room info 12345',
    '<%= config.bin %> webinar room info 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'GET /live/webinar/info',
    auth_scope: 'read' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(WebinarRoomInfo)
    this.printWorkspaceHeader()

    // NOTE: path is /live/webinar/info — NOT /live/room/info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.apiClient as any).GET('/live/webinar/info', {
      params: { query: { live_id: Number(args.id) } },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Room info for webinar ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
          { resource: 'room' },
        ],
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const info = (data as any)?.data ?? data ?? {}

    const table = renderTable(
      ['Field', 'Value'],
      [
        ['Room URL', String(info.room_url ?? info.url ?? '')],
        ['Status', String(info.status ?? info.live_status ?? '')],
        ['Title', String(info.name ?? info.title ?? '')],
        ['Created', String(info.created_at ?? info.creation_date_text ?? '')],
      ],
    )

    this.log(table.toString())
  }
}
