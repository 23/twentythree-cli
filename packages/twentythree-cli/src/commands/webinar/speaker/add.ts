import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { text, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar speaker add command — adds a speaker to a webinar.
 *
 * Interactive fallback (Decision D-2): if --name or --email not provided and
 * not in JSON mode, prompts interactively via @clack/prompts.
 *
 * Threat mitigations:
 *   T-05-07: applyCliTerms() on all error messages
 */
export default class WebinarSpeakerAdd extends AuthenticatedCommand<typeof WebinarSpeakerAdd> {
  static description = 'Add a speaker to a webinar'

  static examples = [
    '<%= config.bin %> webinar speaker add 12345 --name "Jane Doe" --email jane@example.com',
    '<%= config.bin %> webinar speaker add 12345',
    '<%= config.bin %> webinar speaker add 12345 --name "Jane Doe" --email jane@example.com --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    name: Flags.string({
      description: 'Speaker name',
      required: false,
    }),
    email: Flags.string({
      description: 'Speaker email (required for WebRTC speakers)',
      required: false,
    }),
    title: Flags.string({
      description: 'Speaker title or job title',
      required: false,
    }),
    description: Flags.string({
      description: 'Speaker bio or description',
      required: false,
    }),
    'connection-type': Flags.string({
      description: 'Speaker connection type',
      options: ['webrtc', 'gearmode', 'rtmp', 'whip', 'srt', 'url'],
      required: false,
    }),
    'connection-type-pull-url': Flags.string({
      description: 'Pull URL for connection types that support stream pull (whip, url)',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'Webinar ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /live/speaker/add',
    auth_scope: 'write' as const,
    output_shape: { type: 'key-value' as const },
    side_effects: 'creates' as const,
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarSpeakerAdd)
    this.printWorkspaceHeader()

    let name = flags.name
    let email = flags.email

    // Interactive fallback (Decision D-2)
    if (!name && !this.jsonEnabled()) {
      const result = await text({ message: 'Speaker name' })
      if (isCancel(result)) process.exit(EXIT_CANCELLED)
      name = result as string
    }

    if (!name) {
      this.error('--name is required in non-interactive mode', { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: Record<string, unknown> = { live_id: Number(args.id), name }
    if (email !== undefined) body.email = email
    if (flags.title !== undefined) body.title = flags.title
    if (flags.description !== undefined) body.description = flags.description
    if (flags['connection-type'] !== undefined) body.connection_type = flags['connection-type']
    if (flags['connection-type-pull-url'] !== undefined) body.connection_type_pull_url = flags['connection-type-pull-url']

    const { data, error } = await this.apiClient.POST('/live/speaker/add', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const speakerId = (data as any)?.data?.live_speaker_id ?? (data as any)?.live_speaker_id

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Speaker added',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'webinar', id: args.id },
          { resource: 'speaker', id: String(speakerId ?? '') },
        ],
      })
    }

    this.log(chalk.green('Speaker added'))
    if (speakerId) {
      this.log(`ID:    ${speakerId}`)
      this.log(`Admin: https://${this.activeWorkspace.domain}/manage/webinar/${args.id}`)
    }
  }
}
