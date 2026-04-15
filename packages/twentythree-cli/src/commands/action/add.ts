import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Action add command — creates a new CTA (Call-To-Action) on a video or webinar.
 *
 * POSTs to /action/add with type + object_id required.
 *
 * Threat mitigations:
 *   T-06-03: No destructive action — creation only
 */
export default class ActionAdd extends AuthenticatedCommand<typeof ActionAdd> {
  static description = 'Create a new CTA action on a video or webinar'

  static examples = [
    '<%= config.bin %> action add --type overlay --object-id 12345',
    '<%= config.bin %> action add --type overlay --object-id 12345 --fields "title=Buy Now"',
    '<%= config.bin %> action add --type overlay --object-id 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    type: Flags.string({
      description: 'Action type (use `action types` to list available types)',
      required: true,
    }),
    'object-id': Flags.string({
      description: 'Object ID (video or webinar) to attach the action to',
      required: true,
    }),
    fields: Flags.string({
      description: 'Additional fields for the action (key=value pairs)',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(ActionAdd)

    this.printWorkspaceHeader()

    const body: Record<string, unknown> = {
      type: flags.type,
      object_id: Number(flags['object-id']),
    }

    if (flags.fields !== undefined) {
      body.fields = flags.fields
    }

    const { data, error } = await this.apiClient.POST('/action/add', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actionId = (data as any)?.data?.action_id ?? (data as any)?.action_id

    this.log(chalk.green('Action created'))
    if (actionId) {
      this.log(`ID: ${actionId}`)
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Action created',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'action', id: actionId ? String(actionId) : undefined },
        ],
      })
    }
  }
}
