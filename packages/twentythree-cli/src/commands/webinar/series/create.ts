import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { text, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar series create command — creates a new webinar series.
 *
 * Falls back to interactive prompt for name if not provided in non-JSON mode.
 * Admin URL uses /manage/webinar/series/ path.
 *
 * Threat mitigations:
 *   T-05-16: applyCliTerms() on all error messages
 */
export default class WebinarSeriesCreate extends AuthenticatedCommand<typeof WebinarSeriesCreate> {
  static description = 'Create a webinar series'

  static examples = [
    '<%= config.bin %> webinar series create --name "My Series"',
    '<%= config.bin %> webinar series create --name "My Series" --description "Weekly sessions"',
    '<%= config.bin %> webinar series create --name "My Series" --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    name: Flags.string({
      description: 'Series name',
      required: false,
    }),
    description: Flags.string({
      description: 'Series description',
      required: false,
    }),
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'POST /live/series/create',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'creates' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(WebinarSeriesCreate)
    this.printWorkspaceHeader()

    let name = flags.name

    // Interactive fallback when name not provided in non-JSON mode
    if (!name && !this.jsonEnabled()) {
      const result = await text({ message: 'Series name' })
      if (isCancel(result)) {
        process.exit(EXIT_CANCELLED)
      }
      name = result as string
    }

    if (!name) {
      this.error('--name is required in non-interactive mode', { exit: EXIT_ERROR })
    }

    const body: Record<string, unknown> = { name }
    if (flags.description !== undefined) body.description = flags.description

    const { data, error } = await this.apiClient.POST('/live/series/create', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const seriesId = (data as any)?.data?.live_series_id ?? (data as any)?.live_series_id

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { ...(data ?? {}), admin_url: `https://${this.activeWorkspace.domain}/manage/webinar/series/${seriesId}` },
        summary: 'Series created',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'series', id: String(seriesId ?? '') },
        ],
      })
    }

    this.log(chalk.green('Series created'))
    if (seriesId) {
      this.log(`ID:    ${seriesId}`)
      this.log(`Admin: https://${this.activeWorkspace.domain}/manage/webinar/series/${seriesId}`)
    }
  }
}
