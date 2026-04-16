import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'
import {
  ANALYTICS_DATE_FLAGS,
  ANALYTICS_FILTER_FLAGS,
} from '../../../lib/analytics-flags.js'

/**
 * Analytics usage storage command — returns current storage usage as a single object.
 *
 * Uses GET /analytics/data/usage/storage.
 * Anomalous: no date params (API silently ignores them), no pagination, single-object response.
 * Per D-3, date flags are exposed for consistency but the API does not use them.
 */
export default class AnalyticsUsageStorage extends AuthenticatedCommand<typeof AnalyticsUsageStorage> {
  static description = 'Get storage usage analytics'

  static examples = [
    '<%= config.bin %> analytics usage storage',
    '<%= config.bin %> analytics usage storage --json',
    '<%= config.bin %> analytics usage storage --selection videos',
  ]

  static enableJsonFlag = true

  // No ANALYTICS_PAGINATION_FLAGS — storage endpoint has no p/size per API spec
  static flags = {
    ...AuthenticatedCommand.baseFlags,
    ...ANALYTICS_DATE_FLAGS,
    ...ANALYTICS_FILTER_FLAGS,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AnalyticsUsageStorage)

    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/analytics/data/usage/storage')

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    const storageData = resp?.data

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: storageData ?? {},
        summary: 'Storage usage data',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'analytics' },
        ],
      })
    }

    if (!storageData || Object.keys(storageData).length === 0) {
      this.log('No storage data found.')
      return
    }

    // Render as key-value pairs — storage returns a single object, not an array (Pitfall 6)
    for (const [key, value] of Object.entries(storageData)) {
      this.log(`${key}: ${value}`)
    }
  }
}
