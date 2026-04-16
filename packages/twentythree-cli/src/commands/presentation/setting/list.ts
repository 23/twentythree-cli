import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Presentation setting list command — retrieves workspace presentation settings (PRS-01).
 *
 * Uses GET /presentation/setting/list — returns a large settings object.
 * Output is key-value format iterating all top-level keys.
 *
 * Threat mitigations:
 *   T-08-16: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class PresentationSettingList extends AuthenticatedCommand<typeof PresentationSettingList> {
  static description = 'List workspace presentation settings'

  static examples = [
    '<%= config.bin %> presentation setting list',
    '<%= config.bin %> presentation setting list --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'GET /presentation/setting/list',
    auth_scope: 'read' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const {} = await this.parse(PresentationSettingList)

    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/presentation/setting/list', {})

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    const obj = resp?.data ?? resp

    if (!obj) {
      this.error('No presentation settings returned', { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: obj,
        summary: 'Presentation settings',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'presentation' },
        ],
      })
    }

    // Key-value output — iterate all top-level settings keys
    for (const [k, v] of Object.entries(obj)) {
      this.log(`${k}: ${applyCliTerms(String(v ?? ''))}`)
    }
  }
}
