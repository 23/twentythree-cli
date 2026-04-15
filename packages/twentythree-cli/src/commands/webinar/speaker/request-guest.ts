import { Args } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar speaker request-guest command — requests a speaker as a guest.
 *
 * Action command pattern (Decision D-1): outputs a single green success line only.
 *
 * Threat mitigations:
 *   T-05-07: applyCliTerms() on all error messages
 */
export default class WebinarSpeakerRequestGuest extends AuthenticatedCommand<typeof WebinarSpeakerRequestGuest> {
  static description = 'Request a speaker as a guest'

  static examples = [
    '<%= config.bin %> webinar speaker request-guest 9900',
    '<%= config.bin %> webinar speaker request-guest 9900 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Speaker ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(WebinarSpeakerRequestGuest)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.POST('/live/speaker/request-guest', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: { live_speaker_id: Number(args.id) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // Action command pattern: single green success line
    this.log(chalk.green('Guest request sent'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Guest request sent',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'speaker', id: args.id },
        ],
      })
    }
  }
}
