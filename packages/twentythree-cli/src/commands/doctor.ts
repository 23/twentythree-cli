import { Command } from '@oclif/core'
import Table from 'cli-table3'
import chalk from 'chalk'
import { getActiveWorkspace, getWorkspaceForDomain } from '../auth/workspace-config.js'
import { createApiClient } from '../api/client.js'
import { permissionBelow } from '../lib/base-command.js'

export default class Doctor extends Command {
  static description = 'Check CLI credentials, connectivity, and token validity'
  static examples = ['<%= config.bin %> doctor', '<%= config.bin %> doctor --json']
  static enableJsonFlag = true
  static flags = {}

  public async run(): Promise<void | object> {
    const checks: { name: string; passed: boolean; detail: string }[] = []

    // Check 1: Credentials stored
    let domain: string | undefined
    let ws: ReturnType<typeof getWorkspaceForDomain> = null

    try {
      domain = getActiveWorkspace()
      if (!domain) {
        checks.push({ name: 'Credentials stored', passed: false, detail: 'No workspace configured' })
      } else {
        ws = getWorkspaceForDomain(domain)
        if (!ws) {
          checks.push({ name: 'Credentials stored', passed: false, detail: 'No workspace configured' })
        } else if (!ws.bearer_token) {
          checks.push({ name: 'Credentials stored', passed: false, detail: 'No bearer token stored' })
        } else {
          checks.push({ name: 'Credentials stored', passed: true, detail: domain })
        }
      }
    } catch {
      checks.push({ name: 'Credentials stored', passed: false, detail: 'Error reading credentials' })
    }

    const credentialsPassed = checks[0].passed

    // Check 2: Connectivity (only run if check 1 passed)
    if (!credentialsPassed) {
      checks.push({ name: 'Connectivity', passed: false, detail: 'Skipped (no credentials)' })
    } else {
      const baseUrl = ws!.api_base_url.replace(/\/?$/, '/')
      try {
        const resp = await fetch(baseUrl, { method: 'HEAD', signal: AbortSignal.timeout(10000) })
        // Accept any HTTP response as proof of connectivity — the host is reachable
        // regardless of status code; token validity is checked separately in check 3
        checks.push({ name: 'Connectivity', passed: true, detail: `${domain!} (HTTP ${resp.status})` })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Connection failed'
        checks.push({ name: 'Connectivity', passed: false, detail: message })
      }
    }

    const connectivityPassed = checks[1].passed

    // Check 3: Token valid (only run if check 2 passed)
    if (!connectivityPassed) {
      checks.push({ name: 'Token valid', passed: false, detail: 'Skipped (no connectivity)' })
    } else {
      const baseUrl = ws!.api_base_url.replace(/\/?$/, '/')
      const apiBaseUrl = baseUrl + 'api/2/'
      const client = createApiClient({ baseUrl: apiBaseUrl, token: ws!.bearer_token })
      const { data, error } = await client.GET('/photo/list', { params: { query: { size: 1 } } })
      if (error) {
        const status = (error as { status?: string | number; code?: string | number })?.status
          ?? (error as { status?: string | number; code?: string | number })?.code
          ?? 'unknown'
        const message = (error as { message?: string })?.message ?? 'Unauthorized'
        checks.push({ name: 'Token valid', passed: false, detail: `${status} ${message}` })
      } else {
        // Every API response carries the caller's permission level; show it so a
        // read-only login is visible here rather than at the first refused write.
        const level = (data as { permission_level?: string } | undefined)?.permission_level
        const detail = level
          ? permissionBelow(level, 'write')
            ? `Authenticated, ${level}-only (create/update/delete commands will be refused)`
            : `Authenticated, ${level}`
          : 'Authenticated'
        checks.push({ name: 'Token valid', passed: true, detail })
      }
    }

    const allPassed = checks.every(c => c.passed)

    if (this.jsonEnabled()) {
      return { ok: allPassed, checks }
    }

    const table = new Table({
      head: ['Check', 'Status', 'Detail'],
      style: { head: ['cyan'] },
      colWidths: [25, 10, 50],
    })
    for (const check of checks) {
      table.push([
        check.name,
        check.passed ? chalk.green('\u2713 OK') : chalk.red('\u2717 FAIL'),
        check.detail,
      ])
    }
    this.log(table.toString())
    if (!allPassed) process.exit(1)
  }
}
