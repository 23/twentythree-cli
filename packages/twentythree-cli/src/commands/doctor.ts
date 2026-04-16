import { Command } from '@oclif/core'
import Table from 'cli-table3'
import chalk from 'chalk'
import { getActiveWorkspace, getWorkspaceForDomain } from '../auth/workspace-config.js'
import { createApiClient } from '../api/client.js'

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
        checks.push({ name: 'Connectivity', passed: resp.ok || resp.status < 500, detail: domain! })
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
      const { error } = await client.GET('/photo/list', { params: { query: { size: 1 } } })
      if (error) {
        const status = (error as { status?: string | number; code?: string | number })?.status
          ?? (error as { status?: string | number; code?: string | number })?.code
          ?? 'unknown'
        const message = (error as { message?: string })?.message ?? 'Unauthorized'
        checks.push({ name: 'Token valid', passed: false, detail: `${status} ${message}` })
      } else {
        checks.push({ name: 'Token valid', passed: true, detail: 'Authenticated' })
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
