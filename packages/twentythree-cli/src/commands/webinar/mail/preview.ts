import { Args } from '@oclif/core'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar mail preview command — outputs the raw HTML of a webinar email to stdout.
 *
 * CRITICAL (Decision D-3): uses process.stdout.write() NOT this.log() — this.log() adds
 * a trailing newline that corrupts HTML piping (e.g. `twentythree webinar mail preview <id> > preview.html`).
 *
 * T-05-09: Raw HTML output is intentional per Decision D-3. User controls where it's piped.
 *
 * Threat mitigations:
 *   T-05-07: applyCliTerms() on all error messages
 *   T-05-09: Raw HTML output accepted by design
 */
export default class WebinarMailPreview extends AuthenticatedCommand<typeof WebinarMailPreview> {
  static description = 'Preview a webinar email as raw HTML'

  static examples = [
    '<%= config.bin %> webinar mail preview 555',
    '<%= config.bin %> webinar mail preview 555 > preview.html',
    '<%= config.bin %> webinar mail preview 555 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Mail ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(WebinarMailPreview)
    this.printWorkspaceHeader()

    // openapi-fetch types may not include /live/mail/preview — cast to any to avoid
    // type errors if the path isn't in the generated spec
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.apiClient as any).GET('/live/mail/preview', {
      params: { query: { live_mail_id: Number(args.id) } },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Mail preview',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'mail', id: args.id },
        ],
      })
    }

    // CRITICAL (Decision D-3): write raw HTML directly to stdout without trailing newline
    // this.log() would add a newline that corrupts HTML piping
    process.stdout.write(String(data))
  }
}
