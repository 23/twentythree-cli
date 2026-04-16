import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Comment reaction list command — lists reactions on comments for an object (CMT-08).
 *
 * D-3: 3-level oclif topic discovered by directory structure (comment/reaction/list.ts).
 * Class name follows Topic1+Topic2+Verb convention: CommentReactionList.
 *
 * Uses GET (not POST) per API spec.
 *
 * Threat mitigation T-06-06: --object-token is required; no auto-lookup to prevent token exposure.
 */
export default class CommentReactionList extends AuthenticatedCommand<typeof CommentReactionList> {
  static description = 'List reactions on comments for an object'

  static agentMetadata = {
    api_endpoint: 'GET /comment/reaction/list',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['Comment ID', 'Emoji', 'Count'] },
    side_effects: 'none' as const,
  }

  static examples = [
    '<%= config.bin %> comment reaction list --object-id 123 --object-token abc',
    '<%= config.bin %> comment reaction list --object-id 123 --object-token abc --object-type photo',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'object-id': Flags.string({
      description: 'Object ID to list reactions for',
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

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(CommentReactionList)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/comment/reaction/list', {
      params: {
        query: {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    const reactions: unknown[] = Array.isArray(resp?.data)
      ? resp.data
      : resp?.data
      ? [resp.data]
      : []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: reactions,
        summary: `${reactions.length} reaction${reactions.length === 1 ? '' : 's'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'comment' },
        ],
      })
    }

    if (reactions.length === 0) {
      this.log('No reactions found.')
      return
    }

    const headers = ['Comment ID', 'Emoji', 'Count']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = reactions.map((r: any) => [
      String(r.comment_id ?? ''),
      String(r.reaction_emoji ?? r.emoji ?? ''),
      String(r.count ?? r.reaction_count ?? ''),
    ])

    const table = renderTable(headers, rows)
    this.log(table.toString())
    this.log(chalk.dim(`${reactions.length} reaction${reactions.length === 1 ? '' : 's'}`))
  }
}
