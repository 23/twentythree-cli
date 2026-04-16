import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Webinar highlights command — lists highlights from a webinar.
 */
export default class WebinarHighlights extends AuthenticatedCommand<typeof WebinarHighlights> {
  static description = 'List highlights from a webinar'

  static examples = [
    '<%= config.bin %> webinar highlights 12345',
    '<%= config.bin %> webinar highlights 12345 --video-id 67890',
    '<%= config.bin %> webinar highlights 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'video-id': Flags.string({
      description: 'Scope to specific recording by video ID',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'GET /live/highlights',
    auth_scope: 'read' as const,
    output_shape: {
      type: 'table' as const,
      columns: ['Type', 'Start', 'End', 'Absolute Start'],
    },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarHighlights)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/live/highlights', {
      params: {
        query: {
          live_id: Number(args.id),
          photo_id: flags['video-id'] ? Number(flags['video-id']) : undefined,
        },
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const highlights: any[] = Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: highlights,
        summary: `${highlights.length} highlight${highlights.length === 1 ? '' : 's'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
        ],
      })
    }

    if (highlights.length === 0) {
      this.log('No highlights found.')
      return
    }

    const headers = ['Type', 'Start', 'End', 'Absolute Start']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = highlights.map((h: any) => [
      String(h.type ?? ''),
      String(h.relative_start_time ?? ''),
      String(h.relative_end_time ?? ''),
      String(h.absolute_start_time ?? ''),
    ])

    const table = renderTable(headers, rows)
    this.log(table.toString())
    this.log(chalk.dim(`${highlights.length} highlight${highlights.length === 1 ? '' : 's'}`))
  }
}
