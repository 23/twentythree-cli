import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, parseBoolParam, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Setting update command — updates workspace-level settings via freeform key=value pairs.
 *
 * Accepts one or more --set key=value flags. Supports a --validate-only dry-run mode.
 * Top-level `setting` topic (not to be confused with `presentation/setting`).
 *
 * Threat mitigations:
 *   T-08-20: Freeform key-value pairs sent as-is; server validates setting keys
 *   T-08-21: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class SettingUpdate extends AuthenticatedCommand<typeof SettingUpdate> {
  static description = 'Update workspace settings (key=value pairs)'

  static examples = [
    '<%= config.bin %> setting update --set site_name="My Site"',
    '<%= config.bin %> setting update --set theme=dark --set language=en',
    '<%= config.bin %> setting update --set site_name="Test" --validate-only',
    '<%= config.bin %> setting update --set timezone=UTC --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    set: Flags.string({
      description: 'Setting key=value pair (repeatable)',
      multiple: true,
      required: false,
    }),
    'validate-only': Flags.boolean({
      description: 'Dry-run: validate settings without applying changes',
      allowNo: false,
      required: false,
    }),
    'validate-only-p': Flags.string({ hidden: true, required: false }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /setting/update',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'updates' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(SettingUpdate)

    this.printWorkspaceHeader()

    const setPairs = flags.set ?? []
    if (setPairs.length === 0) {
      this.error('At least one --set key=value pair is required', { exit: EXIT_ERROR })
    }

    const body: Record<string, unknown> = {}
    for (const pair of setPairs) {
      const idx = pair.indexOf('=')
      if (idx < 1) {
        this.error(`Invalid --set value: "${pair}" (expected key=value)`, { exit: EXIT_ERROR })
      }
      body[pair.slice(0, idx)] = pair.slice(idx + 1)
    }

    const valOnly = parseBoolParam(flags['validate-only'], flags['validate-only-p'])
    if (valOnly) {
      body.validate_only_p = 1
    }

    const { data: updateData, error: updateError } = await this.apiClient.POST('/setting/update', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (updateError) {
      this.error(applyCliTerms(formatApiError(updateError)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(valOnly ? 'Settings validated (dry-run)' : 'Settings updated'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: updateData,
        summary: valOnly ? 'Settings validated (dry-run)' : 'Settings updated',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'setting' },
        ],
      })
    }
  }
}
