import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Spot create command — creates a new spot in the active workspace.
 *
 * Maps to the POST /spot/create API endpoint.
 * Spots are embed containers in TwentyThree.
 *
 * Threat mitigations:
 *   T-08-02: extends AuthenticatedCommand — anonymous mode rejected with AUTH-10 error
 */
export default class SpotCreate extends AuthenticatedCommand<typeof SpotCreate> {
  static description = 'Create a new spot'

  static examples = [
    '<%= config.bin %> spot create --spot-name "My Spot"',
    '<%= config.bin %> spot create --spot-name "My Spot" --spot-type "video"',
    '<%= config.bin %> spot create --spot-name "My Spot" --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'spot-name': Flags.string({
      description: 'Name for the new spot',
      required: true,
    }),
    'spot-type': Flags.string({
      description: 'Type of spot',
      required: false,
    }),
    'spot-design': Flags.string({
      description: 'Design for the spot',
      required: false,
    }),
    'spot-layout': Flags.string({
      description: 'Layout for the spot',
      required: false,
    }),
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'POST /spot/create',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'creates' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(SpotCreate)
    this.printWorkspaceHeader()

    const body: Record<string, unknown> = { spot_name: flags['spot-name'] }

    if (flags['spot-type'] !== undefined) body.spot_type = flags['spot-type']
    if (flags['spot-design'] !== undefined) body.spot_design = flags['spot-design']
    if (flags['spot-layout'] !== undefined) body.spot_layout = flags['spot-layout']

    const { data: createData, error: createError } = await this.apiClient.POST('/spot/create', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (createError) {
      this.error(applyCliTerms(formatApiError(createError)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spotId = (createData as any)?.data?.spot_id

    this.log(chalk.green('Spot created'))
    this.log(`ID: ${spotId}`)

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: createData,
        summary: 'Spot created',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'spot', id: String(spotId) },
        ],
      })
    }
  }
}
