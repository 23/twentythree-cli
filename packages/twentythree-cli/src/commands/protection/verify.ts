import { Flags } from '@oclif/core'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Protection verify command — verifies access to protected content (PRT-03).
 *
 * Pattern E: GET single object with key-value output.
 *
 * Note: CLI flags use --video-id and --webinar-id but map to photo_id and live_id
 * in the API query (term mapping at the flag level, per terminology conventions).
 *
 * Threat mitigations:
 *   T-08-16: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class ProtectionVerify extends AuthenticatedCommand<typeof ProtectionVerify> {
  static description = 'Verify access to protected content'

  static examples = [
    '<%= config.bin %> protection verify --protection-method password',
    '<%= config.bin %> protection verify --protection-method sso --video-id 12345',
    '<%= config.bin %> protection verify --protection-method token --verification-data mytoken --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'protection-method': Flags.string({
      description: 'Protection method to verify against',
      required: true,
    }),
    'video-id': Flags.string({
      description: 'Video ID to verify access for (maps to photo_id in API)',
      required: false,
    }),
    'webinar-id': Flags.string({
      description: 'Webinar ID to verify access for (maps to live_id in API)',
      required: false,
    }),
    'object-id': Flags.string({
      description: 'Object ID to verify access for',
      required: false,
    }),
    'verification-data': Flags.string({
      description: 'Verification data (e.g. password, token)',
      required: false,
    }),
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'GET /protection/verify',
    auth_scope: 'read' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(ProtectionVerify)

    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/protection/verify', {
      params: {
        query: {
          protection_method: flags['protection-method'],
          // Term mapping: --video-id → photo_id, --webinar-id → live_id (API legacy names)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          photo_id: flags['video-id'] ? Number(flags['video-id']) : undefined as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          live_id: flags['webinar-id'] ? Number(flags['webinar-id']) : undefined as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          object_id: flags['object-id'] as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          verification_data: flags['verification-data'] as any,
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
      this.error('No verification result returned', { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: obj,
        summary: 'Protection verification result',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'protection' },
        ],
      })
    }

    // Key-value output
    for (const [k, v] of Object.entries(obj)) {
      this.log(`${k}: ${applyCliTerms(String(v ?? ''))}`)
    }
  }
}
