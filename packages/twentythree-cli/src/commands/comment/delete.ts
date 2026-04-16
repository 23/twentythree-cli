import { Args } from '@oclif/core'
import chalk from 'chalk'
import { confirm, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Comment delete command — removes a comment after confirmation (CMT-04).
 *
 * Threat mitigation T-06-05: Requires interactive confirmation; skipped only in --json mode.
 */
export default class CommentDelete extends AuthenticatedCommand<typeof CommentDelete> {
  static description = 'Delete a comment'

  static agentMetadata = {
    api_endpoint: 'POST /comment/delete',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'destructive' as const,
  }

  static examples = [
    '<%= config.bin %> comment delete 789',
    '<%= config.bin %> comment delete 789 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Comment ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(CommentDelete)
    this.printWorkspaceHeader()

    if (!this.jsonEnabled()) {
      // T-06-05: Confirmation prompt includes workspace domain
      const confirmed = await confirm({
        message: `Delete comment ${args.id} from ${this.activeWorkspace.domain}? This cannot be undone.`,
      })

      if (isCancel(confirmed) || !confirmed) {
        process.exit(EXIT_CANCELLED)
      }
    }

    const { data, error } = await this.apiClient.POST('/comment/delete', {
      body: { comment_id: Number(args.id) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green('Comment deleted'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Comment ${args.id} deleted`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'comment', id: args.id },
        ],
      })
    }
  }
}
