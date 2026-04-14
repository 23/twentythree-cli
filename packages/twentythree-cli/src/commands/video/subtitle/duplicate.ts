import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Video subtitle duplicate command — duplicates a subtitle track to a new locale.
 */
export default class VideoSubtitleDuplicate extends AuthenticatedCommand<typeof VideoSubtitleDuplicate> {
  static description = 'Duplicate a subtitle track to a new locale'

  static examples = [
    '<%= config.bin %> video subtitle duplicate 12345 --subtitle-id en_US --target-locale fr_FR',
    '<%= config.bin %> video subtitle duplicate 12345 --subtitle-id en_US --target-locale de_DE --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'subtitle-id': Flags.string({
      description: 'Source locale of the subtitle track to duplicate (e.g. en_US)',
      required: true,
    }),
    'target-locale': Flags.string({
      description: 'Target locale for the duplicated subtitle track (e.g. fr_FR)',
      required: true,
    }),
    'source-type': Flags.string({
      description: 'Source subtitle type (general, closedcaptions, audiodescriptions)',
      default: 'general',
    }),
    'target-type': Flags.string({
      description: 'Target subtitle type (general, closedcaptions, audiodescriptions)',
      default: 'general',
    }),
    draft: Flags.boolean({
      description: 'Create the duplicated track as a draft',
      default: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Video ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(VideoSubtitleDuplicate)

    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.POST('/photo/subtitle/duplicate', {
      body: {
        photo_id: Number(args.id),
        from_locale: flags['subtitle-id'],
        to_locale: flags['target-locale'],
        type_from: flags['source-type'] as 'general' | 'closedcaptions' | 'audiodescriptions',
        type_to: flags['target-type'] as 'general' | 'closedcaptions' | 'audiodescriptions',
        ...(flags.draft && { draft_p: true }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(String(error)), { exit: EXIT_ERROR })
    }

    this.log(
      chalk.green(
        `Subtitle track "${flags['subtitle-id']}" duplicated to "${flags['target-locale']}" for video ${args.id}`,
      ),
    )

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Subtitle track "${flags['subtitle-id']}" duplicated to "${flags['target-locale']}" for video ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'video', id: args.id },
          { resource: 'subtitle', id: flags['target-locale'] },
        ],
      })
    }
  }
}
