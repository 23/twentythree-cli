import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { fetchAllPages } from '../../lib/pagination.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Comment list command — lists comments with optional object filtering (CMT-01).
 *
 * D-2: Standalone comment topic; --object-id and --object-type flags (values as-is, no term mapping).
 * Uses fetchAllPages with p/size pagination.
 */
export default class CommentList extends AuthenticatedCommand<typeof CommentList> {
  static description = 'List comments in the active workspace'

  static agentMetadata = {
    api_endpoint: 'GET /comment/list',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['ID', 'Author', 'Content', 'Type', 'Date'] },
    side_effects: 'none' as const,
  }

  static examples = [
    '<%= config.bin %> comment list',
    '<%= config.bin %> comment list --object-id 123 --object-type photo',
    '<%= config.bin %> comment list --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'object-id': Flags.string({
      description: 'Filter by object ID',
      required: false,
    }),
    'object-type': Flags.string({
      description: 'Filter by object type (photo, album)',
      required: false,
    }),
    'comment-type': Flags.string({
      description: 'Filter by comment type (comment, question, chat)',
      required: false,
    }),
    search: Flags.string({
      description: 'Search comments by content',
      required: false,
    }),
    order: Flags.string({
      description: 'Sort order for results',
      options: ['asc', 'desc'],
      required: false,
    }),
    'comment-id': Flags.integer({
      description: 'Limit to a specific comment by its ID',
      required: false,
    }),
    'comment-user-id': Flags.integer({
      description: 'List comments by a specific user',
      required: false,
    }),
    'prioritize-promoted': Flags.boolean({
      description: 'Sort promoted comments before non-promoted ones',
      required: false,
    }),
    'include-reactions': Flags.boolean({
      description: 'Include emoji reaction counts for each comment',
      required: false,
    }),
    'include-replies': Flags.boolean({
      description: 'Include details about the parent comment for reply comments',
      required: false,
    }),
    promoted: Flags.boolean({
      description: 'Filter to promoted comments only',
      required: false,
    }),
    fields: Flags.string({
      description: 'Comma-separated list of fields to return in the API response',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(CommentList)
    this.printWorkspaceHeader()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const comments = await fetchAllPages<any>(async (page, size) => {
      const { data, error } = await this.apiClient.GET('/comment/list', {
        params: {
          query: {
            p: page,
            size,
            object_id: flags['object-id'] ? Number(flags['object-id']) : undefined,
            // D-2: object_type values pass through as-is (no term mapping)
            object_type: flags['object-type'] as any,
            comment_type: flags['comment-type'] as any,
            search: flags.search,
            order: flags.order as any,
            comment_id: flags['comment-id'],
            comment_user_id: flags['comment-user-id'],
            prioritize_promoted_p: flags['prioritize-promoted'] ? true : undefined,
            include_reactions_p: flags['include-reactions'] ? (1 as any) : undefined,
            include_reply_to_comments_p: flags['include-replies'] ? (1 as any) : undefined,
            promoted_p: flags.promoted ? (1 as any) : undefined,
            fields: flags.fields,
          },
        },
      })
      if (error) {
        this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resp = data as any
      const items: unknown[] = Array.isArray(resp?.data)
        ? resp.data
        : resp?.data
        ? [resp.data]
        : []
      return { data: items, total_count: resp?.total_count }
    })

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: comments,
        summary: `${comments.length} comment${comments.length === 1 ? '' : 's'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'comment' },
        ],
      })
    }

    if (comments.length === 0) {
      this.log('No comments found.')
      return
    }

    const headers = ['ID', 'Author', 'Content', 'Type', 'Date']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = comments.map((c: any) => [
      String(c.comment_id ?? ''),
      String(c.name ?? c.email ?? ''),
      applyCliTerms(String(c.content ?? '')).slice(0, 60),
      String(c.comment_type ?? ''),
      String(c.creation_date_ansi ?? c.date ?? ''),
    ])

    const table = renderTable(headers, rows)
    this.log(table.toString())
    this.log(chalk.dim(`${comments.length} comment${comments.length === 1 ? '' : 's'}`))
  }
}
