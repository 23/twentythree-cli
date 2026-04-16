import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * User send-invitation command — sends an invitation email to a user (USR-05).
 *
 * Maps to the POST /user/send-invitation API endpoint.
 */
export default class UserSendInvitation extends AuthenticatedCommand<typeof UserSendInvitation> {
  static description = 'Send an invitation email to a user'

  static examples = [
    '<%= config.bin %> user send-invitation 12345',
    '<%= config.bin %> user send-invitation 12345 --invitation-message "Welcome to the platform!"',
    '<%= config.bin %> user send-invitation 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'invitation-message': Flags.string({
      description: 'Custom invitation message',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'User ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /user/send-invitation',
    auth_scope: 'admin',
    output_shape: { type: 'key-value' },
    side_effects: 'updates',
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(UserSendInvitation)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.POST('/user/send-invitation', {
      body: { user_id: Number(args.id), invitation_message: flags['invitation-message'] } as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Invitation sent to user ${args.id}`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `Invitation sent to user ${args.id}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'user', id: args.id },
        ],
      })
    }
  }
}
