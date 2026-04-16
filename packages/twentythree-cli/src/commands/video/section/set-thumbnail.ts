import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Video section set-thumbnail command — sets the thumbnail for a section.
 */
export default class VideoSectionSetThumbnail extends AuthenticatedCommand<typeof VideoSectionSetThumbnail> {
  static description = 'Set the thumbnail for a video section'

  static examples = [
    '<%= config.bin %> video section set-thumbnail 12345 --section-id 67',
    '<%= config.bin %> video section set-thumbnail 12345 --section-id 67 --time 15',
    '<%= config.bin %> video section set-thumbnail 12345 --section-id 67 --time 15 --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /photo/section/set-thumbnail',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'updates' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'section-id': Flags.string({
      description: 'Section ID',
      required: true,
    }),
    time: Flags.integer({
      description: 'Time offset in seconds for the thumbnail frame',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Video ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(VideoSectionSetThumbnail)

    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.POST('/photo/section/set-thumbnail', {
      body: {
        photo_id: Number(args.id),
        section_id: flags['section-id'],
        ...(flags.time !== undefined && { time: flags.time }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Thumbnail set for section ${flags['section-id']} of video ${args.id}`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Thumbnail set for section ${flags['section-id']} of video ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'video', id: args.id },
          { resource: 'section', id: flags['section-id'] },
        ],
      })
    }
  }
}
