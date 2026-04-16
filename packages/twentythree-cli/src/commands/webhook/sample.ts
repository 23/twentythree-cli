import { Args } from '@oclif/core'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Webhook sample command — prints a sample payload for an event type (WHK-05).
 *
 * Sample payloads are complex nested JSON, so we output raw JSON instead of
 * key-value rendering.
 *
 * Threat mitigations:
 *   T-08-05: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class WebhookSample extends AuthenticatedCommand<typeof WebhookSample> {
  static description = 'Get a sample payload for a webhook event type'

  static examples = [
    '<%= config.bin %> webhook sample video.uploaded',
    '<%= config.bin %> webhook sample video.uploaded --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    event: Args.string({ description: 'Event type to get sample for', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'GET /webhook/sample',
    auth_scope: 'read' as const,
    output_shape: {
      type: 'key-value' as const,
    },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(WebhookSample)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/webhook/sample', {
      params: {
        query: { event: args.event } as any,
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: resp?.data ?? resp,
        summary: `Sample payload for ${args.event}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webhook' },
        ],
      })
    }

    // Sample payloads are complex nested JSON — output raw JSON
    this.log(JSON.stringify((resp?.data ?? resp), null, 2))
  }
}
