import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { confirm, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Video section delete command — deletes a section after confirmation.
 *
 * Prompts user to confirm deletion showing workspace domain and section ID
 * so they know exactly what is being deleted (T-03-11 repudiation mitigation).
 *
 * --json flag skips the confirmation prompt (scripting mode — assume confirmed).
 *
 * Threat mitigations:
 *   T-03-11: Confirmation prompt includes workspace domain and section ID
 *   T-03-09: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class VideoSectionDelete extends AuthenticatedCommand<typeof VideoSectionDelete> {
  static description = 'Delete a section from a video'

  static examples = [
    '<%= config.bin %> video section delete 12345 --section-id 67',
    '<%= config.bin %> video section delete 12345 --section-id 67 --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /photo/section/delete',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'destructive' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'section-id': Flags.string({
      description: 'Section ID to delete',
      required: true,
    }),
  }

  static args = {
    id: Args.string({ description: 'Video ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(VideoSectionDelete)

    this.printWorkspaceHeader()

    if (!this.jsonEnabled()) {
      // T-03-11: Confirmation includes workspace domain and section ID
      const confirmed = await confirm({
        message: `Delete section ${flags['section-id']} from video ${args.id} on ${this.activeWorkspace.domain}?`,
      })

      if (isCancel(confirmed) || !confirmed) {
        process.exit(EXIT_CANCELLED)
      }
    }

    const { data, error } = await this.apiClient.POST('/photo/section/delete', {
      body: {
        photo_id: Number(args.id),
        section_id: flags['section-id'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Section ${flags['section-id']} deleted from video ${args.id}`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Section ${flags['section-id']} deleted from video ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'video', id: args.id },
          { resource: 'section', id: flags['section-id'] },
        ],
      })
    }
  }
}
