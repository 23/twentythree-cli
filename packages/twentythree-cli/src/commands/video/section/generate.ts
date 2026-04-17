import { Args } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Video section generate command — AI-generates sections from a video transcript.
 *
 * Replaces all existing sections. Requires a transcript to be available.
 */
export default class VideoSectionGenerate extends AuthenticatedCommand<typeof VideoSectionGenerate> {
  static description = 'Automatically generate sections for a video using AI (requires transcript)'

  static examples = [
    '<%= config.bin %> video section generate 12345',
    '<%= config.bin %> video section generate 12345 --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /photo/section/generate',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'creates' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Video ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(VideoSectionGenerate)

    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.POST('/photo/section/generate', {
      body: {
        photo_id: Number(args.id),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Sections generated for video ${args.id}`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Sections generated for video ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'video', id: args.id },
          { resource: 'section' },
        ],
      })
    }
  }
}
