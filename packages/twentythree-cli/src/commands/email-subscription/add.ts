import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

export const EMAIL_SUBSCRIPTION_FREQUENCIES = ['instant', 'four_hours', 'twelve_hours', 'daily', 'weekly'] as const

/**
 * Email subscription add command — subscribes an address to a digest of new
 * videos published on the workspace.
 *
 * Maps to POST /email-subscription/add. An existing workspace-wide subscription
 * for the same address is replaced by the new one.
 */
export default class EmailSubscriptionAdd extends AuthenticatedCommand<typeof EmailSubscriptionAdd> {
  static description = 'Subscribe an email address to a digest of new videos'

  static examples = [
    '<%= config.bin %> email-subscription add --email anna@example.com',
    '<%= config.bin %> email-subscription add --email anna@example.com --frequency weekly --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    email: Flags.string({
      description: 'Email address to subscribe',
      required: true,
    }),
    frequency: Flags.string({
      description: 'How often the subscriber receives a digest of new videos',
      options: [...EMAIL_SUBSCRIPTION_FREQUENCIES],
      default: 'daily',
    }),
    fields: Flags.string({
      description: 'Comma-separated list of fields to return in the API response',
      required: false,
    }),
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'POST /email-subscription/add',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'creates' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(EmailSubscriptionAdd)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.POST('/email-subscription/add', {
      body: {
        email: flags.email,
        frequency: flags.frequency,
        fields: flags.fields,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sub = (data as any)?.data ?? {}
    const id = sub.photo_subscription_id

    this.log(chalk.green('Email subscription added'))
    this.log(`ID:        ${id ?? ''}`)
    this.log(`Email:     ${sub.email ?? flags.email}`)
    this.log(`Scope:     ${sub.object_pretty ?? ''}`)
    this.log(`Frequency: ${sub.frequency ?? flags.frequency}`)

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: sub,
        summary: `Email subscription added for ${sub.email ?? flags.email}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'email-subscription', id: id !== undefined ? String(id) : undefined },
        ],
      })
    }
  }
}
