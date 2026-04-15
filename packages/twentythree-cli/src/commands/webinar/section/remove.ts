import { Args } from '@oclif/core'
import chalk from 'chalk'
import { confirm, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar section remove command — removes an agenda section.
 *
 * CRITICAL: uses `live_section_id` (the section's own ID), NOT `live_id`.
 * Prompts for confirmation before removing (domain name included).
 *
 * Threat mitigations:
 *   T-05-03: applyCliTerms() on all error messages — no 'live'/'photo'/'album' leaks
 */
export default class WebinarSectionRemove extends AuthenticatedCommand<typeof WebinarSectionRemove> {
  static description = 'Remove an agenda section from a webinar'

  static examples = [
    '<%= config.bin %> webinar section remove 99',
    '<%= config.bin %> webinar section remove 99 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Section ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(WebinarSectionRemove)
    this.printWorkspaceHeader()

    if (!this.jsonEnabled()) {
      const confirmed = await confirm({
        message: `Remove section ${args.id} from ${this.activeWorkspace.domain}? This cannot be undone.`,
      })

      if (isCancel(confirmed) || !confirmed) {
        process.exit(EXIT_CANCELLED)
      }
    }

    const { data, error } = await this.apiClient.POST('/live/section/remove', {
      // CRITICAL: live_section_id (section's own ID), NOT live_id
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: { live_section_id: Number(args.id) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Section ${args.id} removed`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Section ${args.id} removed`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'section', id: args.id },
        ],
      })
    }
  }
}
