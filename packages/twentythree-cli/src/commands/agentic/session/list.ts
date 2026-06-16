import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'

/**
 * Agentic session list command — lists agentic (AI agent) sessions that have
 * been reported to the workspace via `agentic session status`.
 */
export default class AgenticSessionList extends AuthenticatedCommand<typeof AgenticSessionList> {
  static description = 'List reported agentic (AI agent) sessions'

  static examples = [
    '<%= config.bin %> agentic session list',
    '<%= config.bin %> agentic session list --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /agentic/session/list',
    auth_scope: 'read' as const,
    output_shape: {
      type: 'table' as const,
      columns: ['Session', 'Summary', 'Prompts', 'Duration (s)', 'Started'],
    },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    fields: Flags.string({
      description: 'Comma-separated fields to return',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AgenticSessionList)
    this.printWorkspaceHeader()

    const body: Record<string, unknown> = {}
    if (flags.fields) {
      body.fields = flags.fields
    }

    const { data, error } = await this.apiClient.POST('/agentic/session/list', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(formatApiError(error), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessions: any[] = Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: sessions,
        summary: `${sessions.length} session${sessions.length === 1 ? '' : 's'}`,
        breadcrumbs: [{ domain: this.activeWorkspace.domain }, { resource: 'agentic' }],
      })
    }

    if (sessions.length === 0) {
      this.log('No agentic sessions found.')
      return
    }

    const headers = ['Session', 'Summary', 'Prompts', 'Duration (s)', 'Started']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = sessions.map((s: any) => [
      String(s.session_identifier ?? ''),
      String(s.summary ?? ''),
      String(s.number_of_prompts ?? ''),
      String(s.session_duration_seconds ?? ''),
      s.session_start_time_epoch
        ? new Date(Number(s.session_start_time_epoch) * 1000).toISOString()
        : '',
    ])

    const table = renderTable(headers, rows)
    this.log(table.toString())
    this.log(chalk.dim(`${sessions.length} session${sessions.length === 1 ? '' : 's'}`))
  }
}
