import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, parseBoolParam, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * User create command — creates a new user in the workspace (USR-03).
 *
 * Maps to the POST /user/create API endpoint.
 */
export default class UserCreate extends AuthenticatedCommand<typeof UserCreate> {
  static description = 'Create a new user'

  static examples = [
    '<%= config.bin %> user create --email alice@example.com',
    '<%= config.bin %> user create --email alice@example.com --full-name "Alice Smith"',
    '<%= config.bin %> user create --email alice@example.com --site-admin',
    '<%= config.bin %> user create --email alice@example.com --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    email: Flags.string({
      description: 'Email address for the new user',
      required: true,
    }),
    username: Flags.string({
      description: 'Username for the new user',
      required: false,
    }),
    'full-name': Flags.string({
      description: 'Full display name for the new user',
      required: false,
    }),
    'site-admin': Flags.boolean({
      description: 'Grant site admin privileges',
      allowNo: true,
      required: false,
    }),
    'site-admin-p': Flags.string({ hidden: true, required: false }),
    'user-type': Flags.string({
      description: 'User type (e.g. standard, administrator)',
      required: false,
    }),
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'POST /user/create',
    auth_scope: 'admin',
    output_shape: { type: 'key-value' },
    side_effects: 'creates',
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(UserCreate)
    this.printWorkspaceHeader()

    const body: Record<string, unknown> = { email: flags.email }

    if (flags.username !== undefined) body.username = flags.username
    if (flags['full-name'] !== undefined) body.full_name = flags['full-name']
    if (flags['user-type'] !== undefined) body.user_type = flags['user-type']

    const siteAdminVal = parseBoolParam(flags['site-admin'], flags['site-admin-p'])
    if (siteAdminVal !== undefined) {
      body.site_admin_p = siteAdminVal ? 1 : 0
    }

    const { data, error } = await this.apiClient.POST('/user/create', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (data as any)?.data?.user_id

    this.log(chalk.green('User created'))
    this.log(`ID: ${userId}`)

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'User created',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'user', id: String(userId) },
        ],
      })
    }
  }
}
