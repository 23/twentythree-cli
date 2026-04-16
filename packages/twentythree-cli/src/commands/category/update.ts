import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { text, select, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, parseBoolParam, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * Category update command — updates metadata for an existing category.
 *
 * Two modes:
 * - Flag mode: only the flags explicitly provided are sent to the API
 * - Interactive mode: triggered when no metadata flags provided and not --json;
 *   uses @clack/prompts with current values pre-filled
 *
 * Maps to the /album/update API endpoint.
 * "album" is the API term; "category" is the CLI user-facing term (term-map.ts).
 *
 * Threat mitigations:
 *   T-04-01: Validate album_id is numeric (Number.isFinite, > 0) before sending to API
 *   T-04-04: extends AuthenticatedCommand — anonymous mode rejected
 */
export default class CategoryUpdate extends AuthenticatedCommand<typeof CategoryUpdate> {
  static description = 'Update metadata for a category'

  static agentMetadata = {
    api_endpoint: 'POST /album/update',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'updates' as const,
  }

  static examples = [
    '<%= config.bin %> category update 42 --title "New Title"',
    '<%= config.bin %> category update 42 --hidden',
    '<%= config.bin %> category update 42',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    title: Flags.string({
      description: 'New title for the category',
      required: false,
    }),
    description: Flags.string({
      description: 'New description for the category',
      required: false,
    }),
    hidden: Flags.boolean({
      description: 'Show or hide the category',
      allowNo: true,
      required: false,
    }),
    'hide-p': Flags.string({ hidden: true, required: false }),
  }

  static args = {
    id: Args.string({ description: 'Category ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(CategoryUpdate)

    this.printWorkspaceHeader()

    // T-04-01: Validate args.id is numeric before sending to API
    const categoryId = Number(args.id)
    if (!Number.isFinite(categoryId) || categoryId <= 0) {
      this.error(`Invalid category ID: ${args.id}`, { exit: EXIT_ERROR })
    }

    // Detect whether any metadata flags were explicitly provided
    const metadataFlagsProvided = [
      flags.title,
      flags.description,
      flags.hidden,
      flags['hide-p'],
    ].some((v) => v !== undefined)

    const body: Record<string, unknown> = { album_id: categoryId }

    if (!metadataFlagsProvided && !this.jsonEnabled()) {
      // Interactive mode: fetch current category metadata and pre-fill prompts
      const { data, error } = await this.apiClient.GET('/album/list', {
        params: { query: { album_id: categoryId } },
      })

      if (error) {
        this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resp = data as any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any
      if (Array.isArray(resp?.data)) {
        current = resp.data[0]
      } else if (resp?.data) {
        current = resp.data
      }

      if (!current) {
        this.error(`Category ${args.id} not found`, { exit: EXIT_ERROR })
      }

      const titleResult = await text({
        message: 'Title',
        initialValue: current.title ?? '',
        placeholder: 'Category title',
      })
      if (isCancel(titleResult)) process.exit(EXIT_CANCELLED)

      const descriptionResult = await text({
        message: 'Description',
        initialValue: current.description ?? '',
        placeholder: 'Category description',
      })
      if (isCancel(descriptionResult)) process.exit(EXIT_CANCELLED)

      const hiddenResult = await select({
        message: 'Hidden',
        options: [
          { value: 'no', label: 'No — visible' },
          { value: 'yes', label: 'Yes — hidden' },
        ],
        initialValue: current.hide_p ? 'yes' : 'no',
      })
      if (isCancel(hiddenResult)) process.exit(EXIT_CANCELLED)

      body.title = titleResult as string
      body.description = descriptionResult as string
      body.hide_p = hiddenResult === 'yes' ? 1 : 0
    } else {
      // Flag mode: only include flags the user explicitly provided
      if (flags.title !== undefined) body.title = flags.title
      if (flags.description !== undefined) body.description = flags.description
      const hiddenVal = parseBoolParam(flags.hidden, flags['hide-p'])
      if (hiddenVal !== undefined) body.hide_p = hiddenVal ? 1 : 0
    }

    const { data: updateData, error: updateError } = await this.apiClient.POST('/album/update', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (updateError) {
      this.error(applyCliTerms(String(updateError)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`Category ${args.id} updated`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: updateData,
        summary: `Category ${args.id} updated`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'category', id: args.id },
        ],
      })
    }
  }
}
