import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { text, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar attachment set-hidden command — shows or hides an attachment.
 *
 * Action command pattern (Decision D-1): outputs a single green success line only.
 * Use --hidden to hide, --no-hidden to make visible.
 *
 * Threat mitigations:
 *   T-05-03: applyCliTerms() on all error messages — no 'live'/'photo'/'album' leaks
 */
export default class WebinarAttachmentSetHidden extends AuthenticatedCommand<typeof WebinarAttachmentSetHidden> {
  static description = 'Show or hide a webinar attachment'

  static examples = [
    '<%= config.bin %> webinar attachment set-hidden 12345 --filename slides.pdf --hidden',
    '<%= config.bin %> webinar attachment set-hidden 12345 --filename slides.pdf --no-hidden',
    '<%= config.bin %> webinar attachment set-hidden 12345 --filename slides.pdf --hidden --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    filename: Flags.string({
      description: 'Filename of the attachment',
      required: false,
    }),
    hidden: Flags.boolean({
      description: 'Set hidden (--hidden) or visible (--no-hidden)',
      allowNo: true,
      required: true,
    }),
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarAttachmentSetHidden)
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

    const { data, error } = await this.apiClient.POST('/live/attachment/set-hidden', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: { live_id: Number(args.id), filename, hidden_p: flags.hidden ? 1 : 0 } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // Action command pattern: single green success line
    this.log(chalk.green(`Attachment "${filename}" ${flags.hidden ? 'hidden' : 'visible'}`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Attachment visibility updated',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
          { resource: 'attachment' },
        ],
      })
    }
  }
}
