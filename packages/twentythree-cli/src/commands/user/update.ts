import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'

/**
 * User update command — updates an existing user's profile (USR-04).
 *
 * CRITICAL (Pitfall 7): user/update uses multipart/form-data (NOT form-urlencoded)
 * because profile_image is a file field. When profile_image is provided, the
 * bodySerializer FormData pattern is used. When no image is provided, standard
 * form-urlencoded is used.
 *
 * Threat mitigations:
 *   T-08-12: fs.existsSync validates file path before reading; API validates file type server-side
 *   T-08-11: extends AuthenticatedCommand — token presence enforced
 */
export default class UserUpdate extends AuthenticatedCommand<typeof UserUpdate> {
  static description = 'Update a user profile'

  static examples = [
    '<%= config.bin %> user update 12345 --full-name "Alice Smith"',
    '<%= config.bin %> user update 12345 --email alice@example.com',
    '<%= config.bin %> user update 12345 --profile-image ./avatar.jpg',
    '<%= config.bin %> user update 12345 --json',
  ]

  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    email: Flags.string({
      description: 'New email address',
      required: false,
    }),
    'full-name': Flags.string({
      description: 'New full display name',
      required: false,
    }),
    password: Flags.string({
      description: 'New password',
      required: false,
    }),
    'profile-image': Flags.string({
      description: 'Path to profile image file',
      required: false,
    }),
  }

  static args = {
    id: Args.string({ description: 'User ID', required: true }),
  }

  static agentMetadata = {
    api_endpoint: 'POST /user/update',
    auth_scope: 'admin',
    output_shape: { type: 'key-value' },
    side_effects: 'updates',
  }

  public async run(): Promise<void | object> {
    const { args, flags } = await this.parse(UserUpdate)
    this.printWorkspaceHeader()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: Record<string, any> = { user_id: Number(args.id) }

    if (flags.email !== undefined) body.email = flags.email
    if (flags['full-name'] !== undefined) body.full_name = flags['full-name']
    if (flags.password !== undefined) body.password = flags.password

    let useMultipart = false

    if (flags['profile-image'] !== undefined) {
      const imgPath = path.resolve(flags['profile-image'])
      // T-08-12: Validate file exists before reading
      if (!fs.existsSync(imgPath)) {
        this.error(`File not found: ${imgPath}`, { exit: EXIT_ERROR })
      }
      const fileName = path.basename(imgPath)
      const fileBuffer = fs.readFileSync(imgPath)
      const fileBlob = new Blob([fileBuffer])
      body.profile_image = { blob: fileBlob, fileName }
      useMultipart = true
    }

    let data: unknown
    let error: unknown

    if (useMultipart) {
      // CRITICAL (Pitfall 7): profile_image requires multipart/form-data
      const result = await this.apiClient.POST('/user/update', {
        body: body as any,
        bodySerializer(b) {
          const fd = new FormData()
          for (const [k, v] of Object.entries(b as Record<string, unknown>)) {
            if (v !== undefined) {
              if (k === 'profile_image' && typeof v === 'object' && v !== null && 'blob' in v) {
                const { blob, fileName: fn } = v as { blob: Blob; fileName: string }
                fd.append(k, blob, fn)
              } else if (v instanceof Blob) {
                fd.append(k, v)
              } else {
                fd.append(k, String(v))
              }
            }
          }
          return fd
        },
      })
      data = result.data
      error = result.error
    } else {
      // Standard form-urlencoded for non-file updates
      const result = await this.apiClient.POST('/user/update', {
        body: body as any,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      data = result.data
      error = result.error
    }

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    this.log(chalk.green(`User ${args.id} updated`))

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data,
        summary: `User ${args.id} updated`,
        breadcrumbs: [
          { domain: this.activeWorkspace.domain },
          { resource: 'user', id: args.id },
        ],
      })
    }
  }
}
