import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { fetchAllPages } from '../../lib/pagination.js'
import { renderTable, formatJsonOutput, parseBoolParam, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Video list command — lists all videos in the active workspace with auto-pagination.
 * Renders a cli-table3 table with columns: ID, Title, Duration, Status, Published, Updated.
 * Supports --json output with { ok, data, summary, breadcrumbs } shape (CLI-01).
 */
export default class VideoList extends AuthenticatedCommand<typeof VideoList> {
  static description = 'List videos in the active workspace'

  static examples = [
    '<%= config.bin %> video list',
    '<%= config.bin %> video list --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'GET /photo/list',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['ID', 'Title', 'Duration', 'Status', 'Published', 'Updated'] },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    limit: Flags.integer({
      description: 'Maximum number of videos to return (default: all)',
      required: false,
    }),
    'include-unpublished': Flags.boolean({
      description: 'Include unpublished videos in the results',
      allowNo: true,
      required: false,
    }),
    'include-unpublished-p': Flags.string({ hidden: true, required: false }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(VideoList)
    this.printWorkspaceHeader()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const videos = await fetchAllPages<any>(async (page, size) => {
      const { data, error } = await this.apiClient.GET('/photo/list', {
        params: {
          query: {
            p: page,
            size,
            include_unpublished_p: parseBoolParam(flags['include-unpublished'], flags['include-unpublished-p']) ? '1' : undefined,
          },
        },
      })
      if (error) {
        this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
      }
      // The API returns paginated items under data (typed as single object in schema
      // but actual response contains a list-like structure with total_count at top level).
      // Cast to any to access the real runtime shape.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resp = data as any
      const items: unknown[] = Array.isArray(resp?.data)
        ? resp.data
        : resp?.data
        ? [resp.data]
        : []
      return { data: items, total_count: resp?.total_count }
    })

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: videos,
        summary: `${videos.length} video${videos.length === 1 ? '' : 's'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'video' },
        ],
      })
    }

    if (videos.length === 0) {
      this.log('No videos found.')
      return
    }

    const headers = ['ID', 'Title', 'Duration', 'Status', 'Published', 'Updated']
    const rows = videos.map((v: any) => [
      String(v.photo_id ?? ''),
      applyCliTerms(String(v.title ?? '')),
      String(v.video_length_fmt ?? ''),
      v.video_encoded_p ? 'encoded' : 'processing',
      v.published_p ? 'yes' : 'no',
      String(v.publish_date_ansi ?? v.creation_date_ansi ?? ''),
    ])

    const table = renderTable(headers, rows)
    this.log(table.toString())
    this.log(chalk.dim(`${videos.length} video${videos.length === 1 ? '' : 's'}`))
  }
}
