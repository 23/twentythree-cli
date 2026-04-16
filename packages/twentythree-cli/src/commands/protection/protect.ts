import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Protection protect command — applies content protection (PRT-01).
 *
 * Pattern B variant: POST action with required protection method.
 *
 * Threat mitigations:
 *   T-08-16: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class ProtectionProtect extends AuthenticatedCommand<typeof ProtectionProtect> {
  static description = 'Apply protection to content'

  static examples = [
    '<%= config.bin %> protection protect --protection-method password',
    '<%= config.bin %> protection protect --protection-method sso --object-id 12345',
    '<%= config.bin %> protection protect --protection-method token --grace-minutes 30 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'protection-method': Flags.string({
      description: 'Protection method (e.g. password, sso, token)',
      required: true,
    }),
    'object-id': Flags.string({
      description: 'Object ID to protect',
      required: false,
    }),
    'grace-minutes': Flags.integer({
      description: 'Grace period in minutes before protection activates',
      required: false,
    }),
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'POST /protection/protect',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'creates' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(ProtectionProtect)

    this.printWorkspaceHeader()

    const body: Record<string, unknown> = {
      protection_method: flags['protection-method'],
    }
    if (flags['object-id'] !== undefined) body.object_id = flags['object-id']
    if (flags['grace-minutes'] !== undefined) body.grace_minutes = flags['grace-minutes']

    const { data: protectData, error: protectError } = await this.apiClient.POST('/protection/protect', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (protectError) {
      this.error(applyCliTerms(formatApiError(protectError)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green('Protection applied'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: protectData,
        summary: 'Protection applied',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'protection' },
        ],
      })
    }
  }
}
