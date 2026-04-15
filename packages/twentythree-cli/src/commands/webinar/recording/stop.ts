import { Args } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar recording stop command — stops recording a webinar.
 *
 * Action command pattern (Decision D-1): outputs a single green success line only.
 *
 * Threat mitigations:
 *   T-05-10: Never display upload_token from recording response — security sensitive
 *   T-05-12: applyCliTerms() on all error messages — no 'live'/'photo'/'album' leaks
 */
export default class WebinarRecordingStop extends AuthenticatedCommand<typeof WebinarRecordingStop> {
  static description = 'Stop recording a webinar'

  static examples = [
    '<%= config.bin %> webinar recording stop 12345',
    '<%= config.bin %> webinar recording stop 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(WebinarRecordingStop)
    this.printWorkspaceHeader()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await this.apiClient.POST('/live/recording/stop' as any, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: { live_id: Number(args.id) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // Action command pattern: single green success line
    // SECURITY T-05-10: Do NOT log upload_token from response
    this.log(chalk.green('Recording stopped'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        // SECURITY T-05-10: data passed through to --json but upload_token not displayed in table
        data,
        summary: 'Recording stopped',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
        ],
      })
    }
  }
}
