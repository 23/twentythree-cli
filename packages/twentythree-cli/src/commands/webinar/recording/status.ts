import { Args } from '@oclif/core'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, renderTable, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar recording status command — gets recording status for a webinar.
 *
 * Threat mitigations:
 *   T-05-12: applyCliTerms() on all error messages — no 'live'/'photo'/'album' leaks
 */
export default class WebinarRecordingStatus extends AuthenticatedCommand<typeof WebinarRecordingStatus> {
  static description = 'Get recording status for a webinar'

  static examples = [
    '<%= config.bin %> webinar recording status 12345',
    '<%= config.bin %> webinar recording status 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'GET /live/recording/status',
    auth_scope: 'read' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(WebinarRecordingStatus)
    this.printWorkspaceHeader()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.apiClient as any).GET('/live/recording/status', {
      params: { query: { live_id: Number(args.id) } },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Recording status for webinar ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
          { resource: 'recording' },
        ],
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d: Record<string, unknown> = (data as any)?.data ?? data ?? {}
    const rows = Object.entries(d).map(([k, v]) => [k, String(v ?? '')])

    const table = renderTable(['Field', 'Value'], rows)
    this.log(table.toString())
  }
}
