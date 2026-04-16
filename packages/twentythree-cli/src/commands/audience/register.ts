import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Audience register command — register an audience contact (AUD-03).
 *
 * POST form mutation using application/x-www-form-urlencoded body.
 * email is required per the OpenAPI spec.
 */
export default class AudienceRegister extends AuthenticatedCommand<typeof AudienceRegister> {
  static description = 'Register an audience contact'

  static agentMetadata = {
    api_endpoint: 'POST /audience/register',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'creates' as const,
  }

  static examples = [
    '<%= config.bin %> audience register --email "jane@example.com"',
    '<%= config.bin %> audience register --email "john@acme.com" --object-id 123 --firstname "John" --lastname "Doe"',
    '<%= config.bin %> audience register --email "user@co.com" --company "Acme Corp" --source api --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    email: Flags.string({
      description: 'Contact email address',
      required: true,
    }),
    'object-id': Flags.string({
      description: 'Webinar/video ID to register for',
      required: false,
    }),
    uuid: Flags.string({
      description: 'Existing contact UUID',
      required: false,
    }),
    'action-id': Flags.string({
      description: 'Collector action ID',
      required: false,
    }),
    firstname: Flags.string({
      description: 'First name',
      required: false,
    }),
    lastname: Flags.string({
      description: 'Last name',
      required: false,
    }),
    company: Flags.string({
      description: 'Company name',
      required: false,
    }),
    phone: Flags.string({
      description: 'Phone number',
      required: false,
    }),
    'return-url': Flags.string({
      description: 'Base URL for tracking URL',
      required: false,
    }),
    source: Flags.string({
      description: 'Registration source (api, import, site, custom)',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AudienceRegister)
    this.printWorkspaceHeader()

    // Build body with only defined flags (prevents clearing unset fields)
    const body: Record<string, unknown> = { email: flags.email }
    if (flags['object-id'] !== undefined) body.object_id = Number(flags['object-id'])
    if (flags.uuid !== undefined) body.uuid = flags.uuid
    if (flags['action-id'] !== undefined) body.action_id = Number(flags['action-id'])
    if (flags.firstname !== undefined) body.firstname = flags.firstname
    if (flags.lastname !== undefined) body.lastname = flags.lastname
    if (flags.company !== undefined) body.company = flags.company
    if (flags.phone !== undefined) body.phone = flags.phone
    if (flags['return-url'] !== undefined) body.return_url = flags['return-url']
    if (flags.source !== undefined) body.source = flags.source

    const { data, error } = await this.apiClient.POST('/audience/register', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    const uuid = resp?.uuid ?? resp?.data?.uuid
    const trackingUrl = resp?.tracking_url ?? resp?.data?.tracking_url

    this.log(chalk.green('Contact registered'))
    if (uuid) this.log(`UUID:         ${uuid}`)
    if (trackingUrl) this.log(`Tracking URL: ${trackingUrl}`)

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Contact registered',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'audience' },
        ],
      })
    }
  }
}
