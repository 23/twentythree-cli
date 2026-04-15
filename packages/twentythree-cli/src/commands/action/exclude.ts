import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Action exclude command — blocks a CTA action from appearing on a specific object.
 *
 * POSTs to /action/exclude with action_id + object_id.
 * Use --undo to reverse the exclusion (maps to remove_exclusion_p).
 */
export default class ActionExclude extends AuthenticatedCommand<typeof ActionExclude> {
  static description = 'Exclude a CTA action from an object (or undo an exclusion)'

  static examples = [
    '<%= config.bin %> action exclude 12345 --object-id 6789',
    '<%= config.bin %> action exclude 12345 --object-id 6789 --undo',
    '<%= config.bin %> action exclude 12345 --object-id 6789 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'object-id': Flags.string({
      description: 'Object ID to exclude the action from',
      required: true,
    }),
    undo: Flags.boolean({
      description: 'Remove the exclusion (reverse this operation)',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Action ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(ActionExclude)

    this.printWorkspaceHeader()

    const body: Record<string, unknown> = {
      action_id: Number(args.id),
      object_id: Number(flags['object-id']),
    }

    if (flags.undo) {
      body.remove_exclusion_p = 1
    }

    const { data, error } = await this.apiClient.POST('/action/exclude', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(flags.undo ? 'Exclusion removed' : 'Action excluded'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: flags.undo ? 'Exclusion removed' : 'Action excluded',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'action', id: args.id },
        ],
      })
    }
  }
}
