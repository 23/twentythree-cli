import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, renderTable, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar speaker library command — lists speakers in the workspace speaker library.
 *
 * Threat mitigations:
 *   T-05-07: applyCliTerms() on all error messages
 */
export default class WebinarSpeakerLibrary extends AuthenticatedCommand<typeof WebinarSpeakerLibrary> {
  static description = 'List speakers in the workspace library'

  static examples = [
    '<%= config.bin %> webinar speaker library',
    '<%= config.bin %> webinar speaker library --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'GET /live/speaker/library/list',
    auth_scope: 'read' as const,
    output_shape: {
      type: 'table' as const,
      columns: ['ID', 'Name', 'Email'],
    },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    await this.parse(WebinarSpeakerLibrary)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/live/speaker/library/list', {
      params: { query: {} },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const speakers: any[] = Array.isArray((data as any)?.data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (data as any).data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : (data as any)?.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? [(data as any).data]
      : []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: speakers,
        summary: `${speakers.length} speaker${speakers.length === 1 ? '' : 's'} in library`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'speaker-library' },
        ],
      })
    }

    if (speakers.length === 0) {
      this.log('No speakers in library.')
      return
    }

    const table = renderTable(
      ['ID', 'Name', 'Email'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      speakers.map((s: any) => [
        String(s.live_speaker_id ?? ''),
        String(s.name ?? ''),
        String(s.email ?? ''),
      ]),
    )

    this.log(table.toString())
  }
}
