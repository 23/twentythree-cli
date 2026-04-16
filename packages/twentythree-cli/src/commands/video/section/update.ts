import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Video section update command — updates an existing section for a video.
 *
 * Threat mitigations:
 *   T-03-12: Only sends fields explicitly provided by the user — prevents
 *            clearing fields with undefined.
 */
export default class VideoSectionUpdate extends AuthenticatedCommand<typeof VideoSectionUpdate> {
  static description = 'Update an existing section for a video'

  static examples = [
    '<%= config.bin %> video section update 12345 --section-id 67 --title "New Title"',
    '<%= config.bin %> video section update 12345 --section-id 67 --start-time 45 --description "Updated"',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /photo/section/update',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'updates' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'section-id': Flags.string({
      description: 'Section ID to update',
      required: true,
    }),
    title: Flags.string({
      description: 'New section title',
      required: false,
    }),
    'start-time': Flags.integer({
      description: 'New start time in seconds',
      required: false,
    }),
    description: Flags.string({
      description: 'New section description',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Video ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(VideoSectionUpdate)

    this.printWorkspaceHeader()

    // T-03-12: Only include fields that were explicitly provided
    const body: Record<string, unknown> = {
      photo_id: Number(args.id),
      section_id: flags['section-id'],
    }
    if (flags.title !== undefined) body.title = flags.title
    if (flags['start-time'] !== undefined) body.start_time = flags['start-time']
    if (flags.description !== undefined) body.description = flags.description

    const { data, error } = await this.apiClient.POST('/photo/section/update', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Section ${flags['section-id']} updated`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Section ${flags['section-id']} updated for video ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'video', id: args.id },
          { resource: 'section', id: flags['section-id'] },
        ],
      })
    }
  }
}
