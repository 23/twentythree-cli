import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { text, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar speaker add-from-speaker command — adds a speaker from the library.
 *
 * Interactive fallback when --speaker-id is not provided.
 *
 * Threat mitigations:
 *   T-05-07: applyCliTerms() on all error messages
 */
export default class WebinarSpeakerAddFromSpeaker extends AuthenticatedCommand<typeof WebinarSpeakerAddFromSpeaker> {
  static description = 'Add a speaker from the workspace speaker library'

  static examples = [
    '<%= config.bin %> webinar speaker add-from-speaker 12345 --speaker-id 99',
    '<%= config.bin %> webinar speaker add-from-speaker 12345',
    '<%= config.bin %> webinar speaker add-from-speaker 12345 --speaker-id 99 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'speaker-id': Flags.string({
      description: 'Library speaker ID to add',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /live/speaker/add-from-speaker',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'creates' as const,
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarSpeakerAddFromSpeaker)
    this.printWorkspaceHeader()

    let speakerId = flags['speaker-id']

    // Interactive fallback
    if (!speakerId && !this.jsonEnabled()) {
      const result = await text({ message: 'Speaker ID from library' })
      if (isCancel(result)) process.exit(EXIT_CANCELLED)
      speakerId = result as string
    }

    if (!speakerId) {
      this.error('--speaker-id is required in non-interactive mode', { exit: EXIT_ERROR })
    }

    const { data, error } = await this.apiClient.POST('/live/speaker/add-from-speaker', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: { live_id: Number(args.id), live_speaker_id: Number(speakerId) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Speaker added from library',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
          { resource: 'speaker' },
        ],
      })
    }

    this.log(chalk.green('Speaker added from library'))
  }
}
