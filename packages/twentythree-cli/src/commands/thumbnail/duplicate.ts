import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Thumbnail template duplicate command — duplicates an existing thumbnail template.
 *
 * Maps to POST /thumbnail/template/duplicate.
 * If name is omitted, the API names the copy with a ' (Copy)' suffix.
 *
 * Threat mitigations:
 *   T-08-09: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class ThumbnailDuplicate extends AuthenticatedCommand<typeof ThumbnailDuplicate> {
  static description = 'Duplicate a thumbnail template'

  static examples = [
    '<%= config.bin %> thumbnail duplicate 42',
    '<%= config.bin %> thumbnail duplicate 42 --name "My Copy"',
    '<%= config.bin %> thumbnail duplicate 42 --name "My Copy" --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    name: Flags.string({
      description: 'Name for the duplicate',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Thumbnail template ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /thumbnail/template/duplicate',
    auth_scope: 'write' as const,
    output_shape: {
      type: 'key-value' as const,
    },
    side_effects: 'creates' as const,
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(ThumbnailDuplicate)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.POST('/thumbnail/template/duplicate', {
      body: {
        thumbnail_template_id: Number(args.id),
        name: flags.name,
      } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green('Thumbnail template duplicated'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Thumbnail template ${args.id} duplicated`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'thumbnail', id: args.id },
        ],
      })
    }
  }
}
