import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { text, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar series skip-recurrence command — skips or unskips a recurrence.
 *
 * NOTE: Uses GET method per API types.
 * Falls back to interactive prompt for recurrence-id if not provided.
 *
 * Threat mitigations:
 *   T-05-16: applyCliTerms() on all error messages
 */
export default class WebinarSeriesSkipRecurrence extends AuthenticatedCommand<typeof WebinarSeriesSkipRecurrence> {
  static description = 'Skip or unskip a recurrence for a webinar series'

  static examples = [
    '<%= config.bin %> webinar series skip-recurrence 42 --recurrence-id 7 --skipped',
    '<%= config.bin %> webinar series skip-recurrence 42 --recurrence-id 7 --no-skipped',
    '<%= config.bin %> webinar series skip-recurrence 42 --recurrence-id 7 --skipped --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'recurrence-id': Flags.string({
      description: 'Recurrence ID',
      required: false,
    }),
    skipped: Flags.boolean({
      description: 'Set skipped (--skipped) or unskipped (--no-skipped)',
      allowNo: true,
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Series ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'GET /live/series/skip-recurrence',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'updates' as const,
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarSeriesSkipRecurrence)
    this.printWorkspaceHeader()

    let recurrenceId = flags['recurrence-id']

    // Interactive fallback when recurrence-id not provided in non-JSON mode
    if (!recurrenceId && !this.jsonEnabled()) {
      const result = await text({ message: 'Recurrence ID' })
      if (isCancel(result)) {
        process.exit(EXIT_CANCELLED)
      }
      recurrenceId = result as string
    }

    if (!recurrenceId) {
      this.error('--recurrence-id is required in non-interactive mode', { exit: EXIT_ERROR })
    }

    const skipped = flags.skipped ?? true

    // NOTE: This is a GET endpoint per API types
    const { data, error } = await this.apiClient.GET('/live/series/skip-recurrence', {
      params: {
        query: {
          live_series_id: Number(args.id),
          recurrence_id: Number(recurrenceId),
          skipped_p: skipped ? 1 : 0,
        } as any,
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Recurrence ${skipped ? 'skipped' : 'unskipped'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'series', id: args.id },
        ],
      })
    }

    this.log(chalk.green(`Recurrence ${skipped ? 'skipped' : 'unskipped'}`))
  }
}
