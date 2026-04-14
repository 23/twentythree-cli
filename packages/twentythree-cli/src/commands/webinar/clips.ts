import { Args } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Webinar clips command — lists recording clips from a webinar.
 */
export default class WebinarClips extends AuthenticatedCommand<typeof WebinarClips> {
  static description = 'List recording clips from a webinar'

  static examples = [
    '<%= config.bin %> webinar clips 12345',
    '<%= config.bin %> webinar clips 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(WebinarClips)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/live/clips', {
      params: { query: { live_id: Number(args.id) } },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clips: any[] = Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: clips,
        summary: `${clips.length} clip${clips.length === 1 ? '' : 's'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
        ],
      })
    }

    if (clips.length === 0) {
      this.log('No clips found.')
      return
    }

    const headers = ['Video ID', 'Title', 'Duration', 'Type', 'Published', 'Views']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = clips.map((c: any) => [
      String(c.photo_id ?? ''),
      applyCliTerms(String(c.title ?? '')),
      String(c.duration_fmt ?? ''),
      String(c.live_highlight_type ?? ''),
      c.published_p ? 'yes' : 'no',
      String(c.view_count_fmt ?? c.view_count ?? ''),
    ])

    const table = renderTable(headers, rows)
    this.log(table.toString())
    this.log(chalk.dim(`${clips.length} clip${clips.length === 1 ? '' : 's'}`))
  }
}
