import { Args, Flags } from '@oclif/core'
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
    '<%= config.bin %> webinar mail remove 555 --webinar-id 12345',
    '<%= config.bin %> webinar mail remove 555 --series-id 67890 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'webinar-id': Flags.string({
      description: 'Webinar ID (mutually exclusive with --series-id)',
      exclusive: ['series-id'],
    }),
    'series-id': Flags.string({
      description: 'Series ID (mutually exclusive with --webinar-id)',
      exclusive: ['webinar-id'],
    }),
  }

  static args = {
    id: Args.string({ description: 'Mail ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /live/mail/remove',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'destructive' as const,
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarMailRemove)
    this.printWorkspaceHeader()

    const contextField = flags['webinar-id']
      ? { live_id: Number(flags['webinar-id']) }
      : flags['series-id']
        ? { live_series_id: Number(flags['series-id']) }
        : null

    if (!contextField) {
      this.error(applyCliTerms('Either --webinar-id or --series-id is required'), { exit: EXIT_ERROR })
    }

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
      body: { ...contextField, live_mail_id: Number(args.id) } as any,
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
