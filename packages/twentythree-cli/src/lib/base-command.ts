import { Command, Flags, Interfaces } from '@oclif/core'
import chalk from 'chalk'
import { select } from '@clack/prompts'
import {
  getWorkspaces,
  getActiveWorkspace,
  getWorkspaceForDomain,
  findWorkspace,
  type WorkspaceEntry,
} from '../auth/workspace-config.js'
import { ensureFreshToken } from '../auth/token-refresh.js'
import { createApiClient } from '../api/client.js'

export type BaseFlags<T extends typeof Command> = Interfaces.InferredFlags<
  (typeof BaseCommand)['baseFlags'] & T['flags']
>

export abstract class BaseCommand<T extends typeof Command> extends Command {
  static enableJsonFlag = true

  static baseFlags = {
    workspace: Flags.string({
      char: 'w',
      summary: 'Workspace domain or display name to use for this invocation.',
      helpGroup: 'GLOBAL',
    }),
  }

  protected flags!: BaseFlags<T>
  protected activeWorkspace!: WorkspaceEntry
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected apiClient!: ReturnType<typeof createApiClient>

  public async init(): Promise<void> {
    await super.init()
    const { flags } = await this.parse({
      flags: this.ctor.flags,
      baseFlags: (super.ctor as typeof BaseCommand).baseFlags,
      enableJsonFlag: this.ctor.enableJsonFlag,
      args: this.ctor.args,
      strict: this.ctor.strict,
    })
    this.flags = flags as BaseFlags<T>

    const workspaceFlagValue = (flags as { workspace?: string }).workspace
    let resolved: WorkspaceEntry | null = null

    if (workspaceFlagValue) {
      const result = findWorkspace(workspaceFlagValue, getWorkspaces())
      if (result === null) {
        this.error(`No workspace matching '${workspaceFlagValue}' found — run \`twentythree workspace list\` to see available workspaces`, { exit: 1 })
      } else if (Array.isArray(result)) {
        // Ambiguous match — prompt user to select
        const chosen = await select({
          message: `Multiple workspaces match '${workspaceFlagValue}'. Select one:`,
          options: result.map((w) => ({
            value: w.domain,
            label: `${w.display_name} (${w.domain})`,
          })),
        })
        if (typeof chosen === 'symbol') {
          this.error('Workspace selection cancelled', { exit: 1 })
        }
        resolved = getWorkspaceForDomain(chosen as string)
      } else {
        resolved = result
      }
    } else {
      const activeDomain = getActiveWorkspace()
      if (activeDomain) {
        resolved = getWorkspaceForDomain(activeDomain)
      }
    }

    if (!resolved) {
      this.error(
        'No workspace configured — run `twentythree auth credentials` to set up',
        { exit: 1 },
      )
    }

    this.activeWorkspace = resolved

    // Ensure token is fresh before command runs (no-op if no token or not near expiry)
    if (resolved.bearer_token) {
      const freshToken = await ensureFreshToken(resolved.domain)
      if (freshToken) {
        this.activeWorkspace = { ...resolved, bearer_token: freshToken }
      }
    }

    this.apiClient = createApiClient({
      baseUrl: this.activeWorkspace.api_base_url,
      token: this.activeWorkspace.bearer_token || undefined,
    })
  }

  /**
   * Print the [domain] workspace header in dim style.
   * Call at the top of every command's run() method (AUTH-04).
   */
  protected printWorkspaceHeader(): void {
    this.log(chalk.dim(`[${this.activeWorkspace.domain}]`))
  }
}

/**
 * AuthenticatedCommand extends BaseCommand with an auth guard.
 * Commands requiring a bearer token extend this class instead of BaseCommand.
 * Commands for anonymous-scope endpoints extend BaseCommand directly.
 *
 * Rejects execution with exact AUTH-10 error message when no token is configured.
 */
export abstract class AuthenticatedCommand<T extends typeof Command> extends BaseCommand<T> {
  public async init(): Promise<void> {
    await super.init()
    if (!this.activeWorkspace.bearer_token) {
      this.error(
        'This command requires authentication — run `twentythree auth credentials` to add a bearer token',
        { exit: 1 },
      )
    }
  }
}
