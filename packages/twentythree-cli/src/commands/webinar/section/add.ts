import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { text, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar section add command — adds an agenda section to a webinar.
 *
 * Uses live_id to identify the webinar.
 * Falls back to interactive prompt for title if not provided via flag.
 *
 * Threat mitigations:
 *   T-05-03: applyCliTerms() on all error messages — no 'live'/'photo'/'album' leaks
 */
export default class WebinarSectionAdd extends AuthenticatedCommand<typeof WebinarSectionAdd> {
  static description = 'Add an agenda section to a webinar'

  static examples = [
    '<%= config.bin %> webinar section add 12345 --title "Introduction"',
    '<%= config.bin %> webinar section add 12345 --title "Q&A" --start-time 3600',
    '<%= config.bin %> webinar section add 12345 --title "Welcome" --description "Opening remarks" --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    title: Flags.string({
      description: 'Section title',
      required: false,
    }),
    description: Flags.string({
      description: 'Section description',
      required: false,
    }),
    'start-time': Flags.string({
      description: 'Start time in seconds',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarSectionAdd)
    this.printWorkspaceHeader()

    let title = flags.title

    // Interactive fallback when title not provided in non-JSON mode
    if (!title && !this.jsonEnabled()) {
      const result = await text({ message: 'Section title' })
      if (isCancel(result)) {
        process.exit(EXIT_CANCELLED)
      }
      title = result as string
    }

    if (!title) {
      this.error('--title is required in non-interactive mode', { exit: EXIT_ERROR })
    }

    const body: Record<string, unknown> = {
      live_id: Number(args.id),
      title,
    }
    if (flags.description !== undefined) body.description = flags.description
    if (flags['start-time'] !== undefined) body.start_time = flags['start-time']

    const { data, error } = await this.apiClient.POST('/live/section/add', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const liveSectionId = (data as any)?.data?.live_section_id ?? (data as any)?.live_section_id

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Section added',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
          { resource: 'section', id: String(liveSectionId ?? '') },
        ],
      })
    }

    this.log(chalk.green('Section added'))
    if (liveSectionId) {
      this.log(`ID:    ${liveSectionId}`)
      this.log(`Admin: https://${this.activeWorkspace.domain}/manage/webinar/${args.id}`)
    }
  }
}
