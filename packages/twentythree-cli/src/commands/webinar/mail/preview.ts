import { Args, Flags } from '@oclif/core'
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
    '<%= config.bin %> webinar mail preview 555 --webinar-id 12345',
    '<%= config.bin %> webinar mail preview 555 --series-id 67890 > preview.html',
    '<%= config.bin %> webinar mail preview 555 --webinar-id 12345 --json',
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

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarMailPreview)
    this.printWorkspaceHeader()

    const contextField = flags['webinar-id']
      ? { live_id: Number(flags['webinar-id']) }
      : flags['series-id']
        ? { live_series_id: Number(flags['series-id']) }
        : null

    if (!contextField) {
      this.error(applyCliTerms('Either --webinar-id or --series-id is required'), { exit: EXIT_ERROR })
    }

    // openapi-fetch types may not include /live/mail/preview — cast to any to avoid
    // type errors if the path isn't in the generated spec
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.apiClient as any).GET('/live/mail/preview', {
      params: { query: { ...contextField, live_mail_id: Number(args.id) } },
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
