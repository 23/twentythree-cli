import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Audience field remove command — remove a custom audience field (AUD-12).
 *
 * DESTRUCTIVE: Permanently deletes a field and all associated data.
 * Requires confirmation prompt before executing (T-07-09 mitigation).
 * JSON mode skips confirmation (automation use case).
 *
 * POST form mutation. key is required per spec.
 * 3-level oclif topic via directory structure (audience/field/remove.ts).
 */
export default class AudienceFieldRemove extends AuthenticatedCommand<typeof AudienceFieldRemove> {
  static description = 'Remove a custom audience field'

  static agentMetadata = {
    api_endpoint: 'POST /audience/field/remove',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'destructive' as const,
  }

  static examples = [
    '<%= config.bin %> audience field remove --key "department"',
    '<%= config.bin %> audience field remove --key "old-field" --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    ...AuthenticatedCommand.destructiveFlags,
    key: Flags.string({
      description: 'Field key to remove',
      required: true,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AudienceFieldRemove)
    this.printWorkspaceHeader()

    // T-07-09 mitigation: Confirmation required before destructive field deletion.
    // --yes / --json skip the prompt (automation use case).
    await this.confirmDestructive(
      `Permanently remove field "${flags.key}" and all associated data from ${this.activeWorkspace.domain}? This cannot be undone.`,
    )

    const { data, error } = await this.apiClient.POST('/audience/field/remove', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: { key: flags.key } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green('Field removed'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Field removed',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'audience' },
        ],
      })
    }
  }
}
