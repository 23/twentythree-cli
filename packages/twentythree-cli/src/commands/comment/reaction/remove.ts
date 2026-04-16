import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Comment reaction remove command — removes a reaction from a comment (CMT-08).
 *
 * D-3: 3-level oclif topic discovered by directory structure (comment/reaction/remove.ts).
 * Class name follows Topic1+Topic2+Verb convention: CommentReactionRemove.
 *
 * Uses GET (not POST) per API spec — all reaction endpoints are GET queries.
 *
 * Threat mitigation T-06-06: --object-token is required; no auto-lookup to prevent token leakage.
 */
export default class CommentReactionRemove extends AuthenticatedCommand<typeof CommentReactionRemove> {
  static description = 'Remove a reaction from a comment'

  static agentMetadata = {
    api_endpoint: 'GET /comment/reaction/remove',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'destructive' as const,
  }

  static examples = [
    '<%= config.bin %> comment reaction remove 789 --object-id 123 --object-token abc --reaction "👍"',
    '<%= config.bin %> comment reaction remove 789 --object-id 123 --object-token abc --reaction "❤️" --object-type photo',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    reaction: Flags.string({
      description: 'Reaction emoji to remove',
      required: true,
    }),
    'object-id': Flags.string({
      description: 'Object ID the comment belongs to',
      required: true,
    }),
    'object-token': Flags.string({
      // T-06-06: Required flag; no auto-lookup to prevent token exposure
      description: 'Object token for the target object',
      required: true,
    }),
    'object-type': Flags.string({
      description: 'Object type (live, photo, album)',
      required: false,
    }),
    uuid: Flags.string({
      description: 'UUID identifier',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Comment ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(CommentReactionRemove)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/comment/reaction/remove', {
      params: {
        query: {
          comment_id: Number(args.id),
          reaction_emoji: flags.reaction,
          object_id: Number(flags['object-id']),
          object_token: flags['object-token'],
          object_type: flags['object-type'] as any,
          uuid: flags.uuid,
        },
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green('Reaction removed'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Reaction removed',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'comment', id: args.id },
        ],
      })
    }
  }
}
