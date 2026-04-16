import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar section update command — updates an existing agenda section.
 *
 * CRITICAL: uses `live_section_id` (the section's own ID), NOT `live_id`.
 * Only includes fields in the body where flags are defined — prevents clearing unset fields.
 *
 * Threat mitigations:
 *   T-05-03: applyCliTerms() on all error messages — no 'live'/'photo'/'album' leaks
 */
export default class WebinarSectionUpdate extends AuthenticatedCommand<typeof WebinarSectionUpdate> {
  static description = 'Update an agenda section'

  static examples = [
    '<%= config.bin %> webinar section update 12345 99 --title "Updated Title"',
    '<%= config.bin %> webinar section update 12345 99 --start-time 1800',
    '<%= config.bin %> webinar section update 12345 99 --title "Q&A" --description "Audience questions" --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    title: Flags.string({
      description: 'New section title',
      required: false,
    }),
    description: Flags.string({
      description: 'New section description',
      required: false,
    }),
    'start-time': Flags.string({
      description: 'New start time in seconds',
      required: false,
    }),
  }

  static args = {
    webinarId: Args.string({ description: 'Webinar ID', required: true }),
    id: Args.string({ description: 'Section ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /live/section/update',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'updates' as const,
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarSectionUpdate)
    this.printWorkspaceHeader()

    const body: Record<string, unknown> = {
      live_id: Number(args.webinarId),
      live_section_id: Number(args.id),
    }

    // Only add fields where flags are defined — prevents clearing unset fields
    if (flags.title !== undefined) body.title = flags.title
    if (flags.description !== undefined) body.description = flags.description
    if (flags['start-time'] !== undefined) body.start_time = flags['start-time']

    const { data, error } = await this.apiClient.POST('/live/section/update', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green('Section updated'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Section updated',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'section', id: args.id },
        ],
      })
    }
  }
}
