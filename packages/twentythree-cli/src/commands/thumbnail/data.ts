import { Args, Flags } from '@oclif/core'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Thumbnail template data command — retrieves the Liquid render data for a template + object.
 *
 * Maps to GET /thumbnail/template/data.
 * Returns complex nested JSON (workspace, theme, brand tokens, object data) — not suitable
 * for key-value output. Outputs raw JSON.stringify instead.
 *
 * Threat mitigations:
 *   T-08-09: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class ThumbnailData extends AuthenticatedCommand<typeof ThumbnailData> {
  static description = 'Get Liquid render data for a thumbnail template and object'

  static examples = [
    '<%= config.bin %> thumbnail data 42 --object-id 12345',
    '<%= config.bin %> thumbnail data 42 --object-id 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'object-id': Flags.string({
      description: 'Object ID to get template data for',
      required: true,
    }),
  }

  static args = {
    id: Args.string({ description: 'Thumbnail template ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'GET /thumbnail/template/data',
    auth_scope: 'read' as const,
    output_shape: {
      type: 'key-value' as const,
    },
    side_effects: 'none' as const,
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(ThumbnailData)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/thumbnail/template/data', {
      params: {
        query: {
          thumbnail_template_id: Number(args.id),
          object_id: Number(flags['object-id']),
        },
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: resp?.data ?? resp,
        summary: `Thumbnail template ${args.id} data for object ${flags['object-id']}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'thumbnail', id: args.id },
        ],
      })
    }

    // Non-JSON output: raw JSON.stringify — nested object not suitable for key-value
    this.log(JSON.stringify(resp?.data ?? resp, null, 2))
  }
}
