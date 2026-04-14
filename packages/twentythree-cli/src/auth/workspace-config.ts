import Conf from 'conf'

export interface WorkspaceEntry {
  domain: string
  display_name: string
  bearer_token: string
  expiration_time: string  // ISO 8601 string, e.g. "2026-05-14T12:00:00Z"
  api_base_url: string     // with trailing slash, e.g. "https://company.video23.com/"
  site_name: string
  canonical_user_p: boolean
  starred_p: boolean
}

interface CliConfig {
  activeDomain: string | undefined
  credentialDomain: string | undefined  // login domain whose keychain entry is used to refresh workspace tokens
  workspaces: WorkspaceEntry[]
}

const config = new Conf<CliConfig>({
  projectName: 'twentythree-cli',
  defaults: {
    activeDomain: undefined,
    credentialDomain: undefined,
    workspaces: [],
  },
})

export function getWorkspaces(): WorkspaceEntry[] {
  return config.get('workspaces')
}

export function setWorkspaces(workspaces: WorkspaceEntry[]): void {
  config.set('workspaces', workspaces)
}

export function getActiveWorkspace(): string | undefined {
  return config.get('activeDomain')
}

export function setActiveWorkspace(domain: string): void {
  config.set('activeDomain', domain)
}

export function getWorkspaceForDomain(domain: string): WorkspaceEntry | null {
  const workspaces = getWorkspaces()
  return workspaces.find(w => w.domain === domain) ?? null
}

export function findWorkspace(
  query: string,
  workspaces: WorkspaceEntry[]
): WorkspaceEntry | WorkspaceEntry[] | null {
  // Exact domain match takes precedence (per CONTEXT.md locked decision)
  const exactDomain = workspaces.find(
    w => w.domain.toLowerCase() === query.toLowerCase()
  )
  if (exactDomain) return exactDomain

  // Partial display name or domain contains match (case-insensitive)
  const matches = workspaces.filter(
    w =>
      w.display_name.toLowerCase().includes(query.toLowerCase()) ||
      w.domain.toLowerCase().includes(query.toLowerCase())
  )
  if (matches.length === 1) return matches[0]
  if (matches.length > 1) return matches
  return null
}

export function getCredentialDomain(): string | undefined {
  return config.get('credentialDomain')
}

export function setCredentialDomain(domain: string): void {
  config.set('credentialDomain', domain)
}

/** Get the conf file path (needed for file locking in token refresh) */
export function getConfigPath(): string {
  return config.path
}

/** Clear all config (for testing) */
export function clearConfig(): void {
  config.clear()
}
