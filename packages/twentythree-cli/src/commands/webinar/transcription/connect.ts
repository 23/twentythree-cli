import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar transcription connect command — connects a transcription to a webinar.
 *
 * Action command pattern (Decision D-1): outputs a single green success line only.
 *
 * Threat mitigations:
 *   T-05-12: applyCliTerms() on all error messages
 */
export default class WebinarTranscriptionConnect extends AuthenticatedCommand<typeof WebinarTranscriptionConnect> {
  static description = 'Connect a transcription to a webinar'

  static examples = [
    '<%= config.bin %> webinar transcription connect 12345',
    '<%= config.bin %> webinar transcription connect 12345 --presenter-token abc123',
    '<%= config.bin %> webinar transcription connect 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'presenter-token': Flags.string({
      description: 'Presenter token',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarTranscriptionConnect)
    this.printWorkspaceHeader()

    // Only include presenter_token if provided
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = { live_id: Number(args.id) }
    if (flags['presenter-token'] !== undefined) {
      body.presenter_token = flags['presenter-token']
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.apiClient as any).POST('/live/transcription/connect', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // Action command pattern: single green success line
    this.log(chalk.green('Transcription connected'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Transcription connected',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
          { resource: 'transcription' },
        ],
      })
    }
  }
}
