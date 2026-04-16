import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Player embed-versions command — lists available embed versions for an object.
 *
 * Returns embed codes and share links across multiple platforms (web players, email clients).
 * Requires --object-type (photo|live|album|site) and --object-id.
 */
export default class PlayerEmbedVersions extends AuthenticatedCommand<typeof PlayerEmbedVersions> {
  static description = 'List available embed versions for an object'

  static agentMetadata = {
    api_endpoint: 'GET /player/embed-versions',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['Type', 'Key', 'Label'] },
    side_effects: 'none' as const,
  }

  static examples = [
    '<%= config.bin %> player embed-versions --object-type photo --object-id 123',
    '<%= config.bin %> player embed-versions --object-type live --object-id 456 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'object-type': Flags.string({
      description: 'Object type: photo, live, album, or site',
      required: true,
    }),
    'object-id': Flags.string({
      description: 'Object ID',
      required: true,
    }),
    source: Flags.string({
      description: 'Embed source parameter (e.g. embed, share)',
      required: false,
    }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(PlayerEmbedVersions)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/player/embed-versions', {
      params: {
        query: {
          object_type: flags['object-type'],
          object_id: Number(flags['object-id']),
          source: flags.source,
        },
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = data as any
    const items: unknown[] = Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: items,
        summary: `${items.length} embed version${items.length === 1 ? '' : 's'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'player' },
        ],
      })
    }

    if (items.length === 0) {
      this.log('No embed versions found.')
      return
    }

    const headers = ['Type', 'Key', 'Label']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = items.map((v: any) => [
      applyCliTerms(String(v.type ?? '')),
      String(v.key ?? ''),
      String(v.label ?? ''),
    ])

    const table = renderTable(headers, rows)
    this.log(table.toString())
    this.log(chalk.dim(`${items.length} embed version${items.length === 1 ? '' : 's'}`))
  }
}
