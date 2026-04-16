import { Args, Flags } from '@oclif/core'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Action get command — flexible retrieval of action CTAs.
 *
 * D-5: Single flexible command; all context fields are optional flags.
 * The most common case is passing an action_id as a positional arg.
 *
 * Calls GET /action/get — same endpoint as action list, but oriented around
 * detail/single-object retrieval.
 */
export default class ActionGet extends AuthenticatedCommand<typeof ActionGet> {
  static description = 'Get details of a CTA action'

  static examples = [
    '<%= config.bin %> action get 12345',
    '<%= config.bin %> action get --video-id 6789',
    '<%= config.bin %> action get --webinar-id 1234 --json',
    '<%= config.bin %> action get 12345 --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'GET /action/get',
    auth_scope: 'read' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'object-id': Flags.string({
      description: 'Object ID context',
      required: false,
    }),
    'video-id': Flags.string({
      description: 'Video ID context (maps to photo_id)',
      required: false,
    }),
    'webinar-id': Flags.string({
      description: 'Webinar ID context (maps to live_id)',
      required: false,
    }),
    token: Flags.string({
      description: 'Object token for authentication',
      required: false,
    }),
    'player-id': Flags.string({
      description: 'Player ID context',
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

  static args = {
    id: Args.string({ description: 'Action ID (optional)', required: false }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(ActionGet)

    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/action/get', {
      params: {
        query: {
          action_id: args.id ? Number(args.id) : undefined,
          object_id: flags['object-id'] ? Number(flags['object-id']) : undefined,
          photo_id: flags['video-id'] ? Number(flags['video-id']) : undefined,
          live_id: flags['webinar-id'] ? Number(flags['webinar-id']) : undefined,
          token: flags.token,
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
        data: items.length === 1 ? items[0] : items,
        summary: items.length === 1 ? `Action ${items[0].action_id ?? args.id}` : `${items.length} actions`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'action', id: args.id },
        ],
      })
    }

    if (items.length === 0) {
      this.log('No actions found.')
      return
    }

    // Render label-value pairs for each action
    for (const action of items) {
      this.log(`ID:         ${action.action_id ?? ''}`)
      this.log(`Name:       ${applyCliTerms(String(action.name ?? action.action_name ?? ''))}`)
      this.log(`Type:       ${String(action.type ?? action.action_type ?? '')}`)
      this.log(`Start:      ${String(action.start_time ?? '')}`)
      this.log(`End:        ${String(action.end_time ?? '')}`)
      if (action.object_id) {
        this.log(`Object ID:  ${action.object_id}`)
      }
      if (items.length > 1) {
        this.log('---')
      }
    }
  }
}
