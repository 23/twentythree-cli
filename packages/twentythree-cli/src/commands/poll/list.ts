import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Poll list command — lists polls for a webinar.
 *
 * CRITICAL (Pitfall 5): Poll endpoints use `object_id` NOT `live_id`.
 * Token field is `object_token` (auto-looked up via fetchWebinarToken).
 *
 * Threat mitigations:
 *   T-05-18: applyCliTerms() on all error messages
 */
export default class PollList extends AuthenticatedCommand<typeof PollList> {
  static description = 'List polls for a webinar'

  static agentMetadata = {
    api_endpoint: 'GET /poll/list',
    auth_scope: 'anonymous' as const,
    output_shape: { type: 'table' as const, columns: ['ID', 'Question', 'Open', 'Results Visible'] },
    side_effects: 'none' as const,
  }

  static examples = [
    '<%= config.bin %> poll list --object-id 12345',
    '<%= config.bin %> poll list --object-id 12345 --json',
    '<%= config.bin %> poll list --object-id 12345 --open --json',
    '<%= config.bin %> poll list --object-id 12345 --poll-id 99 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'object-id': Flags.string({
      description: 'Object ID (webinar or live object)',
      required: true,
    }),
    'object-token': Flags.string({
      description: 'Object token (auto-looked up if omitted)',
      required: false,
    }),
    'poll-id': Flags.integer({
      description: 'Limit results to a single poll by its ID',
      required: false,
    }),
    open: Flags.boolean({
      description: 'Filter by open/closed status',
      allowNo: true,
      required: false,
    }),
    public: Flags.boolean({
      description: 'Filter by public/non-public status',
      allowNo: true,
      required: false,
    }),
    'display-results': Flags.boolean({
      description: 'Filter to polls with publicly displayed results',
      allowNo: true,
      required: false,
    }),
    fields: Flags.string({
      description: 'Comma-separated list of fields to return in the API response',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(PollList)
    this.printWorkspaceHeader()

    const objectId = Number(flags['object-id'])
    const objectToken = flags['object-token'] ?? await this.fetchWebinarToken(objectId)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { object_id: objectId, object_token: objectToken }
    if (flags['poll-id'] !== undefined) query.poll_id = flags['poll-id']
    if (flags.open !== undefined) query.open_p = flags.open
    if (flags.public !== undefined) query.public_p = flags.public
    if (flags['display-results'] !== undefined) query.display_results_p = flags['display-results']
    if (flags.fields !== undefined) query.fields = flags.fields

    const { data, error } = await this.apiClient.GET('/poll/list', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params: { query: query as any },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const polls: any[] = Array.isArray((data as any)?.data)
      ? (data as any).data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : (data as any)?.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? [(data as any).data]
      : []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: polls,
        summary: `${polls.length} poll${polls.length === 1 ? '' : 's'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'object', id: flags['object-id'] },
          { resource: 'poll' },
        ],
      })
    }

    if (polls.length === 0) {
      this.log('No polls found.')
      return
    }

    const headers = ['ID', 'Question', 'Open', 'Results Visible']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = polls.map((p: any) => [
      String(p.poll_id ?? ''),
      applyCliTerms(String(p.question ?? '')),
      p.open_p ? 'yes' : 'no',
      p.display_results_p ? 'yes' : 'no',
    ])

    const table = renderTable(headers, rows)
    this.log(table.toString())
    this.log(chalk.dim(`${polls.length} poll${polls.length === 1 ? '' : 's'}`))
  }
}
