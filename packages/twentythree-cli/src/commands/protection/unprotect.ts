import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { confirm, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Protection unprotect command — removes content protection after confirmation (PRT-02).
 *
 * Pattern C: POST destructive with confirmation prompt.
 *
 * Threat mitigations:
 *   T-08-14: confirm() prompt includes workspace domain before removing access control
 *   T-08-16: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class ProtectionUnprotect extends AuthenticatedCommand<typeof ProtectionUnprotect> {
  static description = 'Remove protection from content'

  static examples = [
    '<%= config.bin %> protection unprotect',
    '<%= config.bin %> protection unprotect --object-id 12345',
    '<%= config.bin %> protection unprotect --object-id 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'object-id': Flags.string({
      description: 'Object ID to remove protection from',
      required: false,
    }),
  }

  static args = {}

  static agentMetadata = {
    api_endpoint: 'POST /protection/unprotect',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'destructive' as const,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(ProtectionUnprotect)

    this.printWorkspaceHeader()

    if (!this.jsonEnabled()) {
      // T-08-14: Confirmation prompt includes workspace domain so user knows the scope
      const confirmed = await confirm({
        message: `Remove protection${flags['object-id'] ? ` from object ${flags['object-id']}` : ''} on ${this.activeWorkspace.domain}? This will expose the content.`,
      })

      if (isCancel(confirmed) || !confirmed) {
        process.exit(EXIT_CANCELLED)
      }
    }

    const body: Record<string, unknown> = {}
    if (flags['object-id'] !== undefined) body.object_id = flags['object-id']

    const { data: unprotectData, error: unprotectError } = await this.apiClient.POST('/protection/unprotect', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (unprotectError) {
      this.error(applyCliTerms(formatApiError(unprotectError)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green('Protection removed'))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: unprotectData,
        summary: 'Protection removed',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'protection' },
        ],
      })
    }
  }
}
