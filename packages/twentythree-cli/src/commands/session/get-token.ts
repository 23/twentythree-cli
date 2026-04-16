import { Flags } from '@oclif/core'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Session get-token command — obtains a session access token (SES-01).
 *
 * Pattern E: GET single object returning a sensitive token.
 *
 * SECURITY (T-08-15): Token is printed to stdout for CLI use, but the --json summary
 * string NEVER contains the actual token value to prevent token leakage in logs.
 * The data payload carries the token for programmatic access.
 *
 * Note: /session/get-token requires super scope per OpenAPI spec.
 *
 * Threat mitigations:
 *   T-08-15: summary string does not contain the token value
 *   T-08-16: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class SessionGetToken extends AuthenticatedCommand<typeof SessionGetToken> {
  static description = 'Get a session access token'

  static examples = [
    '<%= config.bin %> session get-token',
    '<%= config.bin %> session get-token --return-url https://example.com',
    '<%= config.bin %> session get-token --email user@example.com --full-name "Jane Doe"',
    '<%= config.bin %> session get-token --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'return-url': Flags.string({
      description: 'Return URL after session authentication',
      required: false,
    }),
    email: Flags.string({
      description: 'Email for the session token',
      required: false,
    }),
    'full-name': Flags.string({
      description: 'Full name for the session token',
      required: false,
    }),
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'GET /session/get-token',
    auth_scope: 'read' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(SessionGetToken)

    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/session/get-token', {
      params: {
        query: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return_url: flags['return-url'] as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          email: flags.email as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          full_name: flags['full-name'] as any,
        },
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    const tokenData = resp?.data ?? resp

    // Extract the token from the response (may be in access_token or token field)
    const token = (resp?.data ?? resp)?.access_token ?? (resp?.data ?? resp)?.token

    if (this.jsonEnabled()) {
      // T-08-15: summary string NEVER contains the actual token value
      return formatJsonOutput({
        ok: true,
        data: tokenData,
        summary: 'Session token generated',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'session' },
        ],
      })
    }

    // Print the token clearly to stdout for CLI use
    this.log(`Session token: ${token ?? '(no token in response)'}`)
  }
}
