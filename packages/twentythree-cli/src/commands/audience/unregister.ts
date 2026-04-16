import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Audience unregister command — remove a registration for an audience contact (AUD-04).
 *
 * POST form mutation. --object-id is required per the OpenAPI spec.
 */
export default class AudienceUnregister extends AuthenticatedCommand<typeof AudienceUnregister> {
  static description = 'Remove a registration for an audience contact'

  static examples = [
    '<%= config.bin %> audience unregister --object-id 123 --email "jane@example.com"',
    '<%= config.bin %> audience unregister --object-id 456 --uuid "abc-def-ghi"',
    '<%= config.bin %> audience unregister --object-id 789 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'object-id': Flags.string({
      description: 'Object ID to unregister from',
      required: true,
    }),
    email: Flags.string({
      description: 'Contact email',
      required: false,
    }),
    uuid: Flags.string({
      description: 'Contact UUID',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AudienceUnregister)
    this.printWorkspaceHeader()

    const body: Record<string, unknown> = { object_id: Number(flags['object-id']) }
    if (flags.email !== undefined) body.email = flags.email
    if (flags.uuid !== undefined) body.uuid = flags.uuid

    const { data, error } = await this.apiClient.POST('/audience/unregister', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green('Contact unregistered'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Contact unregistered',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'audience' },
        ],
      })
    }
  }
}
