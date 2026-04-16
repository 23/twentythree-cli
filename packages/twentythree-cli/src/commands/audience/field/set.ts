import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Audience field set command — create or update a custom audience field (AUD-12).
 *
 * POST form mutation. key, type, and label are all required per spec.
 * 3-level oclif topic via directory structure (audience/field/set.ts).
 */
export default class AudienceFieldSet extends AuthenticatedCommand<typeof AudienceFieldSet> {
  static description = 'Create or update a custom audience field'

  static agentMetadata = {
    api_endpoint: 'POST /audience/field/set',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'updates' as const,
  }

  static examples = [
    '<%= config.bin %> audience field set --key "department" --type text --label "Department"',
    '<%= config.bin %> audience field set --key "tier" --type enum --label "Customer Tier" --options "free;pro;enterprise"',
    '<%= config.bin %> audience field set --key "score" --type number --label "NPS Score" --priority 1 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    key: Flags.string({
      description: 'Unique field key',
      required: true,
    }),
    type: Flags.string({
      description: 'Field type (use audience field types to list valid values)',
      required: true,
    }),
    label: Flags.string({
      description: 'Human-readable label',
      required: true,
    }),
    options: Flags.string({
      description: 'Semicolon-separated options (for enumerable types)',
      required: false,
    }),
    priority: Flags.integer({
      description: 'Display order priority',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AudienceFieldSet)
    this.printWorkspaceHeader()

    const body: Record<string, unknown> = {
      key: flags.key,
      type: flags.type,
      label: flags.label,
    }
    if (flags.options !== undefined) body.options = flags.options
    if (flags.priority !== undefined) body.priority = flags.priority

    const { data, error } = await this.apiClient.POST('/audience/field/set', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green('Field saved'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Field saved',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'audience' },
        ],
      })
    }
  }
}
