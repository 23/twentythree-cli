import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'

/**
 * SEO get command — retrieves SEO metadata for a video, webinar, or webinar series.
 */
export default class SeoGet extends AuthenticatedCommand<typeof SeoGet> {
  static description = 'Get SEO metadata for a video, webinar, or webinar series'

  static examples = [
    '<%= config.bin %> seo get --object-id 12345',
    '<%= config.bin %> seo get --object-id 12345 --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /seo/get',
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
    const { flags } = await this.parse(SeoGet)

    this.printWorkspaceHeader()

    const body: Record<string, unknown> = {
      object_id: Number(flags['object-id']),
    }
    if (flags.fields) {
      body.fields = flags.fields
    }

    const { data, error } = await this.apiClient.POST('/seo/get', {
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
        summary: 'SEO metadata',
        breadcrumbs: [
          { domain },
          { resource: 'seo', id: flags['object-id'] },
        ],
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    this.log(`seo_title:       ${String(resp?.seo_title ?? '')}`)
    this.log(`seo_description: ${String(resp?.seo_description ?? '')}`)
    this.log(`seo_keywords:    ${String(resp?.seo_keywords ?? '')}`)
    this.log(`state:           ${String(resp?.state ?? '')}`)
  }
}
