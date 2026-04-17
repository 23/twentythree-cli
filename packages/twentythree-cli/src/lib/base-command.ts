import { Command, Flags, Interfaces } from '@oclif/core'
import chalk from 'chalk'
import * as p from '@clack/prompts'
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

export interface AgentMetadata {
  api_endpoint: string
  auth_scope: 'anonymous' | 'none' | 'read' | 'write' | 'admin' | 'super'
  output_shape: { type: 'table'; columns: string[] } | { type: 'key-value' } | { type: 'none' }
  side_effects: 'none' | 'destructive' | 'creates' | 'updates'
}

export abstract class BaseCommand<T extends typeof Command> extends Command {
  static enableJsonFlag = true

  static baseFlags = {
    workspace: Flags.string({
      char: 'w',
      summary: 'Workspace domain or display name to use for this invocation.',
      helpGroup: 'GLOBAL',
    }),
    agent: Flags.boolean({
      description: 'Output machine-readable command metadata for AI agent consumption',
      helpGroup: 'GLOBAL',
      hidden: true,
    }),
  }

  protected flags!: BaseFlags<T>
  protected activeWorkspace!: WorkspaceEntry
  /** Base URL with /api/2/ appended — use this when constructing URLs outside of openapi-fetch (e.g. chunked upload) */
  protected apiBaseUrl!: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected apiClient!: ReturnType<typeof createApiClient>

  public async init(): Promise<void> {
    await super.init()

    // Handle --agent flag before workspace resolution (D-2)
    // Check raw argv since flags haven't been parsed yet at this point
    if (process.argv.includes('--agent')) {
      const ctor = this.ctor as any
      const flagDefs = ctor.flags ?? {}
      const agentMeta: AgentMetadata | undefined = ctor.agentMetadata

      // Build flags array from oclif flag definitions
      const flagsArr = Object.entries(flagDefs)
        .filter(([name]) => !['workspace', 'agent', 'json'].includes(name))
        .map(([name, def]: [string, any]) => ({
          name,
          type: def.type ?? 'string',
          required: def.required ?? false,
          default: def.default ?? null,
          description: def.description ?? def.summary ?? '',
        }))

      const output = {
        command: this.id,
        description: ctor.description ?? '',
        flags: flagsArr,
        examples: (ctor.examples ?? []).map((e: any) => typeof e === 'string' ? e : e?.command ?? String(e)),
        api_endpoint: agentMeta?.api_endpoint ?? null,
        auth_scope: agentMeta?.auth_scope ?? 'read',
        output_shape: agentMeta?.output_shape ?? { type: 'none' },
        side_effects: agentMeta?.side_effects ?? 'none',
      }

      process.stdout.write(JSON.stringify(output, null, 2) + '\n')
      process.exit(0)
    }

    // NOTE: Intentional double-parse — init() parses here to resolve --workspace early,
    // and each subcommand's run() calls this.parse(SubcommandClass) again.
    // This is safe in this codebase because no flags have parse-time side effects
    // (no dynamic defaults, no prompting in flag definitions). The --agent raw argv
    // workaround above exists precisely because flags haven't been parsed at init() time
    // before this call. If any flag ever gains a side-effecting default or parse hook,
    // revisit by storing parsed flags on `this` during init() and reusing them in run().
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
        const chosen = await p.select({
          message: `Multiple workspaces match '${workspaceFlagValue}'. Select one:`,
          options: result.map((w) => ({
            value: w.domain,
            label: `${w.display_name} (${w.domain})`,
          })),
        })
        if (typeof chosen === 'symbol') {
          this.error('Workspace selection cancelled', { exit: 1 })
        }
        const found = getWorkspaceForDomain(chosen as string)
        if (!found) {
          this.error(`Workspace '${chosen}' could not be resolved — try running \`twentythree workspace list\``, { exit: 1 })
        }
        resolved = found
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

    // api_base_url is the workspace domain root (e.g. "https://company.video23.com/").
    // All API endpoints live under /api/2/ — append it here so every command's paths
    // (e.g. "/photo/list") resolve correctly without each command knowing the prefix.
    this.apiBaseUrl = this.activeWorkspace.api_base_url.replace(/\/?$/, '/') + 'api/2/'
    this.apiClient = createApiClient({
      baseUrl: this.apiBaseUrl,
      token: this.activeWorkspace.bearer_token || undefined,
    })
  }

