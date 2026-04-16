import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { text, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Poll add command — creates a new poll for a webinar.
 *
 * CRITICAL (Pitfall 5): Uses `object_id` NOT `live_id` for the webinar ID.
 * Falls back to interactive prompt for question if not provided.
 *
 * Threat mitigations:
 *   T-05-18: applyCliTerms() on all error messages
 */
export default class PollAdd extends AuthenticatedCommand<typeof PollAdd> {
  static description = 'Create a new poll for a webinar'

  static agentMetadata = {
    api_endpoint: 'POST /poll/add',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'creates' as const,
  }

  static examples = [
    '<%= config.bin %> poll add --object-id 12345 --question "What is your preference?"',
    '<%= config.bin %> poll add --object-id 12345 --question "How are you?" --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'object-id': Flags.string({
      description: 'Object ID (webinar or live object)',
      required: true,
    }),
    question: Flags.string({
      description: 'Poll question',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(PollAdd)
    this.printWorkspaceHeader()

    let question = flags.question

    // Interactive fallback when question not provided in non-JSON mode
    if (!question && !this.jsonEnabled()) {
      const result = await text({
        message: 'Poll question',
        placeholder: 'What do you want to ask?',
      })
      if (isCancel(result)) {
        process.exit(EXIT_CANCELLED)
      }
      question = result as string
    }

    if (!question) {
      this.error('--question is required in non-interactive mode', { exit: EXIT_ERROR })
    }

    // CRITICAL: object_id (NOT live_id) for poll endpoints
    const { data, error } = await this.apiClient.POST('/poll/add', {
      body: { object_id: Number(flags['object-id']), question } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pollId = (data as any)?.data?.poll_id ?? (data as any)?.poll_id

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Poll created',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'object', id: flags['object-id'] },
          { resource: 'poll', id: String(pollId ?? '') },
        ],
      })
    }

    this.log(chalk.green('Poll created'))
    if (pollId) {
      this.log(`ID: ${pollId}`)
    }
  }
}
