import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { confirm, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Webhook unsubscribe command — removes a webhook subscription after confirmation (WHK-03).
 *
 * Accepts either --webhook-id or --target-url (API accepts either for identification).
 *
 * Threat mitigations:
 *   T-08-04: confirm() prompt includes workspace domain before destructive POST (repudiation)
 *   T-08-05: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class WebhookUnsubscribe extends AuthenticatedCommand<typeof WebhookUnsubscribe> {
  static description = 'Unsubscribe from a webhook event'

  static examples = [
    '<%= config.bin %> webhook unsubscribe --webhook-id 12345',
    '<%= config.bin %> webhook unsubscribe --target-url https://example.com/hook',
    '<%= config.bin %> webhook unsubscribe --webhook-id 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'webhook-id': Flags.string({
      description: 'Webhook subscription ID',
      required: false,
    }),
    'target-url': Flags.string({
      description: 'Target URL to unsubscribe',
      required: false,
    }),
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'POST /webhook/unsubscribe',
    auth_scope: 'write' as const,
    output_shape: {
      type: 'key-value' as const,
    },
    side_effects: 'destructive' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(WebhookUnsubscribe)
    this.printWorkspaceHeader()

    if (!flags['webhook-id'] && !flags['target-url']) {
      this.error('Provide --webhook-id or --target-url', { exit: EXIT_ERROR })
    }

    if (!this.jsonEnabled()) {
      // T-08-04: Confirmation prompt includes workspace domain so user knows which workspace
      const confirmed = await confirm({
        message: `Unsubscribe webhook from ${this.activeWorkspace.domain}? This cannot be undone.`,
      })

      if (isCancel(confirmed) || !confirmed) {
        process.exit(EXIT_CANCELLED)
      }
    }

    const { data: deleteData, error: deleteError } = await this.apiClient.POST('/webhook/unsubscribe', {
      body: {
        webhook_id: flags['webhook-id'] ? Number(flags['webhook-id']) : undefined,
        target_url: flags['target-url'],
      } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (deleteError) {
      this.error(applyCliTerms(formatApiError(deleteError)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green('Webhook unsubscribed'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: deleteData,
        summary: 'Webhook unsubscribed',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webhook' },
        ],
      })
    }
  }
}
