import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { text, select, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, parseBoolParam, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Webinar update command — updates metadata for an existing webinar.
 *
 * Two modes:
 * - Flag mode: only flags explicitly provided are sent to the API
 * - Interactive mode: triggered when no metadata flags provided and not --json;
 *   uses @clack/prompts with current values pre-filled
 *
 * CRITICAL field mapping: CLI --title flag maps to API body field `name` (NOT `title`).
 * CRITICAL field mapping: CLI --live-date flag maps to API body field `start_time` (NOT `live_date`).
 *
 * Threat mitigations:
 *   T-04-05: Validates live_id is numeric; only flags !== undefined sent to body
 *   T-04-08: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class WebinarUpdate extends AuthenticatedCommand<typeof WebinarUpdate> {
  static description = 'Update details for a webinar'

  static examples = [
    '<%= config.bin %> webinar update 12345 --title "New Title"',
    '<%= config.bin %> webinar update 12345 --status upcoming',
    '<%= config.bin %> webinar update 12345',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    title: Flags.string({
      description: 'New title for the webinar',
      required: false,
    }),
    description: Flags.string({
      description: 'New description for the webinar',
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
      description: 'Publish or unpublish the webinar',
      allowNo: true,
      required: false,
    }),
    // Hidden raw _p-suffixed alternatives
    'draft-p': Flags.string({ hidden: true, required: false }),
    'published-p': Flags.string({ hidden: true, required: false }),
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarUpdate)
    this.printWorkspaceHeader()

    // T-04-05: Validate args.id is numeric before sending to API
    const webinarId = Number(args.id)
    if (!Number.isFinite(webinarId) || webinarId <= 0) {
      this.error(`Invalid webinar ID: ${args.id}`, { exit: EXIT_ERROR })
    }

    const metadataFlagsProvided = [
      flags.title,
      flags.description,
      flags.status,
      flags['live-date'],
      flags.draft,
      flags.publish,
      flags['draft-p'],
      flags['published-p'],
    ].some((v) => v !== undefined)

    const body: Record<string, unknown> = { live_id: webinarId }

    if (!metadataFlagsProvided && !this.jsonEnabled()) {
      // Interactive mode: fetch current webinar metadata and pre-fill prompts
      const { data, error } = await this.apiClient.GET('/live/list', {
        params: { query: { live_id: webinarId } },
      })

      if (error) {
        this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resp = data as any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any
      if (Array.isArray(resp?.data)) {
        current = resp.data[0]
      } else if (resp?.data) {
        current = resp.data
      }

      if (!current) {
        this.error(`Webinar ${args.id} not found`, { exit: EXIT_ERROR })
      }

      const titleResult = await text({
        message: 'Title',
        initialValue: current.name ?? current.title ?? '',
        placeholder: 'Webinar title',
      })
      if (isCancel(titleResult)) process.exit(EXIT_CANCELLED)

      const descriptionResult = await text({
        message: 'Description',
        initialValue: current.description ?? '',
        placeholder: 'Webinar description',
      })
      if (isCancel(descriptionResult)) process.exit(EXIT_CANCELLED)

      const statusResult = await select({
        message: 'Status',
        options: [
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'live', label: 'Live' },
          { value: 'previous', label: 'Previous' },
        ],
        initialValue: current.live_status ?? 'upcoming',
      })
      if (isCancel(statusResult)) process.exit(EXIT_CANCELLED)

      const draftResult = await select({
        message: 'Draft',
        options: [
          { value: 'yes', label: 'Yes — draft' },
          { value: 'no', label: 'No — not draft' },
        ],
        initialValue: current.draft_p ? 'yes' : 'no',
      })
      if (isCancel(draftResult)) process.exit(EXIT_CANCELLED)

      const publishedResult = await select({
        message: 'Published',
        options: [
          { value: 'yes', label: 'Yes — published' },
          { value: 'no', label: 'No — unpublished' },
        ],
        initialValue: current.published_p ? 'yes' : 'no',
      })
      if (isCancel(publishedResult)) process.exit(EXIT_CANCELLED)

      // CRITICAL: map title result to body.name (not body.title)
      body.name = titleResult as string
      body.description = descriptionResult as string
      body.live_status = statusResult as string
      body.draft_p = draftResult === 'yes' ? 1 : 0
      body.published_p = publishedResult === 'yes' ? 1 : 0
    } else {
      // Flag mode: only include flags the user explicitly provided
      // CRITICAL: --title maps to body.name (NOT body.title)
      if (flags.title !== undefined) body.name = flags.title
      if (flags.description !== undefined) body.description = flags.description
      if (flags.status !== undefined) body.live_status = flags.status
      // CRITICAL: --live-date maps to body.start_time (NOT body.live_date)
      if (flags['live-date'] !== undefined) body.start_time = flags['live-date']
      const draftVal = parseBoolParam(flags.draft, flags['draft-p'])
      if (draftVal !== undefined) body.draft_p = draftVal ? 1 : 0
      const publishVal = parseBoolParam(flags.publish, flags['published-p'])
      if (publishVal !== undefined) body.published_p = publishVal ? 1 : 0
    }

    const { data: updateData, error: updateError } = await this.apiClient.POST('/live/update', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (updateError) {
      this.error(applyCliTerms(formatApiError(updateError)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Webinar ${args.id} updated`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: updateData,
        summary: `Webinar ${args.id} updated`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
        ],
      })
    }
  }
}
