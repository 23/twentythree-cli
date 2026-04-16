import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Thumbnail template add command — creates a new thumbnail template.
 *
 * Maps to POST /thumbnail/template/add.
 * Requires name and liquid_template.
 *
 * Threat mitigations:
 *   T-08-09: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class ThumbnailAdd extends AuthenticatedCommand<typeof ThumbnailAdd> {
  static description = 'Create a new thumbnail template'

  static examples = [
    '<%= config.bin %> thumbnail add --name "My Template" --liquid-template "<div>{{ video.title }}</div>"',
    '<%= config.bin %> thumbnail add --name "My Template" --liquid-template "<div>{{ video.title }}</div>" --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    name: Flags.string({
      description: 'Name for the new thumbnail template',
      required: true,
    }),
    'liquid-template': Flags.string({
      description: 'Liquid template content for the thumbnail',
      required: true,
    }),
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'POST /thumbnail/template/add',
    auth_scope: 'write' as const,
    output_shape: {
      type: 'key-value' as const,
    },
    side_effects: 'creates' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(ThumbnailAdd)
    this.printWorkspaceHeader()

    const { data: createData, error: createError } = await this.apiClient.POST('/thumbnail/template/add', {
      body: {
        name: flags.name,
        liquid_template: flags['liquid-template'],
      } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (createError) {
      this.error(applyCliTerms(formatApiError(createError)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const thumbnailTemplateId = (createData as any)?.data?.thumbnail_template_id

    this.log(chalk.green('Thumbnail template created'))
    this.log(`ID: ${thumbnailTemplateId}`)

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: createData,
        summary: 'Thumbnail template created',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'thumbnail', id: String(thumbnailTemplateId) },
        ],
      })
    }
  }
}
