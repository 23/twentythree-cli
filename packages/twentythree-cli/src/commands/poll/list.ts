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

  static examples = [
    '<%= config.bin %> poll list --object-id 12345',
    '<%= config.bin %> poll list --object-id 12345 --json',
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
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(PollList)
    this.printWorkspaceHeader()

    const objectId = Number(flags['object-id'])
    const objectToken = flags['object-token'] ?? await this.fetchWebinarToken(objectId)

    const { data, error } = await this.apiClient.GET('/poll/list', {
      params: { query: { object_id: objectId, object_token: objectToken } as any },
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
