import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

/**
 * Webinar speaker update command — updates fields on an existing speaker.
 *
 * CRITICAL: uses live_speaker_id (the speaker ID), NOT live_id.
 * Only fields explicitly provided are included in the body — prevents clearing unset fields.
 *
 * Threat mitigations:
 *   T-05-07: applyCliTerms() on all error messages
 */
export default class WebinarSpeakerUpdate extends AuthenticatedCommand<typeof WebinarSpeakerUpdate> {
  static description = 'Update a speaker on a webinar'

  static examples = [
    '<%= config.bin %> webinar speaker update 12345 9900 --name "Jane Doe"',
    '<%= config.bin %> webinar speaker update 12345 9900 --email jane@example.com --title "CTO"',
    '<%= config.bin %> webinar speaker update 12345 9900 --name "Jane Doe" --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    name: Flags.string({
      description: 'Speaker name',
      required: false,
    }),
    email: Flags.string({
      description: 'Speaker email',
      required: false,
    }),
    title: Flags.string({
      description: 'Speaker title or job title',
      required: false,
    }),
    bio: Flags.string({
      description: 'Speaker bio shown in the UI',
      required: false,
    }),
    description: Flags.string({
      description: 'Alias for --bio (sets the speaker bio shown in the UI)',
      required: false,
    }),
    company: Flags.string({
      description: 'Speaker company / organization',
      required: false,
    }),
    website: Flags.string({
      description: 'Speaker website URL',
      required: false,
    }),
    linkedin: Flags.string({
      description: 'Speaker LinkedIn URL or handle',
      required: false,
    }),
    facebook: Flags.string({
      description: 'Speaker Facebook URL or handle',
      required: false,
    }),
    twitter: Flags.string({
      description: 'Speaker Twitter/X handle',
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
    webinarId: Args.string({ description: 'Webinar ID', required: true }),
    id: Args.string({ description: 'Speaker ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /live/speaker/update',
    auth_scope: 'write' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'updates' as const,
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(WebinarSpeakerUpdate)
    this.printWorkspaceHeader()

    const body: Record<string, unknown> = { live_id: Number(args.webinarId), live_speaker_id: Number(args.id) }
    if (flags.name !== undefined) body.name = flags.name
    if (flags.email !== undefined) body.email = flags.email
    if (flags.title !== undefined) body.title = flags.title
    // CRITICAL: the speaker bio is the API field `bio`, NOT `description` (which the
    // API ignores). --description is kept as a back-compat alias for --bio.
    const bio = flags.bio ?? flags.description
    if (bio !== undefined) body.bio = bio
    if (flags.company !== undefined) body.company = flags.company
    if (flags.website !== undefined) body.link = flags.website
    if (flags.linkedin !== undefined) body.linkedin = flags.linkedin
    if (flags.facebook !== undefined) body.facebook = flags.facebook
    if (flags.twitter !== undefined) body.twitter = flags.twitter
    if (flags['connection-type'] !== undefined) body.connection_type = flags['connection-type']
    if (flags['connection-type-pull-url'] !== undefined) body.connection_type_pull_url = flags['connection-type-pull-url']

    const { data, error } = await this.apiClient.POST('/live/speaker/update', {
      body: body as any,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: 'Speaker updated',
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'speaker', id: args.id },
        ],
      })
    }

    this.log(chalk.green('Speaker updated'))
  }
}
