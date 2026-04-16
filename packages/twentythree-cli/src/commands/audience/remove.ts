import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { confirm } from '@clack/prompts'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Audience remove command — permanently remove an audience contact (AUD-05).
 *
 * DESTRUCTIVE: Requires confirmation prompt before executing (T-07-08 mitigation).
 * JSON mode skips confirmation (automation use case).
 *
 * POST form mutation. No required body fields per spec.
 */
export default class AudienceRemove extends AuthenticatedCommand<typeof AudienceRemove> {
  static description = 'Permanently remove an audience contact'

  static agentMetadata = {
    api_endpoint: 'POST /audience/remove',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'destructive' as const,
  }

  static examples = [
    '<%= config.bin %> audience remove --email "jane@example.com"',
    '<%= config.bin %> audience remove --uuid "abc-def-ghi"',
    '<%= config.bin %> audience remove --email "user@co.com" --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    email: Flags.string({
      description: 'Contact email address',
      required: false,
    }),
    uuid: Flags.string({
      description: 'Contact UUID',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AudienceRemove)
    this.printWorkspaceHeader()

    // T-07-08 mitigation: Confirmation required before destructive action.
    // JSON mode skips confirmation (automation use case).
    if (!this.jsonEnabled()) {
      const confirmed = await confirm({
        message: `Permanently remove contact from ${this.activeWorkspace.domain}? This cannot be undone.`,
      })
      if (!confirmed || typeof confirmed === 'symbol') {
        this.log('Cancelled.')
        this.exit(EXIT_CANCELLED)
      }
    }

    const body: Record<string, unknown> = {}
    if (flags.email !== undefined) body.email = flags.email
    if (flags.uuid !== undefined) body.uuid = flags.uuid

    const { data, error } = await this.apiClient.POST('/audience/remove', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green('Contact removed'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Contact removed',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'audience' },
        ],
      })
    }
  }
}
