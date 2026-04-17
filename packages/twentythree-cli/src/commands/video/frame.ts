import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Video frame command — extracts a frame from a video at a given time offset.
 *
 * Threat mitigations:
 *   T-03-09: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class VideoFrame extends AuthenticatedCommand<typeof VideoFrame> {
  static description = 'Extract a frame from a video'

  static examples = [
    '<%= config.bin %> video frame 12345',
    '<%= config.bin %> video frame 12345 --time 30',
    '<%= config.bin %> video frame 12345 --time 30 --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /photo/frame',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'updates' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    time: Flags.integer({
      description: 'Time offset in seconds to extract the frame from',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Video ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(VideoFrame)

    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.POST('/photo/frame' as any, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: {
        photo_id: Number(args.id),
        ...(flags.time !== undefined && { time: flags.time }),
      } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const frameData = (data as any)?.data ?? data

    if (!this.jsonEnabled()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const frameUrl = (frameData as any)?.url ?? (frameData as any)?.frame_url
      if (frameUrl) {
        this.log(`Frame extracted: ${chalk.cyan(String(frameUrl))}`)
      } else {
        this.log(chalk.green(`Frame extracted for video ${args.id}`))
      }
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: frameData,
        summary: `Frame extracted for video ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'video', id: args.id },
        ],
      })
    }
  }
}
