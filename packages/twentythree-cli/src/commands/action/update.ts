import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Action update command — modifies name, timing, and data fields of an existing action.
 *
 * POSTs to /action/update with action_id + name + start_time + end_time required.
 * Only flags explicitly provided are sent to the API.
 */
export default class ActionUpdate extends AuthenticatedCommand<typeof ActionUpdate> {
  static description = 'Update an existing CTA action'

  static examples = [
    '<%= config.bin %> action update 12345 --name "Buy Now" --start-time 10 --end-time 20',
    '<%= config.bin %> action update 12345 --name "Buy Now" --start-time 10 --end-time 20 --return-url "https://example.com"',
    '<%= config.bin %> action update 12345 --name "Buy Now" --start-time 10 --end-time 20 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    name: Flags.string({
      description: 'Display name for the action',
      required: true,
    }),
    'start-time': Flags.string({
      description: 'Start time of the action (seconds)',
      required: true,
    }),
    'end-time': Flags.string({
      description: 'End time of the action (seconds)',
      required: true,
    }),
    'time-relative-to': Flags.string({
      description: 'What the timing is relative to (default: duration)',
      required: false,
      default: 'duration',
    }),
    'return-url': Flags.string({
      description: 'Return URL for the action',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Action ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(ActionUpdate)

    this.printWorkspaceHeader()

    const body: Record<string, unknown> = {
      action_id: Number(args.id),
      name: flags.name,
      start_time: flags['start-time'],
      end_time: flags['end-time'],
    }

    if (flags['time-relative-to'] !== undefined) {
      body.time_relative_to = flags['time-relative-to']
    }

    if (flags['return-url'] !== undefined) {
      body.return_url = flags['return-url']
    }

    const { data, error } = await this.apiClient.POST('/action/update', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green('Action updated'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Action ${args.id} updated`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'action', id: args.id },
        ],
      })
    }
  }
}
