import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Thumbnail template update command — updates an existing thumbnail template.
 *
 * Maps to POST /thumbnail/template/update.
 * Only flags explicitly provided are included in the update body.
 *
 * Threat mitigations:
 *   T-08-09: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class ThumbnailUpdate extends AuthenticatedCommand<typeof ThumbnailUpdate> {
  static description = 'Update a thumbnail template'

  static examples = [
    '<%= config.bin %> thumbnail update 42 --name "Updated Name"',
    '<%= config.bin %> thumbnail update 42 --liquid-template "<div>{{ video.title }}</div>"',
    '<%= config.bin %> thumbnail update 42 --object-type photo --width 1280 --height 720',
    '<%= config.bin %> thumbnail update 42 --name "Updated Name" --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    name: Flags.string({
      description: 'New name for the template',
      required: false,
    }),
    'liquid-template': Flags.string({
      description: 'New Liquid template content',
      required: false,
    }),
    'object-type': Flags.string({
      description: 'Object type (photo, live, liveseries)',
      required: false,
    }),
    width: Flags.integer({
      description: 'Template width in pixels',
      required: false,
    }),
    height: Flags.integer({
      description: 'Template height in pixels',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Thumbnail template ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /thumbnail/template/update',
    auth_scope: 'write' as const,
    output_shape: {
      type: 'key-value' as const,
    },
    side_effects: 'updates' as const,
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(ThumbnailUpdate)
    this.printWorkspaceHeader()

    const body: Record<string, unknown> = { thumbnail_template_id: Number(args.id) }

    if (flags.name !== undefined) body.name = flags.name
    if (flags['liquid-template'] !== undefined) body.liquid_template = flags['liquid-template']
    if (flags['object-type'] !== undefined) body.object_type = flags['object-type']
    if (flags.width !== undefined) body.width = flags.width
    if (flags.height !== undefined) body.height = flags.height

    const { data: updateData, error: updateError } = await this.apiClient.POST('/thumbnail/template/update', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (updateError) {
      this.error(applyCliTerms(formatApiError(updateError)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Thumbnail template ${args.id} updated`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: updateData,
        summary: `Thumbnail template ${args.id} updated`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'thumbnail', id: args.id },
        ],
      })
    }
  }
}
