import { Args, Flags } from '@oclif/core'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, renderTable, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar speaker list command — lists all speakers for a webinar.
 *
 * Token is auto-looked up via fetchWebinarToken if not supplied via --token (Decision D-4).
 *
 * Threat mitigations:
 *   T-05-07: applyCliTerms() on all error messages — no 'live'/'photo'/'album' leaks
 */
export default class WebinarSpeakerList extends AuthenticatedCommand<typeof WebinarSpeakerList> {
  static description = 'List speakers for a webinar'

  static examples = [
    '<%= config.bin %> webinar speaker list 12345',
    '<%= config.bin %> webinar speaker list 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    token: Flags.string({
      description: 'Webinar token (auto-looked up if omitted)',
      required: false,
    }),
    'speaker-id': Flags.integer({
      description: 'Filter to a single speaker by their speaker record ID',
      required: false,
    }),
    'request-status': Flags.string({
      description: 'Filter by the speaker\'s request status',
      options: ['requested', 'approved', 'denied', 'expired'],
      required: false,
    }),
    'creation-source': Flags.string({
      description: 'Filter by the source of the speaker record',
      options: ['admin', 'guest'],
      required: false,
    }),
    'exclude-hidden': Flags.boolean({
      description: 'Exclude speakers marked as hidden',
      required: false,
    }),
    'include-unapproved': Flags.boolean({
      description: 'Include speakers with a non-approved request status',
      required: false,
    }),
    'include-hidden-guests': Flags.boolean({
      description: 'Include guest speakers even if they are marked as hidden',
      required: false,
    }),
    fields: Flags.string({
      description: 'Comma-separated list of fields to return in the API response',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'GET /live/speaker/list',
    auth_scope: 'read' as const,
    output_shape: {
      type: 'table' as const,
      columns: ['ID', 'Name', 'Email', 'Role', 'Order'],
    },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarSpeakerList)
    this.printWorkspaceHeader()

    const webinarId = Number(args.id)
    const token = flags.token ?? await this.fetchWebinarToken(webinarId)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { live_id: webinarId, token }
    if (flags['speaker-id'] !== undefined) query.live_speaker_id = flags['speaker-id']
    if (flags['request-status'] !== undefined) query.request_status = flags['request-status']
    if (flags['creation-source'] !== undefined) query.creation_source = flags['creation-source']
    if (flags['exclude-hidden']) query.exclude_hidden_p = true
    if (flags['include-unapproved']) query.include_unapproved_p = true
    if (flags['include-hidden-guests']) query.include_hidden_guest_speakers_p = true
    if (flags.fields !== undefined) query.fields = flags.fields

    const { data, error } = await this.apiClient.GET('/live/speaker/list', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params: { query: query as any },
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
        summary: `${speakers.length} speaker${speakers.length === 1 ? '' : 's'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
          { resource: 'speaker' },
        ],
      })
    }

    if (speakers.length === 0) {
      this.log('No speakers found.')
      return
    }

    const table = renderTable(
      ['ID', 'Name', 'Email', 'Role', 'Order'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      speakers.map((s: any) => [
        String(s.live_speaker_id ?? ''),
        String(s.name ?? ''),
        String(s.email ?? ''),
        String(s.role ?? ''),
        String(s.speaker_order ?? ''),
      ]),
    )

    this.log(table.toString())
  }
}
