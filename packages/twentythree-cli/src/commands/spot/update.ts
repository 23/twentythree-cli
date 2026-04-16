import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, parseBoolParam, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Spot update command — updates metadata for an existing spot.
 *
 * Maps to the POST /spot/update API endpoint.
 * Flag mode only: only flags explicitly provided are sent to the API.
 *
 * Threat mitigations:
 *   T-08-02: extends AuthenticatedCommand — anonymous mode rejected with AUTH-10 error
 */
export default class SpotUpdate extends AuthenticatedCommand<typeof SpotUpdate> {
  static description = 'Update a spot'

  static examples = [
    '<%= config.bin %> spot update 12345 --spot-name "New Name"',
    '<%= config.bin %> spot update 12345 --active',
    '<%= config.bin %> spot update 12345 --no-active',
    '<%= config.bin %> spot update 12345 --spot-name "New Name" --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'spot-name': Flags.string({
      description: 'New name for the spot',
      required: false,
    }),
    active: Flags.boolean({
      description: 'Set active status',
      allowNo: true,
      required: false,
    }),
    'active-p': Flags.string({ hidden: true, required: false }),
  }

  static args = {
    id: Args.string({ description: 'Spot ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /spot/update',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'updates' as const,
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(SpotUpdate)
    this.printWorkspaceHeader()

    const body: Record<string, unknown> = { spot_id: Number(args.id) }

    if (flags['spot-name'] !== undefined) body.spot_name = flags['spot-name']

    const activeVal = parseBoolParam(flags.active, flags['active-p'])
    if (activeVal !== undefined) body.active_p = activeVal ? 1 : 0

    const { data: updateData, error: updateError } = await this.apiClient.POST('/spot/update', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (updateError) {
      this.error(applyCliTerms(formatApiError(updateError)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Spot ${args.id} updated`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: updateData,
        summary: `Spot ${args.id} updated`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'spot', id: args.id },
        ],
      })
    }
  }
}
