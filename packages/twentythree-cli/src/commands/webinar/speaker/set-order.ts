import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { text, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar speaker set-order command — sets the display order of a speaker on a webinar.
 *
 * Interactive fallback when --speaker-id or --order are not provided.
 *
 * Threat mitigations:
 *   T-05-07: applyCliTerms() on all error messages
 */
export default class WebinarSpeakerSetOrder extends AuthenticatedCommand<typeof WebinarSpeakerSetOrder> {
  static description = 'Set the display order of a speaker on a webinar'

  static examples = [
    '<%= config.bin %> webinar speaker set-order 12345 --speaker-id 9900 --order 1',
    '<%= config.bin %> webinar speaker set-order 12345',
    '<%= config.bin %> webinar speaker set-order 12345 --speaker-id 9900 --order 1 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'speaker-id': Flags.string({
      description: 'Speaker ID',
      required: false,
    }),
    order: Flags.integer({
      description: 'New display order (1-based)',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /live/speaker/set-order',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'updates' as const,
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarSpeakerSetOrder)
    this.printWorkspaceHeader()

    let speakerId = flags['speaker-id']
    let order = flags.order

    // Interactive fallback
    if ((!speakerId || order === undefined) && !this.jsonEnabled()) {
      if (!speakerId) {
        const result = await text({ message: 'Speaker ID' })
        if (isCancel(result)) process.exit(EXIT_CANCELLED)
        speakerId = result as string
      }
      if (order === undefined) {
        const result = await text({ message: 'Display order (1-based)' })
        if (isCancel(result)) process.exit(EXIT_CANCELLED)
        order = Number(result)
      }
    }

    if (!speakerId) {
      this.error('--speaker-id is required in non-interactive mode', { exit: EXIT_ERROR })
    }
    if (order === undefined) {
      this.error('--order is required in non-interactive mode', { exit: EXIT_ERROR })
    }

    const { data, error } = await this.apiClient.POST('/live/speaker/set-order', {
      body: {
        live_id: Number(args.id),
        live_speaker_id: Number(speakerId),
        order: Number(order),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Speaker order updated',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
          { resource: 'speaker', id: speakerId },
        ],
      })
    }

    this.log(chalk.green('Speaker order updated'))
  }
}
