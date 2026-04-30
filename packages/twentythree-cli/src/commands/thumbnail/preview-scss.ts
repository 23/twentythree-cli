import { Args, Flags } from '@oclif/core'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Thumbnail preview-scss command — prerenders SCSS into CSS for previewing
 * thumbnail templates without saving changes.
 *
 * Maps to POST /thumbnail/template/preview-scss.
 */
export default class ThumbnailPreviewScss extends AuthenticatedCommand<typeof ThumbnailPreviewScss> {
  static description = 'Preview SCSS compiled to CSS for a thumbnail template'

  static examples = [
    '<%= config.bin %> thumbnail preview-scss 42 --scss ".title { font-size: 32px; }"',
    '<%= config.bin %> thumbnail preview-scss 42 --scss ".title { color: red; }" --json',
  ]

  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'POST /thumbnail/template/preview-scss',
    auth_scope: 'admin' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    scss: Flags.string({
      description: 'SCSS styles to prerender into CSS',
      required: true,
    }),
  }

  static args = {
    id: Args.string({ description: 'Thumbnail template ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(ThumbnailPreviewScss)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.POST('/thumbnail/template/preview-scss', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: {
        thumbnail_template_id: Number(args.id),
        scss_template: flags.scss,
      } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `SCSS preview for thumbnail template ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'thumbnail', id: args.id },
        ],
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (data as any)?.data ?? data
    this.log(JSON.stringify(result, null, 2))
  }
}
