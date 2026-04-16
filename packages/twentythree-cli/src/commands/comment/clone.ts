import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Comment clone command — duplicates an existing comment (CMT-06).
 *
 * Uses GET (not POST) per API spec.
 */
export default class CommentClone extends AuthenticatedCommand<typeof CommentClone> {
  static description = 'Clone an existing comment'

  static agentMetadata = {
    api_endpoint: 'GET /comment/clone',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'creates' as const,
  }

  static examples = [
    '<%= config.bin %> comment clone 789',
    '<%= config.bin %> comment clone 789 --clone-type question',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'clone-type': Flags.string({
      description: 'Type for the cloned comment (chat, question, comment)',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Comment ID to clone', required: false }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(CommentClone)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/comment/clone', {
      params: {
        query: {
          comment_id: args.id ? Number(args.id) : undefined,
          clone_comment_type: flags['clone-type'] as any,
        },
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    const newCommentId = resp?.comment_id ?? resp?.data?.comment_id

    this.log(chalk.green('Comment cloned'))
    if (newCommentId) {
      this.log(`New comment ID: ${newCommentId}`)
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Comment cloned',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'comment', id: args.id },
        ],
      })
    }
  }
}
