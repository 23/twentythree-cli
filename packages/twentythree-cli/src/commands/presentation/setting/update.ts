import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Presentation setting update command — updates workspace presentation settings (PRS-02).
 *
 * Accepts repeatable --set key=value pairs and POSTs them to /presentation/setting/update.
 * Pattern D variant: freeform key-value body building (Pitfall 4 / T-08-17 accept).
 *
 * Threat mitigations:
 *   T-08-16: extends AuthenticatedCommand — anonymous mode rejected
 *   T-08-17: --set key=value pairs sent to API as-is; server validates valid setting keys (accepted)
 */
export default class PresentationSettingUpdate extends AuthenticatedCommand<typeof PresentationSettingUpdate> {
  static description = 'Update workspace presentation settings'

  static examples = [
    '<%= config.bin %> presentation setting update --set site_name="My Site"',
    '<%= config.bin %> presentation setting update --set site_name="My Site" --set logo_url="https://example.com/logo.png"',
    '<%= config.bin %> presentation setting update --set site_name="My Site" --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    set: Flags.string({
      description: 'Setting key=value pair (repeatable)',
      multiple: true,
      required: false,
    }),
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'POST /presentation/setting/update',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'updates' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(PresentationSettingUpdate)

    this.printWorkspaceHeader()

    if (!flags.set || flags.set.length === 0) {
      this.error('Provide at least one --set key=value pair', { exit: EXIT_ERROR })
    }

    const body: Record<string, unknown> = {}
    for (const pair of flags.set) {
      const idx = pair.indexOf('=')
      if (idx < 1) {
        this.error(`Invalid --set value: "${pair}" (expected key=value)`, { exit: EXIT_ERROR })
      }
      body[pair.slice(0, idx)] = pair.slice(idx + 1)
    }

    const { data: updateData, error: updateError } = await this.apiClient.POST('/presentation/setting/update', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (updateError) {
      this.error(applyCliTerms(formatApiError(updateError)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green('Presentation settings updated'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: updateData,
        summary: 'Presentation settings updated',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'presentation' },
        ],
      })
    }
  }
}
