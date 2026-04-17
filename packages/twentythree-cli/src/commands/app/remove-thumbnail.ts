import { Args } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * App remove-thumbnail command — removes the custom thumbnail for an app, reverting to default.
 *
 * Threat mitigations:
 *   T-08-05: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class AppRemoveThumbnail extends AuthenticatedCommand<typeof AppRemoveThumbnail> {
  static description = 'Remove the custom thumbnail for an app, reverting to the default'

  static examples = [
    '<%= config.bin %> app remove-thumbnail 42',
    '<%= config.bin %> app remove-thumbnail 42 --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /app/remove-thumbnail',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'updates' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'App ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(AppRemoveThumbnail)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.POST('/app/remove-thumbnail', {
      body: { app_id: Number(args.id) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Thumbnail removed for app ${args.id}`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Thumbnail removed for app ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'app', id: args.id },
        ],
      })
    }
  }
}
