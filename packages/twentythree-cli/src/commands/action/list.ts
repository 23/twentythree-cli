import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Action list command — lists CTAs for a given video, webinar, or object.
 *
 * Calls GET /action/get with at least one context filter.
 * Renders a table with columns [ID, Name, Type, Start, End].
 *
 * Note: Both `action list` and `action get` use the /action/get endpoint.
 * `action list` is focused on listing with filters; `action get` is focused on
 * retrieving a specific action or flexible querying.
 */
export default class ActionList extends AuthenticatedCommand<typeof ActionList> {
  static description = 'List CTA actions for a video, webinar, or object'

  static examples = [
    '<%= config.bin %> action list --video-id 12345',
    '<%= config.bin %> action list --webinar-id 6789',
    '<%= config.bin %> action list --object-id 12345',
    '<%= config.bin %> action list --video-id 12345 --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'GET /action/get',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['ID', 'Name', 'Type', 'Start', 'End'] },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'object-id': Flags.string({
      description: 'Object ID to filter actions by',
      required: false,
    }),
    'video-id': Flags.string({
      description: 'Video ID to filter actions by (maps to photo_id)',
      required: false,
    }),
    'webinar-id': Flags.string({
      description: 'Webinar ID to filter actions by (maps to live_id)',
      required: false,
    }),
    'player-id': Flags.string({
      description: 'Player ID to filter actions by',
      required: false,
    }),
    'exclude-internal': Flags.boolean({
      description: 'Exclude internal actions',
      required: false,
    }),
    'exclude-pending': Flags.boolean({
      description: 'Exclude pending actions',
      required: false,
    }),
    'exclude-items': Flags.boolean({
      description: 'Exclude action items',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(ActionList)

    this.printWorkspaceHeader()

    // Warn if no context filter is provided
    if (
      !flags['object-id'] &&
      !flags['video-id'] &&
      !flags['webinar-id'] &&
      !flags['player-id']
    ) {
      this.warn('Provide --object-id, --video-id, or --webinar-id to filter actions')
    }

    const { data, error } = await this.apiClient.GET('/action/get', {
      params: {
        query: {
          object_id: flags['object-id'] ? Number(flags['object-id']) : undefined,
          photo_id: flags['video-id'] ? Number(flags['video-id']) : undefined,
          live_id: flags['webinar-id'] ? Number(flags['webinar-id']) : undefined,
          player_id: flags['player-id'] ? Number(flags['player-id']) : undefined,
          exclude_internal_p: flags['exclude-internal'] ? true : undefined,
          exclude_pending_p: flags['exclude-pending'] ? true : undefined,
          exclude_items_p: flags['exclude-items'] ? true : undefined,
        },
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: any[] = Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: items,
        summary: `${items.length} action${items.length === 1 ? '' : 's'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'action' },
        ],
      })
    }

    if (items.length === 0) {
      this.log('No actions found.')
      return
    }

    const headers = ['ID', 'Name', 'Type', 'Start', 'End']
    const rows = items.map((item: any) => [
      String(item.action_id ?? ''),
      applyCliTerms(String(item.name ?? item.action_name ?? '')),
      String(item.type ?? item.action_type ?? ''),
      String(item.start_time ?? ''),
      String(item.end_time ?? ''),
    ])

    const table = renderTable(headers, rows)
    this.log(table.toString())
    this.log(chalk.dim(`${items.length} action${items.length === 1 ? '' : 's'}`))
  }
}
