import { Args } from '@oclif/core'
import chalk from 'chalk'
import { confirm, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar mail remove command — removes an email from a webinar.
 *
 * T-05-08: Confirmation prompt includes domain before delete (repudiation mitigation).
 * --json mode skips the confirmation prompt (scripting mode — assume confirmed).
 *
 * Threat mitigations:
 *   T-05-07: applyCliTerms() on all error messages
 *   T-05-08: Confirmation prompt includes domain before destructive delete
 */
export default class WebinarMailRemove extends AuthenticatedCommand<typeof WebinarMailRemove> {
  static description = 'Remove an email from a webinar'

  static examples = [
    '<%= config.bin %> webinar mail remove 555',
    '<%= config.bin %> webinar mail remove 555 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Mail ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(WebinarMailRemove)
    this.printWorkspaceHeader()

    if (!this.jsonEnabled()) {
      // T-05-08: Confirmation includes domain before destructive operation
      const confirmed = await confirm({
        message: `Remove mail ${args.id} from ${this.activeWorkspace.domain}? This cannot be undone.`,
      })

      if (isCancel(confirmed) || !confirmed) {
        process.exit(EXIT_CANCELLED)
      }
    }

    const { data, error } = await this.apiClient.POST('/live/mail/remove', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: { live_mail_id: Number(args.id) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Mail ${args.id} removed`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'mail', id: args.id },
        ],
      })
    }

    this.log(chalk.green(`Mail ${args.id} removed`))
  }
}
