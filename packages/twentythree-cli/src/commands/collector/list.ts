import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Collector list command — lists data collectors (lead capture forms) in the active workspace.
 * Optionally filters by object and includes analytics data.
 */
export default class CollectorList extends AuthenticatedCommand<typeof CollectorList> {
  static description = 'List collectors in the active workspace'

  static examples = [
    '<%= config.bin %> collector list',
    '<%= config.bin %> collector list --object-id 123',
    '<%= config.bin %> collector list --include-analytics',
    '<%= config.bin %> collector list --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'object-id': Flags.string({
      description: 'Filter collectors by object (video/webinar) ID',
      required: false,
    }),
    'include-analytics': Flags.boolean({
      description: 'Include analytics data for each collector',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(CollectorList)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/collector/list', {
      params: {
        query: {
          object_id: flags['object-id'] ? Number(flags['object-id']) : undefined,
          include_analytics_p: flags['include-analytics'] ? true : undefined,
        },
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    const collectors: unknown[] = Array.isArray(resp?.data)
      ? resp.data
      : resp?.data
      ? [resp.data]
      : []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: collectors,
        summary: `${collectors.length} collector${collectors.length === 1 ? '' : 's'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'collector' },
        ],
      })
    }

    if (collectors.length === 0) {
      this.log('No collectors found.')
      return
    }

    const headers = ['ID', 'Name', 'Type']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = collectors.map((c: any) => [
      String(c.action_id ?? c.collector_id ?? ''),
      applyCliTerms(String(c.name ?? c.title ?? '')),
      String(c.type ?? c.collector_type ?? ''),
    ])

    const table = renderTable(headers, rows)
    this.log(table.toString())
    this.log(chalk.dim(`${collectors.length} collector${collectors.length === 1 ? '' : 's'}`))
  }
}
