import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, parseBoolParam, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Webinar create command — creates a new webinar in the active workspace.
 *
 * CRITICAL field mapping: CLI --title flag maps to API body field `name` (NOT `title`).
 * Sending `title` instead of `name` silently fails — the webinar is created without a title.
 *
 * CRITICAL field mapping: CLI --live-date flag maps to API body field `start_time` (NOT `live_date`).
 *
 * Threat mitigations:
 *   T-04-07: Admin URL printed — acceptable for authenticated CLI users
 *   T-04-08: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class WebinarCreate extends AuthenticatedCommand<typeof WebinarCreate> {
  static description = 'Create a new webinar'

  static examples = [
    '<%= config.bin %> webinar create --title "My Webinar"',
    '<%= config.bin %> webinar create --title "My Webinar" --live-date "2024-12-01T14:00:00Z"',
    '<%= config.bin %> webinar create --title "My Webinar" --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    title: Flags.string({
      description: 'Title for the new webinar',
      required: true,
    }),
    description: Flags.string({
      description: 'Description for the webinar',
      required: false,
    }),
    status: Flags.string({
      description: 'Webinar status: upcoming, live, or previous',
      required: false,
    }),
    'live-date': Flags.string({
      description: 'Schedule date/time (ISO 8601)',
      required: false,
    }),
    draft: Flags.boolean({
      description: 'Set as draft',
      allowNo: true,
      required: false,
    }),
    publish: Flags.boolean({
      description: 'Publish the webinar',
      allowNo: true,
      required: false,
    }),
    // Hidden raw _p-suffixed alternatives
    'draft-p': Flags.string({ hidden: true, required: false }),
    'published-p': Flags.string({ hidden: true, required: false }),
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'POST /live/create',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'creates' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(WebinarCreate)
    this.printWorkspaceHeader()

    // CRITICAL: API body field is 'name' not 'title' — sending 'title' silently fails
    const body: Record<string, unknown> = { name: flags.title }
    if (flags.description !== undefined) body.description = flags.description
    if (flags.status !== undefined) body.live_status = flags.status
    // CRITICAL: API date field is 'start_time' not 'live_date'
    if (flags['live-date'] !== undefined) body.start_time = flags['live-date']
    const draftVal = parseBoolParam(flags.draft, flags['draft-p'])
    if (draftVal !== undefined) body.draft_p = draftVal ? 1 : 0
    const publishVal = parseBoolParam(flags.publish, flags['published-p'])
    if (publishVal !== undefined) body.published_p = publishVal ? 1 : 0

    const { data: createData, error: createError } = await this.apiClient.POST('/live/create', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (createError) {
      this.error(applyCliTerms(formatApiError(createError)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const liveId = (createData as any)?.data?.live_id

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: createData,
        summary: 'Webinar created',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: String(liveId ?? '') },
        ],
      })
    }

    this.log(chalk.green('Webinar created'))
    if (liveId) {
      this.log(`ID:    ${liveId}`)
      this.log(`Admin: https://${this.activeWorkspace.domain}/manage/webinar/${liveId}`)
    }
  }
}
