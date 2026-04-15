import { Args } from '@oclif/core'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, renderTable, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar room connect command — gets connection info for a webinar room.
 *
 * NOTE: Uses path /live/webinar/connect NOT /live/room/connect.
 * Cast to any because this path may not be in generated OpenAPI types.
 *
 * Threat mitigations:
 *   T-05-12: applyCliTerms() on all error messages
 */
export default class WebinarRoomConnect extends AuthenticatedCommand<typeof WebinarRoomConnect> {
  static description = 'Get connection info for a webinar room'

  static examples = [
    '<%= config.bin %> webinar room connect 12345',
    '<%= config.bin %> webinar room connect 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(WebinarRoomConnect)
    this.printWorkspaceHeader()

    // NOTE: path is /live/webinar/connect — NOT /live/room/connect
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.apiClient as any).GET('/live/webinar/connect', {
      params: { query: { live_id: Number(args.id) } },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Connection info for webinar ${args.id}`,
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
        ['Connection URL', String(info.connect_url ?? info.url ?? info.room_url ?? '')],
        ['Presenter URL', String(info.presenter_url ?? '')],
        ['Token', String(info.token ?? '')],
        ['Status', String(info.status ?? '')],
      ],
    )

    this.log(table.toString())
  }
}
