import { Flags } from '@oclif/core'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, EXIT_ERROR } from '../../lib/output.js'

/**
 * User tokens command — retrieves cross-site tokens for the authenticated user (USR-08).
 *
 * USR-08: /user/tokens is not in the OpenAPI swagger spec but is referenced in AUTH-02.
 * Implemented as best-effort GET with any-typed response.
 *
 * Uses raw fetch instead of apiClient since the endpoint is not in the type system.
 *
 * SECURITY (T-08-13): Tokens printed to stdout intentionally — this is the command's
 * purpose; user controls their terminal.
 */
export default class UserTokens extends AuthenticatedCommand<typeof UserTokens> {
  static description = 'Retrieve cross-site tokens for the authenticated user'

  static examples = [
    '<%= config.bin %> user tokens',
    '<%= config.bin %> user tokens --no-cross-sites',
    '<%= config.bin %> user tokens --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'cross-sites': Flags.boolean({
      description: 'Include cross-site tokens',
      default: true,
      allowNo: true,
      required: false,
    }),
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'GET /user/tokens',
    auth_scope: 'read',
    output_shape: { type: 'table', columns: ['Domain', 'Token'] },
    side_effects: 'none',
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(UserTokens)
    this.printWorkspaceHeader()

    // USR-08: /user/tokens is not in the OpenAPI swagger spec but is referenced in AUTH-02.
    // Implemented as best-effort GET with any-typed response.
    const url = new URL('user/tokens', this.apiBaseUrl)
    if (flags['cross-sites']) url.searchParams.set('cross_sites_p', '1')

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${this.activeWorkspace.bearer_token}` },
    })

    if (!response.ok) {
      this.error(`API returned ${response.status}: ${response.statusText}`, { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json = await response.json() as any

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: json,
        summary: 'User tokens retrieved',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'user' },
          { resource: 'tokens' },
        ],
      })
    }

    // Try table if json.data is an array (domain + token columns), key-value otherwise
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = Array.isArray(json?.data) ? json.data : json?.data ? [json.data] : []

    if (rows.length > 0 && (rows[0].domain !== undefined || rows[0].token !== undefined)) {
      const headers = ['Domain', 'Token']
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tableRows = rows.map((r: any) => [
        String(r.domain ?? r.site ?? ''),
        String(r.token ?? ''),
      ])
      const table = renderTable(headers, tableRows)
      this.log(table.toString())
    } else if (rows.length > 0) {
      // Fallback: key-value for each entry
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const item of rows) {
        for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
          this.log(`${k}: ${String(v)}`)
        }
        this.log('---')
      }
    } else if (json && typeof json === 'object') {
      // Non-array response: key-value
      for (const [k, v] of Object.entries(json as Record<string, unknown>)) {
        this.log(`${k}: ${String(v)}`)
      }
    } else {
      this.log('No tokens found.')
    }
  }
}
