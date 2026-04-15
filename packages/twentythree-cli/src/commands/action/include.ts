import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Action include command — adds an object to the scope of a CTA action.
 *
 * POSTs to /action/include with action_id + object_id.
 * Use --undo to reverse the inclusion (maps to remove_inclusion_p).
 */
export default class ActionInclude extends AuthenticatedCommand<typeof ActionInclude> {
  static description = 'Include an object in a CTA action scope (or undo an inclusion)'

  static examples = [
    '<%= config.bin %> action include 12345 --object-id 6789',
    '<%= config.bin %> action include 12345 --object-id 6789 --undo',
    '<%= config.bin %> action include 12345 --object-id 6789 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'object-id': Flags.string({
      description: 'Object ID to include the action on',
      required: true,
    }),
    undo: Flags.boolean({
      description: 'Remove the inclusion (reverse this operation)',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Action ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(ActionInclude)

    this.printWorkspaceHeader()

    const body: Record<string, unknown> = {
      action_id: Number(args.id),
      object_id: Number(flags['object-id']),
    }

    if (flags.undo) {
      body.remove_inclusion_p = 1
    }

    const { data, error } = await this.apiClient.POST('/action/include', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(flags.undo ? 'Inclusion removed' : 'Action included'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: flags.undo ? 'Inclusion removed' : 'Action included',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'action', id: args.id },
        ],
      })
    }
  }
}
