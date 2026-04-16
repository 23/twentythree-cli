import { Args } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar room send-recording command — sends a recording from the webinar room.
 *
 * Action command pattern (Decision D-1): outputs a single green success line only.
 * NOTE: Uses path /live/webinar/send-recording NOT /live/room/send-recording.
 * Cast to any because this path may not be in generated OpenAPI types.
 *
 * Threat mitigations:
 *   T-05-12: applyCliTerms() on all error messages
 */
export default class WebinarRoomSendRecording extends AuthenticatedCommand<typeof WebinarRoomSendRecording> {
  static description = 'Send a recording from the webinar room'

  static examples = [
    '<%= config.bin %> webinar room send-recording 12345',
    '<%= config.bin %> webinar room send-recording 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /live/webinar/send-recording',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'updates' as const,
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(WebinarRoomSendRecording)
    this.printWorkspaceHeader()

    // NOTE: path is /live/webinar/send-recording — NOT /live/room/send-recording
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.apiClient as any).POST('/live/webinar/send-recording', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: { live_id: Number(args.id) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // Action command pattern: single green success line
    this.log(chalk.green('Recording sent'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Recording sent',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
          { resource: 'room' },
        ],
      })
    }
  }
}
