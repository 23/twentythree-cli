import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Video subtitle create command — creates a new subtitle track for a video.
 */
export default class VideoSubtitleCreate extends AuthenticatedCommand<typeof VideoSubtitleCreate> {
  static description = 'Create a new subtitle track for a video'

  static examples = [
    '<%= config.bin %> video subtitle create 12345 --locale en_US',
    '<%= config.bin %> video subtitle create 12345 --locale fr_FR --type closedcaptions',
    '<%= config.bin %> video subtitle create 12345 --locale auto --draft',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    locale: Flags.string({
      description: 'Locale for the subtitle track (e.g. en_US, fr_FR, auto)',
      required: true,
    }),
    type: Flags.string({
      description: 'Subtitle type (general, closedcaptions, audiodescriptions)',
      default: 'general',
    }),
    draft: Flags.boolean({
      description: 'Create the subtitle track as a draft (hidden from viewers)',
      default: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Video ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(VideoSubtitleCreate)

    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.POST('/photo/subtitle/create', {
      body: {
        photo_id: Number(args.id),
        locale: flags.locale,
        type: flags.type as 'general' | 'closedcaptions' | 'audiodescriptions',
        ...(flags.draft && { draft_p: true }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(String(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Subtitle track created for video ${args.id} (locale: ${flags.locale})`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Subtitle track created for video ${args.id} (locale: ${flags.locale})`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'video', id: args.id },
          { resource: 'subtitle' },
        ],
      })
    }
  }
}
