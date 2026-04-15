import { Args } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar speaker cancel-guest-request command — cancels a pending guest request for a speaker.
 *
 * Action command pattern (Decision D-1): outputs a single green success line only.
 *
 * Threat mitigations:
 *   T-05-07: applyCliTerms() on all error messages
 */
export default class WebinarSpeakerCancelGuestRequest extends AuthenticatedCommand<typeof WebinarSpeakerCancelGuestRequest> {
  static description = 'Cancel a guest request for a speaker'

  static examples = [
    '<%= config.bin %> webinar speaker cancel-guest-request 12345 9900',
    '<%= config.bin %> webinar speaker cancel-guest-request 12345 9900 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    webinarId: Args.string({ description: 'Webinar ID', required: true }),
    id: Args.string({ description: 'Speaker ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(WebinarSpeakerCancelGuestRequest)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.POST('/live/speaker/cancel-guest-request', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: { live_id: Number(args.webinarId), live_speaker_id: Number(args.id) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // Action command pattern: single green success line
    this.log(chalk.green('Guest request cancelled'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Guest request cancelled',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'speaker', id: args.id },
        ],
      })
    }
  }
}
