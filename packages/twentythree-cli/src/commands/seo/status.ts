import { Flags } from '@oclif/core'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'

/**
 * SEO status command — retrieves SEO readiness status for a video, webinar, or webinar series.
 */
export default class SeoStatus extends AuthenticatedCommand<typeof SeoStatus> {
  static description = 'Get SEO readiness status for a video, webinar, or webinar series'

  static examples = [
    '<%= config.bin %> seo status --object-id 12345',
    '<%= config.bin %> seo status --object-id 12345 --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /seo/status',
    auth_scope: 'read' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'object-id': Flags.string({
      description: 'Object ID (video, webinar, or webinar series)',
      required: true,
    }),
    fields: Flags.string({
      description: 'Comma-separated fields to return',
      required: false,
    }),
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(SeoStatus)

    this.printWorkspaceHeader()

    const body: Record<string, unknown> = {
      object_id: Number(flags['object-id']),
    }
    if (flags.fields) {
      body.fields = flags.fields
    }

    const { data, error } = await this.apiClient.POST('/seo/status', {
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
        summary: 'SEO status',
        breadcrumbs: [
          { domain },
          { resource: 'seo', id: flags['object-id'] },
        ],
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = (data as any)?.data ?? data
    this.log(`object_id:           ${String(resp?.object_id ?? '')}`)
    this.log(`object_type:         ${String(resp?.object_type ?? '')}`)
    this.log(`current_score:       ${String(resp?.current_score ?? '')}`)
    this.log(`max_score:           ${String(resp?.max_score ?? '')}`)
    this.log(`overall_state_label: ${String(resp?.overall_state_label ?? '')}`)

    const states = resp?.states
    if (Array.isArray(states) && states.length > 0) {
      this.log('')
      this.log('SEO states:')
      for (const s of states) {
        this.log(`  [${String(s.state).padEnd(8)}] ${String(s.label)}`)
      }
    }
  }
}
