import { Args } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Tag related command — returns related tags for a given tag in the active workspace.
 */
export default class TagRelated extends AuthenticatedCommand<typeof TagRelated> {
  static description = 'List tags related to a given tag'

  static agentMetadata = {
    api_endpoint: 'GET /tag/related',
    auth_scope: 'anonymous' as const,
    output_shape: { type: 'table' as const, columns: ['Tag'] },
    side_effects: 'none' as const,
  }

  static examples = [
    '<%= config.bin %> tag related marketing',
    '<%= config.bin %> tag related marketing --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    tag: Args.string({
      description: 'Tag to find related tags for',
      required: true,
    }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(TagRelated)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/tag/related', {
      params: {
        query: {
          tag: args.tag,
        },
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    const tags: unknown[] = Array.isArray(resp?.data)
      ? resp.data
      : resp?.data
      ? [resp.data]
      : []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: tags,
        summary: `${tags.length} related tag${tags.length === 1 ? '' : 's'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'tag' },
          { id: args.tag },
        ],
      })
    }

    if (tags.length === 0) {
      this.log('No related tags found.')
      return
    }

    const headers = ['Tag']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = tags.map((t: any) => [String(t.tag ?? '')])

    const table = renderTable(headers, rows)
    this.log(table.toString())
    this.log(chalk.dim(`${tags.length} related tag${tags.length === 1 ? '' : 's'}`))
  }
}
