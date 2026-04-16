import { Flags } from '@oclif/core'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * User redeem-login-token command — redeems a login token (USR-07).
 *
 * Maps to the GET /user/redeem-login-token API endpoint.
 */
export default class UserRedeemLoginToken extends AuthenticatedCommand<typeof UserRedeemLoginToken> {
  static description = 'Redeem a login token to authenticate a user'

  static examples = [
    '<%= config.bin %> user redeem-login-token --login-token abc123',
    '<%= config.bin %> user redeem-login-token --login-token abc123 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'login-token': Flags.string({
      description: 'Login token to redeem',
      required: true,
    }),
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'GET /user/redeem-login-token',
    auth_scope: 'read',
    output_shape: { type: 'key-value' },
    side_effects: 'none',
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(UserRedeemLoginToken)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/user/redeem-login-token', {
      params: {
        query: {
          login_token: flags['login-token'],
        },
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj: any = resp?.data ?? resp

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: obj,
        summary: 'Login token redeemed',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'user' },
          { resource: 'redeem-login-token' },
        ],
      })
    }

    if (!obj || Object.keys(obj).length === 0) {
      this.log('No data returned.')
      return
    }

    for (const [k, v] of Object.entries(obj)) {
      this.log(`${k}: ${String(v)}`)
    }
  }
}
