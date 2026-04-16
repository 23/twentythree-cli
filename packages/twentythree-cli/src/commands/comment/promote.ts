import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Comment promote command — toggles or sets promoted status on a comment (CMT-05).
 *
 * If --promoted / --no-promoted is provided, the value is sent explicitly.
 * If the flag is omitted entirely, promoted_p is not sent — the API will toggle the current state.
 */
export default class CommentPromote extends AuthenticatedCommand<typeof CommentPromote> {
  static description = 'Promote or toggle promoted status of a comment'

  static agentMetadata = {
    api_endpoint: 'POST /comment/promote',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'updates' as const,
  }

  static examples = [
    '<%= config.bin %> comment promote 789',
    '<%= config.bin %> comment promote 789 --promoted',
    '<%= config.bin %> comment promote 789 --no-promoted',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    promoted: Flags.boolean({
      description: 'Set promoted status (omit to toggle)',
      allowNo: true,
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Comment ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(CommentPromote)
    this.printWorkspaceHeader()

    const body: Record<string, unknown> = {
      comment_id: Number(args.id),
    }

    // Only include promoted_p if the flag was explicitly provided
    if (flags.promoted !== undefined) {
      body.promoted_p = flags.promoted ? 1 : 0
    }

    const { data, error } = await this.apiClient.POST('/comment/promote', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    const message = flags.promoted !== undefined
      ? chalk.green('Comment promoted')
      : chalk.green('Comment promotion toggled')
    this.log(message)

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: flags.promoted !== undefined ? 'Comment promoted' : 'Comment promotion toggled',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'comment', id: args.id },
        ],
      })
    }
  }
}
