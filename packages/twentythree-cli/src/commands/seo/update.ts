import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'

/**
 * SEO update command — updates SEO metadata for a video, webinar, or webinar series.
 */
export default class SeoUpdate extends AuthenticatedCommand<typeof SeoUpdate> {
  static description = 'Update SEO metadata for a video, webinar, or webinar series'

  static examples = [
    '<%= config.bin %> seo update --object-id 12345 --seo-name "My Video"',
    '<%= config.bin %> seo update --object-id 12345 --seo-policy index --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /seo/update',
    auth_scope: 'write' as const,
    output_shape: { type: 'message' as const },
    side_effects: 'updates' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'object-id': Flags.string({
      description: 'Object ID (video, webinar, or webinar series)',
      required: true,
    }),
    'seo-name': Flags.string({
      description: 'SEO title for the object',
      required: false,
    }),
    'seo-description': Flags.string({
      description: 'SEO description for the object',
      required: false,
    }),
    'seo-keywords': Flags.string({
      description: 'SEO keywords for the object',
      required: false,
    }),
    'canonical-url': Flags.string({
      description: 'Canonical URL for the object',
      required: false,
    }),
    'seo-policy': Flags.string({
      description: 'SEO indexing policy ("", "index", or "noindex")',
      required: false,
      options: ['', 'index', 'noindex'],
    }),
    'enrich-immediately': Flags.boolean({
      description: 'Enrich SEO metadata immediately',
      required: false,
    }),
    fields: Flags.string({
      description: 'Comma-separated fields to return',
      required: false,
    }),
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(SeoUpdate)

    this.printWorkspaceHeader()

    const body: Record<string, unknown> = {
      object_id: Number(flags['object-id']),
    }

    if (flags['seo-name'] !== undefined) body.seo_name = flags['seo-name']
    if (flags['seo-description'] !== undefined) body.seo_description = flags['seo-description']
    if (flags['seo-keywords'] !== undefined) body.seo_keywords = flags['seo-keywords']
    if (flags['canonical-url'] !== undefined) body.canonical_url = flags['canonical-url']
    if (flags['seo-policy'] !== undefined) body.seo_policy = flags['seo-policy']
    if (flags['enrich-immediately'] !== undefined) body.enrich_immediately_p = flags['enrich-immediately'] ? 1 : 0
    if (flags.fields !== undefined) body.fields = flags.fields

    const { data, error } = await this.apiClient.POST('/seo/update', {
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
        summary: 'SEO metadata updated',
        breadcrumbs: [
          { domain },
          { resource: 'seo', id: flags['object-id'] },
        ],
      })
    }

    this.log(chalk.green('SEO metadata updated'))
  }
}
