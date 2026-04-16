import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Video section create command — creates a new section (chapter) for a video.
 */
export default class VideoSectionCreate extends AuthenticatedCommand<typeof VideoSectionCreate> {
  static description = 'Create a new section for a video'

  static examples = [
    '<%= config.bin %> video section create 12345 --title "Introduction" --start-time 0',
    '<%= config.bin %> video section create 12345 --title "Chapter 1" --start-time 30 --description "First chapter"',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /photo/section/create',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'creates' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    title: Flags.string({
      description: 'Section title',
      required: true,
    }),
    'start-time': Flags.integer({
      description: 'Start time in seconds',
      required: true,
    }),
    description: Flags.string({
      description: 'Section description',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Video ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(VideoSectionCreate)

    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.POST('/photo/section/create', {
      body: {
        photo_id: Number(args.id),
        title: flags.title,
        start_time: flags['start-time'],
        ...(flags.description !== undefined && { description: flags.description }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    const adminUrl = `https://${this.activeWorkspace.domain}/manage/video/${args.id}`
    this.log(chalk.green(`Section created for video ${args.id}`))
    this.log(`Admin: ${adminUrl}`)

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Section created for video ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'video', id: args.id },
          { resource: 'section' },
        ],
      })
    }
  }
}
