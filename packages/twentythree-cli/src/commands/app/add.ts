import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * App add command — creates a new app integration (APP-01).
 *
 * Threat mitigations:
 *   T-08-05: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class AppAdd extends AuthenticatedCommand<typeof AppAdd> {
  static description = 'Create a new app integration'

  static examples = [
    '<%= config.bin %> app add --name "My App"',
    '<%= config.bin %> app add --name "My App" --description "A sample app"',
    '<%= config.bin %> app add --name "My App" --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    name: Flags.string({
      description: 'App name',
      required: true,
    }),
    description: Flags.string({
      description: 'App description',
      required: false,
    }),
    style: Flags.string({
      description: 'App style',
      required: false,
    }),
    type: Flags.string({
      description: 'App type',
      required: false,
    }),
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'POST /app/add',
    auth_scope: 'write' as const,
    output_shape: {
      type: 'key-value' as const,
    },
    side_effects: 'creates' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AppAdd)
    this.printWorkspaceHeader()

    const body: Record<string, unknown> = { name: flags.name }

    if (flags.description !== undefined) body.description = flags.description
    if (flags.style !== undefined) body.style = flags.style
    if (flags.type !== undefined) body.type = flags.type

    const { data: createData, error: createError } = await this.apiClient.POST('/app/add', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (createError) {
      this.error(applyCliTerms(formatApiError(createError)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const appId = (createData as any)?.data?.app_id

    this.log(chalk.green('App created'))
    this.log(`ID: ${appId}`)

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: createData,
        summary: 'App created',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'app', id: String(appId) },
        ],
      })
    }
  }
}
