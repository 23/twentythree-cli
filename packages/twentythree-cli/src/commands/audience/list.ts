import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Audience list command — lists audience members in the active workspace (AUD-01).
 *
 * Exposes pagination directly (D-4: no fetchAllPages for audience list).
 * Renders a cli-table3 table with: UUID, Name, Email, Company, Score, Timelines.
 */
export default class AudienceList extends AuthenticatedCommand<typeof AudienceList> {
  static description = 'List audience members'

  static agentMetadata = {
    api_endpoint: 'GET /audience/list',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['UUID', 'Name', 'Email', 'Company', 'Score', 'Timelines'] },
    side_effects: 'none' as const,
  }

  static examples = [
    '<%= config.bin %> audience list',
    '<%= config.bin %> audience list --page 2 --size 50',
    '<%= config.bin %> audience list --search "john" --identified --json',
    '<%= config.bin %> audience list --company "Acme" --orderby score --order desc --json',
    '<%= config.bin %> audience list --objects "12345 67890" --include-timelines --json',
    '<%= config.bin %> audience list --score-interval "50:100" --activity-interval "30d" --json',
    '<%= config.bin %> audience list --export-format csv > audience.csv',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    page: Flags.integer({
      description: 'Page number',
      required: false,
    }),
    size: Flags.integer({
      description: 'Page size (max 500)',
      required: false,
    }),
    offset: Flags.integer({
      description: 'Offset for pagination',
      required: false,
    }),
    orderby: Flags.string({
      description: 'Order by field',
      options: ['profile_count', 'recent', 'timeline_count', 'score', 'first'],
      required: false,
    }),
    order: Flags.string({
      description: 'Sort direction',
      options: ['asc', 'desc'],
      required: false,
    }),
    search: Flags.string({
      description: 'Free-text search across names and emails',
      required: false,
    }),
    identified: Flags.boolean({
      description: 'Filter to identified profiles only',
      required: false,
      allowNo: true,
    }),
    company: Flags.string({
      description: 'Filter by company name',
      required: false,
    }),
    objects: Flags.string({
      description: 'Filter by viewed object IDs (space-separated)',
      required: false,
    }),
    'attended-objects': Flags.string({
      description: 'Filter to profiles that attended specific object IDs (space-separated)',
      required: false,
    }),
    'identity-sources': Flags.string({
      description: 'Filter by the source of profile information (e.g. corepeople:<collection>)',
      required: false,
    }),
    score: Flags.string({
      description: 'Filter by exact engagement score',
      required: false,
    }),
    'score-interval': Flags.string({
      description: 'Filter by a range of engagement scores (e.g. "50:100")',
      required: false,
    }),
    'activity-interval': Flags.string({
      description: 'Filter to profiles with activity within this date interval (e.g. "30d")',
      required: false,
    }),
    first: Flags.string({
      description: 'Filter to profiles first seen after this date',
      required: false,
    }),
    recent: Flags.string({
      description: 'Filter to profiles with recent activity after this date',
      required: false,
    }),
    'event-type': Flags.string({
      description: 'Filter by conversion event type',
      required: false,
    }),
    'include-timelines': Flags.boolean({
      description: 'Include viewing timelines in the result',
      required: false,
    }),
    'include-events': Flags.boolean({
      description: 'Include conversion events in the result',
      required: false,
    }),
    'include-total-count': Flags.boolean({
      description: 'Include the total matching profile count in the response',
      required: false,
    }),
    'export-format': Flags.string({
      description: 'Export results as a file instead of JSON',
      options: ['csv', 'xlsx'],
      required: false,
    }),
    fields: Flags.string({
      description: 'Comma-separated list of fields to return in the API response',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AudienceList)
    this.printWorkspaceHeader()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {}
    if (flags.page !== undefined) query.p = flags.page
    if (flags.size !== undefined) query.size = flags.size
    if (flags.offset !== undefined) query.offset = flags.offset
    if (flags.orderby !== undefined) query.orderby = flags.orderby
    if (flags.order !== undefined) query.order = flags.order
    if (flags.search !== undefined) query.search = flags.search
    if (flags.identified !== undefined) query.identified = flags.identified
    if (flags.company !== undefined) query.company = flags.company
    if (flags.objects !== undefined) query.objects = flags.objects
    if (flags['attended-objects'] !== undefined) query.attended_objects = flags['attended-objects']
    if (flags['identity-sources'] !== undefined) query.identity_sources = flags['identity-sources']
    if (flags.score !== undefined) query.score = flags.score
    if (flags['score-interval'] !== undefined) query.score_interval = flags['score-interval']
    if (flags['activity-interval'] !== undefined) query.activity_interval = flags['activity-interval']
    if (flags.first !== undefined) query.first = flags.first
    if (flags.recent !== undefined) query.recent = flags.recent
    if (flags['event-type'] !== undefined) query.event_type = flags['event-type']
    if (flags['include-timelines']) query.include_timelines_p = true
    if (flags['include-events']) query.include_events_p = true
    if (flags['include-total-count']) query.include_total_count_p = true
    if (flags['export-format'] !== undefined) query.export_format = flags['export-format']
    if (flags.fields !== undefined) query.fields = flags.fields

    const { data, error } = await this.apiClient.GET('/audience/list', {
      params: { query },
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
        summary: `${rows.length} member(s)`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'audience' },
        ],
      })
    }

    if (rows.length === 0) {
      this.log('No audience members found.')
      return
    }

    const headers = ['UUID', 'Name', 'Email', 'Company', 'Score', 'Timelines']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableRows = rows.map((r: any) => [
      String(r.uuid ?? ''),
      String(r.name ?? ''),
      String(r.email ?? ''),
      String(r.company ?? ''),
      String(r.score ?? ''),
      String(r.timeline_count ?? ''),
    ])

    const table = renderTable(headers, tableRows)
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} member(s)`))
  }
}
