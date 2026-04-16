import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Session redeem-token command — redeems a session token (SES-02).
 *
 * Pattern K: simple POST action with key-value output for result data.
 *
 * Threat mitigations:
 *   T-08-16: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class SessionRedeemToken extends AuthenticatedCommand<typeof SessionRedeemToken> {
  static description = 'Redeem a session token'

  static examples = [
    '<%= config.bin %> session redeem-token --session-token <token>',
    '<%= config.bin %> session redeem-token --session-token <token> --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'session-token': Flags.string({
      description: 'Session token to redeem',
      required: true,
    }),
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'POST /session/redeem-token',
    auth_scope: 'read' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'updates' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(SessionRedeemToken)

    this.printWorkspaceHeader()

    const { data: redeemData, error: redeemError } = await this.apiClient.POST('/session/redeem-token', {
      body: { session_token: flags['session-token'] } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (redeemError) {
      this.error(applyCliTerms(formatApiError(redeemError)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green('Session token redeemed'))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = redeemData as any
    const obj = resp?.data ?? resp

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: obj,
        summary: 'Session token redeemed',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'session' },
        ],
      })
    }

    // Key-value output for result data
    if (obj && typeof obj === 'object') {
      for (const [k, v] of Object.entries(obj)) {
        this.log(`${k}: ${applyCliTerms(String(v ?? ''))}`)
      }
    }
  }
}
