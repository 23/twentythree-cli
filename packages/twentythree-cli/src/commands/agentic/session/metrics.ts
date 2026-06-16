import { Flags } from '@oclif/core'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'

/**
 * Agentic session metrics command — retrieves aggregate metrics across all
 * reported agentic (AI agent) sessions in the workspace.
 */
export default class AgenticSessionMetrics extends AuthenticatedCommand<typeof AgenticSessionMetrics> {
  static description = 'Get aggregate metrics for reported agentic (AI agent) sessions'

  static examples = [
    '<%= config.bin %> agentic session metrics',
    '<%= config.bin %> agentic session metrics --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /agentic/session/metrics',
    auth_scope: 'read' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    fields: Flags.string({
      description: 'Comma-separated fields to return',
      required: false,
    }),
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AgenticSessionMetrics)
    this.printWorkspaceHeader()

    const body: Record<string, unknown> = {}
    if (flags.fields) {
      body.fields = flags.fields
    }

    const { data, error } = await this.apiClient.POST('/agentic/session/metrics', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(formatApiError(error), { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Agentic session metrics',
        breadcrumbs: [{ domain: this.activeWorkspace.domain }, { resource: 'agentic' }],
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = (data as any)?.data ?? data
    this.log(`session_count:             ${String(resp?.session_count ?? '')}`)
    this.log(`number_of_prompts:         ${String(resp?.number_of_prompts ?? '')}`)
    this.log(`session_duration_seconds:  ${String(resp?.session_duration_seconds ?? '')}`)
  }
}
