import { Args } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Email subscription remove command — removes a subscription after confirmation,
 * so the address no longer receives digests of new videos.
 *
 * Maps to POST /email-subscription/remove. The ID is the photo_subscription_id
 * returned by `email-subscription list`.
 *
 * --yes (or --json) skips the confirmation prompt. Without a TTY and without either
 * flag the command exits 2 and names the flag to pass, instead of hanging.
 */
export default class EmailSubscriptionRemove extends AuthenticatedCommand<typeof EmailSubscriptionRemove> {
  static description = 'Remove an email subscription from the active workspace'

  static examples = [
    '<%= config.bin %> email-subscription remove 91827364',
    '<%= config.bin %> email-subscription remove 91827364 --yes',
    '<%= config.bin %> email-subscription remove 91827364 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    ...AuthenticatedCommand.destructiveFlags,
  }

  static args = {
    id: Args.string({ description: 'Subscription ID (photo_subscription_id from email-subscription list)', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /email-subscription/remove',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'destructive' as const,
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(EmailSubscriptionRemove)
    this.printWorkspaceHeader()

    await this.confirmDestructive(
      `Remove email subscription ${args.id} from ${this.activeWorkspace.domain}? The subscriber will stop receiving digests.`,
    )

    const { data, error } = await this.apiClient.POST('/email-subscription/remove', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: { photo_subscription_id: Number(args.id) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Email subscription ${args.id} removed`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Email subscription ${args.id} removed`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'email-subscription', id: args.id },
        ],
      })
    }
  }
}
