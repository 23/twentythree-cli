import { Args, Flags } from '@oclif/core'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * User get-login-token command — generates a login token for a user (USR-06).
 *
 * Maps to the GET /user/get-login-token API endpoint.
 *
 * SECURITY (T-08-10): The actual token value is NOT included in the --json summary string.
 * The token is present in the data field for programmatic access only.
 * The summary string is safe for logs and CI output.
 */
export default class UserGetLoginToken extends AuthenticatedCommand<typeof UserGetLoginToken> {
  static description = 'Generate a login token for a user'

  static examples = [
    '<%= config.bin %> user get-login-token 12345',
    '<%= config.bin %> user get-login-token 12345 --return-url https://example.com/dashboard',
    '<%= config.bin %> user get-login-token 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'return-url': Flags.string({
      description: 'URL to redirect to after login',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'User ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'GET /user/get-login-token',
    auth_scope: 'admin',
    output_shape: { type: 'key-value' },
    side_effects: 'none',
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(UserGetLoginToken)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/user/get-login-token', {
      params: {
        query: {
          user_id: Number(args.id),
          return_url: flags['return-url'],
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
    const token: string = obj?.login_token ?? obj?.token ?? ''

    if (this.jsonEnabled()) {
      // SECURITY (T-08-10): summary must NOT contain the actual token value
      // Token is accessible in the data field for programmatic use only
      return formatJsonOutput({
        ok: true,
        data: obj,
        summary: `Login token generated for user ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'user', id: args.id },
          { resource: 'login-token' },
        ],
      })
    }

    // Non-JSON: print token clearly to stdout
    this.log(`Login token: ${token}`)

    if (obj && typeof obj === 'object') {
      for (const [k, v] of Object.entries(obj)) {
        if (k !== 'login_token' && k !== 'token') {
          this.log(`${k}: ${String(v)}`)
        }
      }
    }
  }
}
