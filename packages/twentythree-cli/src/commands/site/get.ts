import { Flags } from '@oclif/core'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, parseBoolParam, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Site get command — retrieves workspace-level site settings as key-value pairs.
 *
 * Supports optional inclusion of presentation and quota data via boolean flags.
 * Threat mitigations:
 *   T-08-21: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class SiteGet extends AuthenticatedCommand<typeof SiteGet> {
  static description = 'Get site settings for the active workspace'

  static examples = [
    '<%= config.bin %> site get',
    '<%= config.bin %> site get --include-presentation',
    '<%= config.bin %> site get --include-quota --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'include-presentation': Flags.boolean({
      description: 'Include presentation settings in the response',
      allowNo: false,
      required: false,
    }),
    'include-presentation-p': Flags.string({ hidden: true, required: false }),
    'include-quota': Flags.boolean({
      description: 'Include quota information in the response',
      allowNo: false,
      required: false,
    }),
    'include-quota-p': Flags.string({ hidden: true, required: false }),
  }

  static agentMetadata = {
    api_endpoint: 'GET /site/get',
    auth_scope: 'read' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(SiteGet)

    this.printWorkspaceHeader()

    const presVal = parseBoolParam(flags['include-presentation'], flags['include-presentation-p'])
    const quotaVal = parseBoolParam(flags['include-quota'], flags['include-quota-p'])

    const { data, error } = await this.apiClient.GET('/site/get', {
      params: {
        query: {
          include_presentation_p: presVal,
          include_quota_p: quotaVal,
        },
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    const obj = resp?.data ?? resp

    if (!obj) {
      this.error('No data returned', { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: obj,
        summary: 'Site settings',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'site' },
        ],
      })
    }

    // Key-value output — iterate top-level keys
    for (const [k, v] of Object.entries(obj)) {
      this.log(`${k}: ${applyCliTerms(String(v ?? ''))}`)
    }
  }
}
