import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Webinar repeat command — duplicates a webinar and schedules the copy at a new date/time.
 * Sends POST /live/repeat with live_id + schedule_start_time.
 * Returns the new webinar's live_id and admin URL.
 */
export default class WebinarRepeat extends AuthenticatedCommand<typeof WebinarRepeat> {
  static description = 'Duplicate a webinar and schedule the copy at a new date/time'

  static examples = [
    '<%= config.bin %> webinar repeat 12345 --date "2024-12-01T14:00:00Z"',
    '<%= config.bin %> webinar repeat 12345 --date "2024-12-01T14:00:00Z" --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    date: Flags.string({
      description: 'Schedule date/time for the new webinar (ISO 8601)',
      required: true,
    }),
    'webinar-design-id': Flags.integer({
      description: 'Assign a webinar design by ID to the new webinar',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /live/repeat',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'creates' as const,
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarRepeat)
    this.printWorkspaceHeader()

    const body: Record<string, unknown> = {
      live_id: Number(args.id),
      schedule_start_time: flags.date,
    }
    if (flags['webinar-design-id'] !== undefined) body.webinar_design_id = flags['webinar-design-id']

    const { data: repeatData, error: repeatError } = await this.apiClient.POST('/live/repeat', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (repeatError) {
      this.error(applyCliTerms(formatApiError(repeatError)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newLiveId = (repeatData as any)?.data?.live_id

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { ...(repeatData ?? {}), admin_url: `https://${this.activeWorkspace.domain}/manage/webinar/${newLiveId}` },
        summary: 'Webinar duplicated and scheduled',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: String(newLiveId ?? '') },
        ],
      })
    }

    this.log(chalk.green('Webinar duplicated and scheduled'))
    if (newLiveId) {
      this.log(`ID:    ${newLiveId}`)
      this.log(`Admin: https://${this.activeWorkspace.domain}/manage/webinar/${newLiveId}`)
    }
  }
}
