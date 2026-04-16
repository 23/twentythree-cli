import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { text, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar speaker add-from-user command — adds a workspace user as a speaker.
 *
 * Interactive fallback when --user-id is not provided.
 *
 * Threat mitigations:
 *   T-05-07: applyCliTerms() on all error messages
 */
export default class WebinarSpeakerAddFromUser extends AuthenticatedCommand<typeof WebinarSpeakerAddFromUser> {
  static description = 'Add a workspace user as a speaker on a webinar'

  static examples = [
    '<%= config.bin %> webinar speaker add-from-user 12345 --user-id 42',
    '<%= config.bin %> webinar speaker add-from-user 12345',
    '<%= config.bin %> webinar speaker add-from-user 12345 --user-id 42 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'user-id': Flags.string({
      description: 'User ID to add as speaker',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /live/speaker/add-from-user',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'creates' as const,
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarSpeakerAddFromUser)
    this.printWorkspaceHeader()

    let userId = flags['user-id']

    // Interactive fallback
    if (!userId && !this.jsonEnabled()) {
      const result = await text({ message: 'User ID' })
      if (isCancel(result)) process.exit(EXIT_CANCELLED)
      userId = result as string
    }

    if (!userId) {
      this.error('--user-id is required in non-interactive mode', { exit: EXIT_ERROR })
    }

    const { data, error } = await this.apiClient.POST('/live/speaker/add-from-user', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: { live_id: Number(args.id), user_id: Number(userId) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Speaker added from user',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
          { resource: 'speaker' },
        ],
      })
    }

    this.log(chalk.green('Speaker added from user'))
  }
}
