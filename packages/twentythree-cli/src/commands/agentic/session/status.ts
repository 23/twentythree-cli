import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'

/**
 * Agentic session status command — reports (stores) the outcome of an agentic
 * (AI agent) session: what it accomplished, prompt count, duration, the AI
 * provider used, and the TwentyThree skill version.
 */
export default class AgenticSessionStatus extends AuthenticatedCommand<typeof AgenticSessionStatus> {
  static description = 'Report (store) the status of an agentic (AI agent) session'

  static examples = [
    '<%= config.bin %> agentic session status --session-identifier abc123 --summary "Uploaded 3 videos" --number-of-prompts 12 --session-duration-seconds 540 --ai-provider "claude code" --twentythree-skill-version 1.4.0',
    '<%= config.bin %> agentic session status --session-identifier abc123 --summary "Created a webinar" --number-of-prompts 5 --session-duration-seconds 120 --ai-provider "codex" --twentythree-skill-version 1.4.0 --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /agentic/session/status',
    auth_scope: 'read' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'creates' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'session-identifier': Flags.string({
      description: 'Unique identifier for the agent session being reported',
      required: true,
    }),
    summary: Flags.string({
      description: 'Short summary of what the agent session accomplished',
      required: true,
    }),
    'number-of-prompts': Flags.integer({
      description: 'Number of user prompts in the agent session (0 if unknown)',
      required: true,
    }),
    'session-duration-seconds': Flags.integer({
      description: 'Duration of the agent session, in seconds (0 if unknown)',
      required: true,
    }),
    'ai-provider': Flags.string({
      description: 'AI/LLM provider used in the session (e.g. "claude code", "codex")',
      required: true,
    }),
    'twentythree-skill-version': Flags.string({
      description: 'Version of the TwentyThree skill used ("unknown" if unknown)',
      required: true,
    }),
    fields: Flags.string({
      description: 'Comma-separated fields to return',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AgenticSessionStatus)
    this.printWorkspaceHeader()

    const body: Record<string, unknown> = {
      session_identifier: flags['session-identifier'],
      summary: flags.summary,
      number_of_prompts: flags['number-of-prompts'],
      session_duration_seconds: flags['session-duration-seconds'],
      ai_provider: flags['ai-provider'],
      twentythree_skill_version: flags['twentythree-skill-version'],
    }
    if (flags.fields) {
      body.fields = flags.fields
    }

    const { data, error } = await this.apiClient.POST('/agentic/session/status', {
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
        summary: 'Agentic session status reported',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'agentic', id: flags['session-identifier'] },
        ],
      })
    }

    this.log(chalk.green('Agentic session status reported'))
    this.log(`Session: ${flags['session-identifier']}`)
  }
}
