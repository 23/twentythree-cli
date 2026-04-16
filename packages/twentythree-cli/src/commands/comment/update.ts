import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Comment update command — modifies a comment's status (CMT-03).
 */
export default class CommentUpdate extends AuthenticatedCommand<typeof CommentUpdate> {
  static description = "Update a comment's status"

  static agentMetadata = {
    api_endpoint: 'POST /comment/update',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'updates' as const,
  }

  static examples = [
    '<%= config.bin %> comment update 789 --object-id 123 --status answered',
    '<%= config.bin %> comment update 789 --object-id 123 --status dismissed',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'object-id': Flags.string({
      description: 'Object ID the comment belongs to',
      required: true,
    }),
    status: Flags.string({
      description: 'Comment status (answered, dismissed, or empty to clear)',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Comment ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(CommentUpdate)
    this.printWorkspaceHeader()

    const body: Record<string, unknown> = {
      object_id: Number(flags['object-id']),
      comment_id: Number(args.id),
    }

    if (flags.status !== undefined) body.comment_status = flags.status

    const { data, error } = await this.apiClient.POST('/comment/update', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green('Comment updated'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Comment ${args.id} updated`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'comment', id: args.id },
        ],
      })
    }
  }
}
