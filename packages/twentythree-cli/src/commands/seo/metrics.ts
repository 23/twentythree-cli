import { Flags } from '@oclif/core'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'

/**
 * SEO metrics command — retrieves workspace-wide SEO and GEO metrics:
 * average score across all objects, video/webinar/page counts, and the
 * library's SEO health broken into high/medium/low tiers.
 */
export default class SeoMetrics extends AuthenticatedCommand<typeof SeoMetrics> {
  static description = 'Get workspace-wide SEO and GEO metrics'

  static examples = [
    '<%= config.bin %> seo metrics',
    '<%= config.bin %> seo metrics --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /seo/metrics',
    auth_scope: 'read' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    fields: Flags.string({
      description: 'Comma-separated fields to return',
      required: false,
    }),
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(SeoMetrics)

    this.printWorkspaceHeader()

    const body: Record<string, unknown> = {}
    if (flags.fields) {
      body.fields = flags.fields
    }

    const { data, error } = await this.apiClient.POST('/seo/metrics', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(formatApiError(error), { exit: EXIT_ERROR })
    }

    const domain = this.activeWorkspace.domain

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'SEO metrics',
        breadcrumbs: [{ domain }, { resource: 'seo' }],
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = (data as any)?.data ?? data
    this.log(`average_score:          ${String(resp?.average_score ?? '')}`)
    this.log(`video_count:            ${String(resp?.video_count ?? '')}`)
    this.log(`webinar_count:          ${String(resp?.webinar_count ?? '')}`)
    this.log(`page_count:             ${String(resp?.page_count ?? '')}`)
    this.log(`library_health_high:    ${String(resp?.library_health_high ?? '')}`)
    this.log(`library_health_medium:  ${String(resp?.library_health_medium ?? '')}`)
    this.log(`library_health_low:     ${String(resp?.library_health_low ?? '')}`)
  }
}
