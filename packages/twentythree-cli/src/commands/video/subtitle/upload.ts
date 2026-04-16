import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, parseBoolParam, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Video subtitle upload command — uploads an SRT or WebVTT subtitle file.
 *
 * Uses direct multipart POST with bodySerializer to create FormData.
 * This is NOT the chunked upload engine — subtitle files are small text files.
 */
export default class VideoSubtitleUpload extends AuthenticatedCommand<typeof VideoSubtitleUpload> {
  static description = 'Upload a subtitle file (SRT or WebVTT) for a video'

  static examples = [
    '<%= config.bin %> video subtitle upload 12345 ./subtitles.srt --locale en_US',
    '<%= config.bin %> video subtitle upload 12345 ./captions.vtt --locale fr_FR --type closedcaptions',
    '<%= config.bin %> video subtitle upload 12345 ./subtitles.srt --locale en_US --draft',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /photo/subtitle/upload',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'creates' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    locale: Flags.string({
      description: 'Locale for the subtitle track (e.g. en_US, fr_FR)',
      required: true,
    }),
    type: Flags.string({
      description: 'Subtitle type (general, closedcaptions, audiodescriptions)',
      default: 'general',
    }),
    draft: Flags.boolean({
      description: 'Upload as a draft (hidden from viewers until published)',
      allowNo: true,
      required: false,
    }),
    'draft-p': Flags.string({ hidden: true, required: false }),
  }

  static args = {
    id: Args.string({ description: 'Video ID', required: true }),
    file: Args.string({ description: 'Path to the subtitle file (SRT or WebVTT)', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(VideoSubtitleUpload)

    this.printWorkspaceHeader()

    // Validate file exists
    const filePath = path.resolve(args.file)
    if (!fs.existsSync(filePath)) {
      this.error(`File not found: ${filePath}`, { exit: EXIT_ERROR })
    }

    // Read file into Buffer and create Blob for multipart upload
    const fileBuffer = fs.readFileSync(filePath)
    const fileName = path.basename(filePath)
    const fileBlob = new Blob([fileBuffer], { type: 'text/plain' })

    const { data, error } = await this.apiClient.POST('/photo/subtitle/upload', {
      body: {
        photo_id: Number(args.id),
        file: fileBlob as unknown as Record<string, never>,
        locale: flags.locale,
        type: flags.type,
        ...(parseBoolParam(flags.draft, flags['draft-p']) !== undefined && { draft_p: parseBoolParam(flags.draft, flags['draft-p']) }),
      },
      bodySerializer(body) {
        const fd = new FormData()
        for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
          if (v !== undefined) {
            if (v instanceof Blob) {
              fd.append(k, v, fileName)
            } else {
              fd.append(k, String(v))
            }
          }
        }
        return fd
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Subtitle file uploaded for video ${args.id} (locale: ${flags.locale})`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Subtitle file uploaded for video ${args.id} (locale: ${flags.locale})`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'video', id: args.id },
          { resource: 'subtitle' },
        ],
      })
    }
  }
}
