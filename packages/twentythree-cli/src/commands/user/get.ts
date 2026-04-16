import { Args, Flags } from '@oclif/core'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, parseBoolParam, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * User get command — retrieves details of a single user by ID (USR-02).
 *
 * Maps to the GET /user/get API endpoint.
 */
export default class UserGet extends AuthenticatedCommand<typeof UserGet> {
  static description = 'Get details of a specific user'

  static examples = [
    '<%= config.bin %> user get 12345',
    '<%= config.bin %> user get 12345 --include-invitation',
    '<%= config.bin %> user get 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'include-invitation': Flags.boolean({
      description: 'Include invitation details in the response',
      allowNo: true,
      required: false,
    }),
    'include-invitation-p': Flags.string({ hidden: true, required: false }),
  }

  static args = {
    id: Args.string({ description: 'User ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'GET /user/get',
    auth_scope: 'admin',
    output_shape: { type: 'key-value' },
    side_effects: 'none',
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(UserGet)
    this.printWorkspaceHeader()

    const inclVal = parseBoolParam(flags['include-invitation'], flags['include-invitation-p'])

    const { data, error } = await this.apiClient.GET('/user/get', {
      params: {
        query: {
          user_id: Number(args.id),
          include_invitation_p: inclVal !== undefined ? (inclVal ? 1 : 0) : undefined,
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
        summary: obj?.username ?? obj?.display_name ?? `User ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'user', id: args.id },
        ],
      })
    }

    if (!obj || Object.keys(obj).length === 0) {
      this.error(`User ${args.id} not found`, { exit: EXIT_ERROR })
    }

    for (const [k, v] of Object.entries(obj)) {
      this.log(`${k}: ${String(v)}`)
    }
  }
}
