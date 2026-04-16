import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Webhook subscribe command — creates a webhook subscription (WHK-02).
 *
 * Threat mitigations:
 *   T-08-05: extends AuthenticatedCommand — anonymous mode rejected
 *   T-08-06: target_url passed as-is; server validates reachability
 */
export default class WebhookSubscribe extends AuthenticatedCommand<typeof WebhookSubscribe> {
  static description = 'Subscribe to a webhook event'

  static examples = [
    '<%= config.bin %> webhook subscribe --target-url https://example.com/hook --event video.uploaded',
    '<%= config.bin %> webhook subscribe --target-url https://example.com/hook --event video.uploaded --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'target-url': Flags.string({
      description: 'URL to receive webhook POST requests',
      required: true,
    }),
    event: Flags.string({
      description: 'Event type to subscribe to',
      required: true,
    }),
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'POST /webhook/subscribe',
    auth_scope: 'write' as const,
    output_shape: {
      type: 'key-value' as const,
    },
    side_effects: 'creates' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(WebhookSubscribe)
    this.printWorkspaceHeader()

    const { data: createData, error: createError } = await this.apiClient.POST('/webhook/subscribe', {
      body: { target_url: flags['target-url'], event: flags.event } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (createError) {
      this.error(applyCliTerms(formatApiError(createError)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const webhookId = (createData as any)?.data?.webhook_id

    this.log(chalk.green('Webhook subscription created'))
    this.log(`ID:         ${webhookId}`)
    this.log(`Event:      ${flags.event}`)
    this.log(`Target URL: ${flags['target-url']}`)

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: createData,
        summary: 'Webhook subscription created',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webhook', id: String(webhookId) },
        ],
      })
    }
  }
}
