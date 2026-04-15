import { Args, Flags } from '@oclif/core'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, renderTable, parseBoolParam, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar attachment list command — lists all attachments for a webinar.
 *
 * Token is auto-looked up via fetchWebinarToken if not supplied via --token.
 *
 * Threat mitigations:
 *   T-05-03: applyCliTerms() on all error messages — no 'live'/'photo'/'album' leaks
 */
export default class WebinarAttachmentList extends AuthenticatedCommand<typeof WebinarAttachmentList> {
  static description = 'List attachments for a webinar'

  static examples = [
    '<%= config.bin %> webinar attachment list 12345',
    '<%= config.bin %> webinar attachment list 12345 --json',
    '<%= config.bin %> webinar attachment list 12345 --include-hidden',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    token: Flags.string({
      description: 'Webinar token (auto-looked up if omitted)',
      required: false,
    }),
    'include-hidden': Flags.boolean({
      description: 'Include hidden attachments',
      allowNo: true,
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarAttachmentList)
    this.printWorkspaceHeader()

    const webinarId = Number(args.id)
    const token = flags.token ?? await this.fetchWebinarToken(webinarId)

    const { data, error } = await this.apiClient.GET('/live/attachment/list', {
      params: {
        query: {
          live_id: webinarId,
          token,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          include_hidden_p: parseBoolParam(flags['include-hidden'], undefined) as any ?? undefined,
        },
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attachments: any[] = (data as any)?.attachments ?? (data as any)?.data ?? []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: attachments,
        summary: `${attachments.length} attachment${attachments.length === 1 ? '' : 's'}`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
          { resource: 'attachment' },
        ],
      })
    }

    if (attachments.length === 0) {
      this.log('No attachments found.')
      return
    }

    const table = renderTable(
      ['Filename', 'Size', 'Hidden'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      attachments.map((a: any) => [
        String(a.filename ?? ''),
        String(a.filesize ?? ''),
        a.hidden_p ? 'yes' : 'no',
      ]),
    )

    this.log(table.toString())
  }
}
