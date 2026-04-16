import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, parseBoolParam, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Category create command — creates a new category in the active workspace.
 *
 * Maps to the /album/create API endpoint.
 * "album" is the API term; "category" is the CLI user-facing term (term-map.ts).
 *
 * Threat mitigations:
 *   T-04-04: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class CategoryCreate extends AuthenticatedCommand<typeof CategoryCreate> {
  static description = 'Create a new category'

  static agentMetadata = {
    api_endpoint: 'POST /album/create',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'creates' as const,
  }

  static examples = [
    '<%= config.bin %> category create --title "My Category"',
    '<%= config.bin %> category create --title "My Category" --json',
    '<%= config.bin %> category create --title "Hidden Category" --hidden',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    title: Flags.string({
      description: 'Title for the new category',
      required: true,
    }),
    description: Flags.string({
      description: 'Description for the new category',
      required: false,
    }),
    hidden: Flags.boolean({
      description: 'Create as hidden category',
      allowNo: true,
      required: false,
    }),
    'hide-p': Flags.string({ hidden: true, required: false }),
  }

  static args = {}

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(CategoryCreate)
    this.printWorkspaceHeader()

    const body: Record<string, unknown> = { title: flags.title }

    if (flags.description !== undefined) {
      body.description = flags.description
    }

    const hiddenVal = parseBoolParam(flags.hidden, flags['hide-p'])
    if (hiddenVal !== undefined) {
      body.hide_p = hiddenVal ? 1 : 0
    }

    const { data: createData, error: createError } = await this.apiClient.POST('/album/create', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (createError) {
      this.error(applyCliTerms(formatApiError(createError)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const albumId = (createData as any)?.data?.album_id

    this.log(chalk.green('Category created'))
    this.log(`ID:    ${albumId}`)

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: createData,
        summary: 'Category created',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'category', id: String(albumId) },
        ],
      })
    }
  }
}
