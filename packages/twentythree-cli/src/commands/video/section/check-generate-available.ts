import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Video section check-generate-available command — checks whether AI chapter generation
 * is available for a given video. Requires the workspace feature to be enabled and
 * the video to have a transcript available.
 */
export default class VideoSectionCheckGenerateAvailable extends AuthenticatedCommand<typeof VideoSectionCheckGenerateAvailable> {
  static description = 'Check whether AI chapter generation is available for a video'

  static examples = [
    '<%= config.bin %> video section check-generate-available 12345',
    '<%= config.bin %> video section check-generate-available 12345 --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /photo/section/check-generate-available',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    fields: Flags.string({
      description: 'Comma-separated list of fields to return in the API response',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Video ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(VideoSectionCheckGenerateAvailable)

    this.printWorkspaceHeader()

    const body: Record<string, unknown> = {
      photo_id: Number(args.id),
    }
    if (flags.fields !== undefined) body.fields = flags.fields

    const { data, error } = await this.apiClient.POST('/photo/section/check-generate-available', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const available = (data as any)?.data?.section_generation_available_p

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `AI chapter generation available: ${available}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'video', id: args.id },
          { resource: 'section' },
        ],
      })
    }

    if (available) {
      this.log(chalk.green(`AI chapter generation is available for video ${args.id}`))
    } else {
      this.log(chalk.yellow(`AI chapter generation is not available for video ${args.id}`))
      this.log('Requires: workspace feature enabled and a transcript on the video')
    }
  }
}
