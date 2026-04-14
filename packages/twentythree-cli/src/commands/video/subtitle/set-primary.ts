import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Video subtitle set-primary command — sets a subtitle track as the primary language.
 */
export default class VideoSubtitleSetPrimary extends AuthenticatedCommand<typeof VideoSubtitleSetPrimary> {
  static description = 'Set a subtitle track as the primary language for a video'

  static examples = [
    '<%= config.bin %> video subtitle set-primary 12345 --subtitle-id en_US',
    '<%= config.bin %> video subtitle set-primary 12345 --subtitle-id fr_FR --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'subtitle-id': Flags.string({
      description: 'Locale of the subtitle track to set as primary (e.g. en_US)',
      required: true,
    }),
  }

  static args = {
    id: Args.string({ description: 'Video ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(VideoSubtitleSetPrimary)

    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.POST('/photo/subtitle/set-primary', {
      body: {
        photo_id: Number(args.id),
        locale: flags['subtitle-id'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(String(error)), { exit: EXIT_ERROR })
    }

    this.log(
      chalk.green(
        `Subtitle track "${flags['subtitle-id']}" set as primary language for video ${args.id}`,
      ),
    )

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Subtitle track "${flags['subtitle-id']}" set as primary language for video ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'video', id: args.id },
          { resource: 'subtitle', id: flags['subtitle-id'] },
        ],
      })
    }
  }
}
