import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, parseBoolParam, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Video subtitle update command — updates metadata for an existing subtitle track.
 * Only provided flags are sent to the API.
 */
export default class VideoSubtitleUpdate extends AuthenticatedCommand<typeof VideoSubtitleUpdate> {
  static description = 'Update a subtitle track for a video'

  static examples = [
    '<%= config.bin %> video subtitle update 12345 --subtitle-id en_US --draft false',
    '<%= config.bin %> video subtitle update 12345 --subtitle-id en_US --type closedcaptions',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /photo/subtitle/update',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'updates' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'subtitle-id': Flags.string({
      description: 'Locale of the subtitle track to update (e.g. en_US)',
      required: true,
    }),
    type: Flags.string({
      description: 'New subtitle type (general, closedcaptions, audiodescriptions)',
      required: false,
    }),
    draft: Flags.boolean({
      description: 'Set draft status (true = hidden, false = published)',
      required: false,
      allowNo: true,
    }),
    default: Flags.boolean({
      description: 'Set this subtitle track as the default',
      required: false,
      allowNo: true,
    }),
    'draft-p': Flags.string({ hidden: true, required: false }),
    'default-p': Flags.string({ hidden: true, required: false }),
  }

  static args = {
    id: Args.string({ description: 'Video ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(VideoSubtitleUpdate)

    this.printWorkspaceHeader()

    const body: Record<string, unknown> = {
      photo_id: Number(args.id),
      locale: flags['subtitle-id'],
    }

    if (flags.type !== undefined) {
      body.type = flags.type
    }
    const draftVal = parseBoolParam(flags.draft, flags['draft-p'])
    const defaultVal = parseBoolParam(flags.default, flags['default-p'])
    if (draftVal !== undefined) body.draft_p = draftVal
    if (defaultVal !== undefined) body.default_p = defaultVal

    const { data, error } = await this.apiClient.POST('/photo/subtitle/update', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Subtitle track ${flags['subtitle-id']} updated for video ${args.id}`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Subtitle track ${flags['subtitle-id']} updated for video ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'video', id: args.id },
          { resource: 'subtitle', id: flags['subtitle-id'] },
        ],
      })
    }
  }
}
