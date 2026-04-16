import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Comment set-order command — reorders comments on an object (CMT-07).
 *
 * The --order flag takes a comma-separated list of comment IDs in the desired display order.
 */
export default class CommentSetOrder extends AuthenticatedCommand<typeof CommentSetOrder> {
  static description = 'Set display order of comments on an object'

  static agentMetadata = {
    api_endpoint: 'POST /comment/set-order',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'updates' as const,
  }

  static examples = [
    '<%= config.bin %> comment set-order --object-id 123 --order "789,456,123"',
    '<%= config.bin %> comment set-order --object-id 123 --order "789,456" --comment-type question',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'object-id': Flags.string({
      description: 'Object ID whose comments are being reordered',
      required: true,
    }),
    order: Flags.string({
      description: 'Comma-separated list of comment IDs in desired display order',
      required: true,
    }),
    'comment-type': Flags.string({
      description: 'Comment type to reorder (default: question)',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(CommentSetOrder)
    this.printWorkspaceHeader()

    const body: Record<string, unknown> = {
      object_id: Number(flags['object-id']),
      order: flags.order,
      comment_type: flags['comment-type'] ?? 'question',
    }

    const { data, error } = await this.apiClient.POST('/comment/set-order', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green('Comment order updated'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Comment order updated',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'comment' },
        ],
      })
    }
  }
}
