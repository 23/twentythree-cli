import { Args } from '@oclif/core'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Spot check command — retrieves details of a single spot.
 *
 * Maps to the GET /spot/check API endpoint.
 * Outputs key-value pairs of the spot's properties.
 *
 * Threat mitigations:
 *   T-08-02: extends AuthenticatedCommand — anonymous mode rejected with AUTH-10 error
 */
export default class SpotCheck extends AuthenticatedCommand<typeof SpotCheck> {
  static description = 'Get details of a specific spot'

  static examples = [
    '<%= config.bin %> spot check 12345',
    '<%= config.bin %> spot check 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Spot ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'GET /spot/check',
    auth_scope: 'read' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(SpotCheck)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/spot/check', {
      params: { query: { spot_id: Number(args.id) } },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    const obj = resp?.data ?? resp

    if (!obj) {
      this.error('No data returned', { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: obj,
        summary: `Spot ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'spot', id: args.id },
        ],
      })
    }

    // Key-value output — iterate top-level keys
    for (const [k, v] of Object.entries(obj)) {
      this.log(`${k}: ${applyCliTerms(String(v ?? ''))}`)
    }
  }
}
