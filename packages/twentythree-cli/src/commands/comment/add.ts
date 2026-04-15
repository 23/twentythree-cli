import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Comment add command — creates a comment on an object (CMT-02).
 *
 * D-2: Standalone comment topic with --object-id and --object-type flags.
 * object_type values pass through as-is (API native: photo, album, live) — no term mapping.
 */
export default class CommentAdd extends AuthenticatedCommand<typeof CommentAdd> {
  static description = 'Add a comment to an object'

  static examples = [
    '<%= config.bin %> comment add --object-id 123 --object-type photo --content "Great video!"',
    '<%= config.bin %> comment add --object-id 456 --object-type live --content "Question?" --comment-type question',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'object-id': Flags.string({
      description: 'Object ID to comment on',
      required: true,
    }),
    'object-type': Flags.string({
      // D-2: values pass through as-is (photo, album, live)
      description: 'Object type (photo, album, live)',
      required: true,
    }),
    content: Flags.string({
      description: 'Comment text content',
      required: false,
    }),
    name: Flags.string({
      description: 'Author name for the comment',
      required: false,
    }),
    email: Flags.string({
      description: 'Author email for the comment',
      required: false,
    }),
    url: Flags.string({
      description: 'URL associated with the comment',
      required: false,
    }),
    'comment-type': Flags.string({
      description: 'Comment type (comment, question, chat)',
      required: false,
    }),
    'reply-to': Flags.string({
      description: 'Comment ID to reply to',
      required: false,
    }),
    'comment-time': Flags.string({
      description: 'Timestamp for the comment',
      required: false,
    }),
    'object-token': Flags.string({
      description: 'Object token for the target object',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(CommentAdd)
    this.printWorkspaceHeader()

    // Build body with only defined flags (prevents clearing unset fields)
    const body: Record<string, unknown> = {
      object_id: Number(flags['object-id']),
      // D-2: object_type value passes through as-is, no term mapping
      object_type: flags['object-type'],
    }

    if (flags.content !== undefined) body.content = flags.content
    if (flags.name !== undefined) body.name = flags.name
    if (flags.email !== undefined) body.email = flags.email
    if (flags.url !== undefined) body.url = flags.url
    if (flags['comment-type'] !== undefined) body.comment_type = flags['comment-type']
    if (flags['reply-to'] !== undefined) body.reply_to_comment_id = Number(flags['reply-to'])
    if (flags['comment-time'] !== undefined) body.comment_time = flags['comment-time']
    if (flags['object-token'] !== undefined) body.object_token = flags['object-token']

    const { data, error } = await this.apiClient.POST('/comment/add', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    const commentId = resp?.comment_id ?? resp?.data?.comment_id

    this.log(chalk.green('Comment added'))
    if (commentId) {
      this.log(`Comment ID: ${commentId}`)
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Comment added',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'comment' },
        ],
      })
    }
  }
}
