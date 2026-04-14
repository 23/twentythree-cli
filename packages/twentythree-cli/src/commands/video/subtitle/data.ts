import { Args, Flags } from '@oclif/core'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Video subtitle data command — retrieves the raw subtitle content (SRT/WebVTT) for a track.
 */
export default class VideoSubtitleData extends AuthenticatedCommand<typeof VideoSubtitleData> {
  static description = 'Get raw subtitle content for a subtitle track'

  static examples = [
    '<%= config.bin %> video subtitle data 12345 --subtitle-id en_US',
    '<%= config.bin %> video subtitle data 12345 --subtitle-id fr_FR --format websrt',
    '<%= config.bin %> video subtitle data 12345 --subtitle-id en_US --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'subtitle-id': Flags.string({
      description: 'Locale of the subtitle track to retrieve (e.g. en_US)',
      required: true,
    }),
    format: Flags.string({
      description: 'Subtitle format (websrt, webvtt, json, adobe, subviewer)',
      default: 'websrt',
    }),
    type: Flags.string({
      description: 'Subtitle type (general, closedcaptions, audiodescriptions)',
      default: 'general',
    }),
  }

  static args = {
    id: Args.string({ description: 'Video ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(VideoSubtitleData)

    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/photo/subtitle/data', {
      params: {
        query: {
          photo_id: Number(args.id),
          locale: flags['subtitle-id'],
          subtitle_format: flags.format,
          type: flags.type,
        },
      },
    })

    if (error) {
      this.error(applyCliTerms(String(error)), { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Subtitle data for video ${args.id} (locale: ${flags['subtitle-id']})`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'video', id: args.id },
          { resource: 'subtitle', id: flags['subtitle-id'] },
        ],
      })
    }

    // Display raw subtitle content
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const content = (data as any)?.subtitle ?? (data as any)?.data ?? ''
    if (content) {
      this.log(String(content))
    } else {
      this.log(JSON.stringify(data, null, 2))
    }
  }
}
