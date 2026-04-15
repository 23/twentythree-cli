import { Args } from '@oclif/core'
import chalk from 'chalk'
import { confirm, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar speaker remove command — removes a speaker from a webinar.
 *
 * T-05-08: Confirmation prompt includes domain before delete (repudiation mitigation).
 * --json mode skips the confirmation prompt (scripting mode — assume confirmed).
 *
 * Threat mitigations:
 *   T-05-07: applyCliTerms() on all error messages
 *   T-05-08: Confirmation prompt includes domain before destructive delete
 */
export default class WebinarSpeakerRemove extends AuthenticatedCommand<typeof WebinarSpeakerRemove> {
  static description = 'Remove a speaker from a webinar'

  static examples = [
    '<%= config.bin %> webinar speaker remove 9900',
    '<%= config.bin %> webinar speaker remove 9900 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Speaker ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(WebinarSpeakerRemove)
    this.printWorkspaceHeader()

    if (!this.jsonEnabled()) {
      // T-05-08: Confirmation includes domain before destructive operation
      const confirmed = await confirm({
        message: `Remove speaker ${args.id} from ${this.activeWorkspace.domain}? This cannot be undone.`,
      })

      if (isCancel(confirmed) || !confirmed) {
        process.exit(EXIT_CANCELLED)
      }
    }

    const { data, error } = await this.apiClient.POST('/live/speaker/remove', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: { live_speaker_id: Number(args.id) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Speaker ${args.id} removed`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'speaker', id: args.id },
        ],
      })
    }

    this.log(chalk.green(`Speaker ${args.id} removed`))
  }
}
