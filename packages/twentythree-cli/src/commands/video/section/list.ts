import { Args } from '@oclif/core'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, renderTable, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Video section list command — lists all sections (chapters) for a video.
 */
export default class VideoSectionList extends AuthenticatedCommand<typeof VideoSectionList> {
  static description = 'List all sections for a video'

  static examples = [
    '<%= config.bin %> video section list 12345',
    '<%= config.bin %> video section list 12345 --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'GET /photo/section/list',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['ID', 'Title', 'Start Time', 'Description'] },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Video ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(VideoSectionList)

    this.printWorkspaceHeader()

    const token = await this.fetchVideoToken(args.id)

    const { data, error } = await this.apiClient.GET('/photo/section/list', {
      params: { query: { photo_id: Number(args.id), token } },
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
        summary: `Sections for video ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'video', id: args.id },
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
      sections.map((s: any) => [
        String(s.section_id ?? s.id ?? ''),
        String(s.title ?? ''),
        s.start_time !== undefined ? `${s.start_time}s` : '',
        String(s.description ?? ''),
      ]),
    )

    this.log(table.toString())
  }
}
