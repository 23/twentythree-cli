import { Args } from '@oclif/core'
import chalk from 'chalk'
import { confirm, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, EXIT_ERROR, EXIT_CANCELLED } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Video delete command — deletes a video after confirmation.
 *
 * Prompts user to confirm deletion showing the workspace domain so they know
 * which workspace they are deleting from (T-03-08 repudiation mitigation).
 *
 * --json flag skips the confirmation prompt (scripting mode — assume confirmed).
 *
 * Exit codes:
 *   0 — success
 *   1 — error (video not found, API error)
 *   2 — cancelled (user declined confirmation)
 *
 * Threat mitigations:
 *   T-03-08: Confirmation prompt includes workspace domain
 *   T-03-09: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class VideoDelete extends AuthenticatedCommand<typeof VideoDelete> {
  static description = 'Delete a video from the active workspace'

  static examples = [
    '<%= config.bin %> video delete 12345',
    '<%= config.bin %> video delete 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {
    id: Args.string({ description: 'Video ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args } = await this.parse(VideoDelete)

    this.printWorkspaceHeader()

    if (!this.jsonEnabled()) {
      // T-03-08: Confirmation prompt includes workspace domain so user knows which workspace
      const confirmed = await confirm({
        message: `Delete video ${args.id} from ${this.activeWorkspace.domain}? This cannot be undone.`,
      })

      if (isCancel(confirmed) || !confirmed) {
        process.exit(EXIT_CANCELLED)
      }
    }

    const { data: deleteData, error: deleteError } = await this.apiClient.POST('/photo/delete', {
      body: { photo_id: Number(args.id) } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (deleteError) {
      this.error(applyCliTerms(String(deleteError)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Video ${args.id} deleted`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: deleteData,
        summary: `Video ${args.id} deleted`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'video', id: args.id },
        ],
      })
    }
  }
}