  public async catch(err: Error & { parse?: { input?: { flags?: Record<string, { description?: string; summary?: string }> } } }): Promise<void> {
    // Non-TTY guard (D-03): CI, pipes, agent mode — re-throw unchanged
    if (!process.stdin.isTTY) {
      return super.catch(err)
    }

    // Only intercept FailedFlagValidationError — the class is not exported from
    // @oclif/core's public API, so use constructor.name instead of instanceof.
    if (err.constructor.name !== 'FailedFlagValidationError') {
      return super.catch(err)
    }

    // Extract all missing flag names from error message.
    // Verified format (oclif/core@4.10.5 lib/parser/validate.js):
    //   "The following error(s) occurred:\n  Missing required flag {name}\n..."
    const flagNames = [...err.message.matchAll(/Missing required flag ([^\n]+)/g)].map(m => m[1])
    if (flagNames.length === 0) {
      return super.catch(err)
    }

    // Flag definitions (description, summary) live on the error's parse property
    const inputFlags = (err as any).parse?.input?.flags ?? {}

    p.intro('Missing required input')
    const extraArgv: string[] = []
    for (const flagName of flagNames) {
      const flagDef = inputFlags[flagName]
      const label = flagDef?.description ?? flagDef?.summary ?? flagName
      const value = await p.text({ message: label })
      if (p.isCancel(value)) {
        p.cancel('Cancelled')
        process.exit(0)
      }
      extraArgv.push(`--${flagName}`, value as string)
    }
    p.outro('Running command...')

    // Re-invoke with original argv + collected values.
    // this.argv preserves flags the user DID provide (e.g. --workspace, --json).
    const newArgv = [...(this.argv ?? []), ...extraArgv]
    await this.config.runCommand(this.id!, newArgv)
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

  /**
   * Fetch the API token for a video by ID.
   * Required by endpoints (e.g. section/list, subtitle/list) that demand a real token param.
   * Throws a user-friendly error if the video is not found.
   */
  protected async fetchVideoToken(videoId: string | number): Promise<string> {
    const { data, error } = await this.apiClient.GET('/photo/list', {
      params: { query: { photo_id: Number(videoId), include_unpublished_p: '1' } },
    })
    if (error) {
      this.error(`Could not look up video ${videoId}: ${error}`, { exit: 1 })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    const video = Array.isArray(resp?.data) ? resp.data[0] : resp?.data
    if (!video?.token) {
      this.error(`Video ${videoId} not found or has no token`, { exit: 1 })
    }
    return video.token as string
  }

  /**
   * Fetch the API token for a webinar by ID.
   * Required by Phase 5 webinar endpoints that demand a real token param.
   * Mirrors fetchVideoToken but calls /live/list instead of /photo/list.
   * Throws a user-friendly error if the webinar is not found.
   */
  protected async fetchWebinarToken(webinarId: string | number): Promise<string> {
    const { data, error } = await this.apiClient.GET('/live/list', {
      params: { query: { live_id: Number(webinarId) } },
    })
    if (error) {
      this.error(`Could not look up webinar ${webinarId}: ${error}`, { exit: 1 })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    const webinar = Array.isArray(resp?.data) ? resp.data[0] : resp?.data
    if (!webinar?.token) {
      this.error(`Webinar ${webinarId} not found or has no token`, { exit: 1 })
    }
    return webinar.token as string
  }
}
