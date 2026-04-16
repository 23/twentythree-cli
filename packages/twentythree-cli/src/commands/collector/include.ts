import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Collector include command — attaches a collector (lead capture form) to an object (video/webinar).
 * IMPORTANT: Uses GET (not POST) and the parameter is action_id (not collector_id).
 */
export default class CollectorInclude extends AuthenticatedCommand<typeof CollectorInclude> {
  static description = 'Attach a collector to a video or webinar'

  static agentMetadata = {
    api_endpoint: 'GET /collector/include',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'none' as const,
  }

  static examples = [
    '<%= config.bin %> collector include 456 --object-id 123',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'object-id': Flags.string({
      description: 'ID of the video or webinar to attach the collector to',
      required: true,
    }),
  }

  static args = {
    id: Args.string({
      description: 'Collector action ID',
      required: true,
    }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(CollectorInclude)
    this.printWorkspaceHeader()

    // CRITICAL: Collectors are a subtype of actions; the param is action_id not collector_id
    const { data, error } = await this.apiClient.GET('/collector/include', {
      params: {
        query: {
          action_id: Number(args.id),
          object_id: Number(flags['object-id']),
        },
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Collector included',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'collector' },
          { id: args.id },
        ],
      })
    }

    this.log(chalk.green('Collector included'))
  }
}
