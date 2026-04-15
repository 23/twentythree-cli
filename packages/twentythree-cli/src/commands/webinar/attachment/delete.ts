import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { text, confirm, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar attachment delete command — deletes an attachment from a webinar by filename.
 *
 * CRITICAL: uses `filename` param (NOT an attachment ID) to identify the attachment.
 *
 * Threat mitigations:
 *   T-05-03: applyCliTerms() on all error messages — no 'live'/'photo'/'album' leaks
 *   T-05-04: Confirmation prompt includes domain and filename before delete
 */
export default class WebinarAttachmentDelete extends AuthenticatedCommand<typeof WebinarAttachmentDelete> {
  static description = 'Delete an attachment from a webinar'

  static examples = [
    '<%= config.bin %> webinar attachment delete 12345 --filename slides.pdf',
    '<%= config.bin %> webinar attachment delete 12345 --filename handout.pdf --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    filename: Flags.string({
      description: 'Filename of the attachment to delete',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarAttachmentDelete)
    this.printWorkspaceHeader()

    let filename = flags.filename

    // Interactive fallback when filename not provided in non-JSON mode
    if (!filename && !this.jsonEnabled()) {
      const result = await text({ message: 'Attachment filename' })
      if (isCancel(result)) {
        process.exit(EXIT_CANCELLED)
      }
      filename = result as string
    }

    if (!filename) {
      this.error('--filename is required in non-interactive mode', { exit: EXIT_ERROR })
    }

    // T-05-04: Confirmation prompt includes domain and filename before delete
    if (!this.jsonEnabled()) {
      const confirmed = await confirm({
        message: `Delete attachment "${filename}" from webinar ${args.id} on ${this.activeWorkspace.domain}? This cannot be undone.`,
      })

      if (isCancel(confirmed) || !confirmed) {
        process.exit(EXIT_CANCELLED)
      }
    }

    const { data, error } = await this.apiClient.POST('/live/attachment/delete', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: { live_id: Number(args.id), filename } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Attachment "${filename}" deleted`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Attachment deleted',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
          { resource: 'attachment' },
        ],
      })
    }
  }
}
