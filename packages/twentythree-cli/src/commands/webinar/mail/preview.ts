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

  static agentMetadata = {
    api_endpoint: 'GET /live/mail/preview',
    auth_scope: 'read' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'none' as const,
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

    // Use native fetch — openapi-fetch parses the response as JSON, but this endpoint
    // returns raw HTML. We need the body as text.
    const query = new URLSearchParams({
      ...Object.fromEntries(Object.entries(contextField!).map(([k, v]) => [k, String(v)])),
      live_mail_id: String(args.id),
    })
    const headers: HeadersInit = {}
    if (this.activeWorkspace.bearer_token) {
      headers['Authorization'] = `Bearer ${this.activeWorkspace.bearer_token}`
    }
    const response = await fetch(`${this.apiBaseUrl}live/mail/preview?${query}`, { headers })
    const html = await response.text()

    if (!response.ok) {
      this.error(applyCliTerms(`API error ${response.status}: ${html}`), { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: html,
        summary: 'Mail preview',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'mail', id: args.id },
        ],
      })
    }

    // CRITICAL (Decision D-3): write raw HTML directly to stdout without trailing newline
    // this.log() would add a newline that corrupts HTML piping
    process.stdout.write(html)
  }
}
