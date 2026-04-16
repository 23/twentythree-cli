import { Args } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar speaker remove-avatar command — removes the avatar image from a speaker.
 *
 * Action command pattern (Decision D-1): outputs a single green success line only.
 *
 * Threat mitigations:
 *   T-05-07: applyCliTerms() on all error messages
 */
export default class WebinarSpeakerRemoveAvatar extends AuthenticatedCommand<typeof WebinarSpeakerRemoveAvatar> {
  static description = 'Remove the avatar image from a speaker'

  static examples = [
    '<%= config.bin %> webinar speaker remove-avatar 12345 9900',
    '<%= config.bin %> webinar speaker remove-avatar 12345 9900 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    webinarId: Args.string({ description: 'Webinar ID', required: true }),
    id: Args.string({ description: 'Speaker ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /live/speaker/remove-avatar',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'destructive' as const,
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(WebinarSpeakerRemoveAvatar)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.POST('/live/speaker/remove-avatar', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: { live_id: Number(args.webinarId), live_speaker_id: Number(args.id) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // Action command pattern: single green success line
    this.log(chalk.green('Speaker avatar removed'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Speaker avatar removed',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'speaker', id: args.id },
        ],
      })
    }
  }
}
