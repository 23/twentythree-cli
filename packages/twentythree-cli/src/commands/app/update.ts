import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * App update command — updates an existing app integration (APP-02).
 *
 * Only includes flags the user explicitly provided (flag mode pattern — T-03-07 analogue).
 *
 * Threat mitigations:
 *   T-08-05: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class AppUpdate extends AuthenticatedCommand<typeof AppUpdate> {
  static description = 'Update an existing app integration'

  static examples = [
    '<%= config.bin %> app update 12345 --name "Updated Name"',
    '<%= config.bin %> app update 12345 --description "New description"',
    '<%= config.bin %> app update 12345 --name "Updated Name" --description "New description"',
    '<%= config.bin %> app update 12345 --name "Updated Name" --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    name: Flags.string({
      description: 'App name',
      required: false,
    }),
    description: Flags.string({
      description: 'App description',
      required: false,
    }),
    style: Flags.string({
      description: 'App style',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'App ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /app/update',
    auth_scope: 'write' as const,
    output_shape: {
      type: 'key-value' as const,
    },
    side_effects: 'updates' as const,
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(AppUpdate)
    this.printWorkspaceHeader()

    if (flags.name === undefined && flags.description === undefined && flags.style === undefined) {
      this.error('Provide at least one field to update (--name, --description, or --style)', { exit: EXIT_ERROR })
    }

    const body: Record<string, unknown> = { app_id: Number(args.id) }

    if (flags.name !== undefined) body.name = flags.name
    if (flags.description !== undefined) body.description = flags.description
    if (flags.style !== undefined) body.style = flags.style

    const { data: updateData, error: updateError } = await this.apiClient.POST('/app/update', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (updateError) {
      this.error(applyCliTerms(formatApiError(updateError)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`App ${args.id} updated`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: updateData,
        summary: `App ${args.id} updated`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'app', id: args.id },
        ],
      })
    }
  }
}
