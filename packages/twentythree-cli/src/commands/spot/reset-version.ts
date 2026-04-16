import { Args } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Spot reset-version command — resets the version of a spot.
 *
 * Maps to the POST /spot/reset-version API endpoint.
 *
 * Threat mitigations:
 *   T-08-02: extends AuthenticatedCommand — anonymous mode rejected with AUTH-10 error
 */
export default class SpotResetVersion extends AuthenticatedCommand<typeof SpotResetVersion> {
  static description = 'Reset the version of a spot'

  static examples = [
    '<%= config.bin %> spot reset-version 12345',
    '<%= config.bin %> spot reset-version 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Spot ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /spot/reset-version',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'updates' as const,
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(SpotResetVersion)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.POST('/spot/reset-version', {
      body: { spot_id: Number(args.id) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Spot ${args.id} version reset`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Spot ${args.id} version reset`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'spot', id: args.id },
        ],
      })
    }
  }
}
