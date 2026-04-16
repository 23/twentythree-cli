import { Args } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar recording start command — starts recording a webinar.
 *
 * Action command pattern (Decision D-1): outputs a single green success line only.
 *
 * Threat mitigations:
 *   T-05-12: applyCliTerms() on all error messages — no 'live'/'photo'/'album' leaks
 */
export default class WebinarRecordingStart extends AuthenticatedCommand<typeof WebinarRecordingStart> {
  static description = 'Start recording a webinar'

  static examples = [
    '<%= config.bin %> webinar recording start 12345',
    '<%= config.bin %> webinar recording start 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /live/recording/start',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'updates' as const,
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(WebinarRecordingStart)
    this.printWorkspaceHeader()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await this.apiClient.POST('/live/recording/start' as any, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: { live_id: Number(args.id) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // Action command pattern: single green success line
    this.log(chalk.green('Recording started'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Recording started',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
        ],
      })
    }
  }
}
