import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Audience timelines command — list audience member view timelines (AUD-08).
 *
 * Paginated list of timeline entries (sessions/views per member per object).
 */
export default class AudienceTimelines extends AuthenticatedCommand<typeof AudienceTimelines> {
  static description = 'Get audience member timelines'

  static examples = [
    '<%= config.bin %> audience timelines',
    '<%= config.bin %> audience timelines --uuid "abc-123" --size 20',
    '<%= config.bin %> audience timelines --objects "456 789" --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    page: Flags.integer({
      description: 'Page number',
      required: false,
    }),
    size: Flags.integer({
      description: 'Page size',
      required: false,
    }),
    offset: Flags.integer({
      description: 'Offset for pagination',
      required: false,
    }),
    uuid: Flags.string({
      description: 'Filter by audience member UUID',
      required: false,
    }),
    objects: Flags.string({
      description: 'Filter by object IDs (space-separated)',
      required: false,
    }),
    orderby: Flags.string({
      description: 'Order by field',
      required: false,
    }),
    order: Flags.string({
      description: 'Sort direction (asc/desc)',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AudienceTimelines)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/audience/timelines', {
      params: {
        query: {
          p: flags.page,
          size: flags.size,
          offset: flags.offset,
          uuid: flags.uuid,
          objects: flags.objects,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          orderby: flags.orderby as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          order: flags.order as any,
        },
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: rows,
        summary: `${rows.length} timeline(s)`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'audience' },
        ],
      })
    }

    if (rows.length === 0) {
      this.log('No timelines found.')
      return
    }

    const headers = ['UUID', 'Object ID', 'Type', 'Engagement', 'Sessions', 'Source']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableRows = rows.map((r: any) => [
      String(r.uuid ?? ''),
      String(r.object_id ?? ''),
      String(r.object_type ?? ''),
      String(r.engagement ?? ''),
      String(r.sessions ?? ''),
      String(r.source ?? ''),
    ])

    const table = renderTable(headers, tableRows)
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} timeline(s)`))
  }
}
