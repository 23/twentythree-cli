import { Args, Flags } from '@oclif/core'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, renderTable, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar section list command — lists all agenda sections for a webinar.
 *
 * Token is auto-looked up via fetchWebinarToken if not supplied via --token.
 *
 * Threat mitigations:
 *   T-05-03: applyCliTerms() on all error messages — no 'live'/'photo'/'album' leaks
 */
export default class WebinarSectionList extends AuthenticatedCommand<typeof WebinarSectionList> {
  static description = 'List agenda sections for a webinar'

  static examples = [
    '<%= config.bin %> webinar section list 12345',
    '<%= config.bin %> webinar section list 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    token: Flags.string({
      description: 'Webinar token (auto-looked up if omitted)',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'GET /live/section/list',
    auth_scope: 'read' as const,
    output_shape: {
      type: 'table' as const,
      columns: ['ID', 'Title', 'Start Time', 'Description'],
    },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarSectionList)
    this.printWorkspaceHeader()

    const token = flags.token ?? await this.fetchWebinarToken(Number(args.id))

    const { data, error } = await this.apiClient.GET('/live/section/list', {
      params: {
        query: {
          live_id: Number(args.id),
          token,
        },
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sections: any[] = (data as any)?.sections ?? (data as any)?.data ?? []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: sections,
        summary: `${sections.length} section${sections.length === 1 ? '' : 's'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
          { resource: 'section' },
        ],
      })
    }

    if (sections.length === 0) {
      this.log('No sections found.')
      return
    }

    const table = renderTable(
      ['ID', 'Title', 'Start Time', 'Description'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sections.map((s: any) => [
        String(s.live_section_id ?? s.id ?? ''),
        String(s.title ?? ''),
        s.start_time !== undefined ? `${s.start_time}s` : '',
        String(s.description ?? ''),
      ]),
    )

    this.log(table.toString())
  }
}
