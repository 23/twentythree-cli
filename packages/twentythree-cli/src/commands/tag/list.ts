import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { fetchAllPages } from '../../lib/pagination.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Tag list command — lists all tags in the active workspace with auto-pagination.
 */
export default class TagList extends AuthenticatedCommand<typeof TagList> {
  static description = 'List tags in the active workspace'

  static examples = [
    '<%= config.bin %> tag list',
    '<%= config.bin %> tag list --search marketing',
    '<%= config.bin %> tag list --orderby count --order desc',
    '<%= config.bin %> tag list --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    search: Flags.string({
      description: 'Filter tags by a search string',
      required: false,
    }),
    'exclude-machine-tags': Flags.boolean({
      description: 'Exclude machine tags from the results',
      required: false,
    }),
    'only-machine-tags': Flags.boolean({
      description: 'Return only machine tags (overrides --exclude-machine-tags)',
      required: false,
    }),
    'only-published': Flags.boolean({
      description: 'Return only tags from published videos',
      required: false,
    }),
    orderby: Flags.string({
      description: 'Order tags by this value',
      options: ['tag', 'count'],
      required: false,
    }),
    order: Flags.string({
      description: 'Sort order for the results',
      options: ['asc', 'desc'],
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(TagList)
    this.printWorkspaceHeader()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tags = await fetchAllPages<any>(async (page, size) => {
      const { data, error } = await this.apiClient.GET('/tag/list', {
        params: {
          query: {
            p: page,
            size,
            search: flags.search,
            exclude_machine_tags_p: flags['exclude-machine-tags'] ? true : undefined,
            only_machine_tags_p: flags['only-machine-tags'] ? true : undefined,
            only_published_p: flags['only-published'] ? true : undefined,
            orderby: flags.orderby as 'tag' | 'count' | undefined,
            order: flags.order as 'asc' | 'desc' | undefined,
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
        data: tags,
        summary: `${tags.length} tag${tags.length === 1 ? '' : 's'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'tag' },
        ],
      })
    }

    if (tags.length === 0) {
      this.log('No tags found.')
      return
    }

    const headers = ['Tag', 'Count']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = tags.map((t: any) => [
      String(t.tag ?? ''),
      String(t.count ?? ''),
    ])

    const table = renderTable(headers, rows)
    this.log(table.toString())
    this.log(chalk.dim(`${tags.length} tag${tags.length === 1 ? '' : 's'}`))
  }
}
