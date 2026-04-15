import { Args } from '@oclif/core'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, renderTable, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar speaker connection-types command — lists available speaker connection types.
 *
 * Requires live_id (webinar ID) per API schema.
 *
 * Threat mitigations:
 *   T-05-07: applyCliTerms() on all error messages
 */
export default class WebinarSpeakerConnectionTypes extends AuthenticatedCommand<typeof WebinarSpeakerConnectionTypes> {
  static description = 'List available speaker connection types'

  static examples = [
    '<%= config.bin %> webinar speaker connection-types 12345',
    '<%= config.bin %> webinar speaker connection-types 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(WebinarSpeakerConnectionTypes)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/live/speaker/connection-types', {
      params: { query: { live_id: Number(args.id) } },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const types: any[] = Array.isArray((data as any)?.data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (data as any).data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : Array.isArray(data)
      ? (data as any)
      : []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: types,
        summary: `${types.length} connection type${types.length === 1 ? '' : 's'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'speaker-connection-types' },
        ],
      })
    }

    if (types.length === 0) {
      this.log('No connection types found.')
      return
    }

    const table = renderTable(
      ['Type', 'Label', 'Description'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      types.map((t: any) => [
        String(t.type ?? t.id ?? ''),
        String(t.label ?? t.name ?? ''),
        String(t.description ?? ''),
      ]),
    )

    this.log(table.toString())
  }
}
