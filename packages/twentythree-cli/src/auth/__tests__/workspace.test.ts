import { describe, it, expect, beforeEach } from 'vitest'
import {
  getWorkspaces,
  setWorkspaces,
  getActiveWorkspace,
  setActiveWorkspace,
  getWorkspaceForDomain,
  findWorkspace,
  clearConfig,
  type WorkspaceEntry,
} from '../workspace-config.js'

// ── Fixtures ────────────────────────────────────────────────────────────────

function makeWorkspace(overrides: Partial<WorkspaceEntry> = {}): WorkspaceEntry {
  return {
    domain: 'default.video23.com',
    display_name: 'Default Workspace',
    bearer_token: 'tok_default',
    expiration_time: '2026-12-31T23:59:59Z',
    api_base_url: 'https://default.video23.com/',
    site_name: 'default',
    canonical_user_p: true,
    starred_p: false,
    ...overrides,
  }
}

const COMPANY = makeWorkspace({
  domain: 'company.video23.com',
  display_name: 'Company Workspace',
  bearer_token: 'tok_company',
  api_base_url: 'https://company.video23.com/',
  site_name: 'company',
})

const ACME = makeWorkspace({
  domain: 'acme.video23.com',
  display_name: 'Acme Corp',
  bearer_token: 'tok_acme',
  api_base_url: 'https://acme.video23.com/',
  site_name: 'acme',
})

const COMPANY_ACME = makeWorkspace({
  domain: 'company-acme.video23.com',
  display_name: 'Company Acme Joint',
  bearer_token: 'tok_joint',
  api_base_url: 'https://company-acme.video23.com/',
  site_name: 'company-acme',
})

// ── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  clearConfig()
})

// ── Conf storage: workspaces ─────────────────────────────────────────────────

describe('WorkspaceConfig - conf storage', () => {
  it('stores workspace list in conf', () => {
    setWorkspaces([COMPANY, ACME])
    const result = getWorkspaces()
    expect(result).toHaveLength(2)
    expect(result[0].domain).toBe('company.video23.com')
    expect(result[1].domain).toBe('acme.video23.com')
  })

  it('getWorkspaces returns empty array initially', () => {
    expect(getWorkspaces()).toEqual([])
  })

  it('setWorkspaces overwrites previous list', () => {
    setWorkspaces([COMPANY])
    setWorkspaces([ACME])
    const result = getWorkspaces()
    expect(result).toHaveLength(1)
    expect(result[0].domain).toBe('acme.video23.com')
  })

  it('preserves all WorkspaceEntry fields in roundtrip', () => {
    setWorkspaces([COMPANY])
    const [stored] = getWorkspaces()
    expect(stored.domain).toBe(COMPANY.domain)
    expect(stored.display_name).toBe(COMPANY.display_name)
    expect(stored.bearer_token).toBe(COMPANY.bearer_token)
    expect(stored.expiration_time).toBe(COMPANY.expiration_time)
    expect(stored.api_base_url).toBe(COMPANY.api_base_url)
    expect(stored.site_name).toBe(COMPANY.site_name)
    expect(stored.canonical_user_p).toBe(COMPANY.canonical_user_p)
    expect(stored.starred_p).toBe(COMPANY.starred_p)
  })
})

// ── Conf storage: active workspace ───────────────────────────────────────────

describe('WorkspaceConfig - active workspace', () => {
  it('retrieves active workspace domain', () => {
    setActiveWorkspace('company.video23.com')
    expect(getActiveWorkspace()).toBe('company.video23.com')
  })

  it('sets active workspace domain', () => {
    setActiveWorkspace('acme.video23.com')
    expect(getActiveWorkspace()).toBe('acme.video23.com')
  })

  it('returns undefined when no active workspace set', () => {
    expect(getActiveWorkspace()).toBeUndefined()
  })

  it('overwrites previous active workspace', () => {
    setActiveWorkspace('company.video23.com')
    setActiveWorkspace('acme.video23.com')
    expect(getActiveWorkspace()).toBe('acme.video23.com')
  })
})

// ── getWorkspaceForDomain ─────────────────────────────────────────────────────

describe('WorkspaceConfig - getWorkspaceForDomain', () => {
  it('finds correct entry by exact domain', () => {
    setWorkspaces([COMPANY, ACME])
    const result = getWorkspaceForDomain('company.video23.com')
    expect(result).not.toBeNull()
    expect(result!.domain).toBe('company.video23.com')
  })

  it('returns null for unknown domain', () => {
    setWorkspaces([COMPANY])
    expect(getWorkspaceForDomain('unknown.video23.com')).toBeNull()
  })
})

// ── clearConfig ───────────────────────────────────────────────────────────────

describe('WorkspaceConfig - clearConfig', () => {
  it('resets workspaces to empty array', () => {
    setWorkspaces([COMPANY])
    clearConfig()
    expect(getWorkspaces()).toEqual([])
  })

  it('resets active workspace to undefined', () => {
    setActiveWorkspace('company.video23.com')
    clearConfig()
    expect(getActiveWorkspace()).toBeUndefined()
  })
})

// ── findWorkspace (pure function) ─────────────────────────────────────────────

describe('WorkspaceConfig - findWorkspace', () => {
  it('finds workspace by exact domain match', () => {
    const result = findWorkspace('company.video23.com', [COMPANY, ACME])
    expect(result).not.toBeNull()
    // Exact domain match returns single entry, not array
    expect(Array.isArray(result)).toBe(false)
    expect((result as WorkspaceEntry).domain).toBe('company.video23.com')
  })

  it('finds workspace by partial display name (case-insensitive)', () => {
    const result = findWorkspace('acme corp', [COMPANY, ACME])
    expect(result).not.toBeNull()
    expect(Array.isArray(result)).toBe(false)
    expect((result as WorkspaceEntry).domain).toBe('acme.video23.com')
  })

  it('finds workspace by partial domain substring (case-insensitive)', () => {
    const result = findWorkspace('ACME', [COMPANY, ACME])
    expect(result).not.toBeNull()
    expect(Array.isArray(result)).toBe(false)
    expect((result as WorkspaceEntry).domain).toBe('acme.video23.com')
  })

  it('returns multiple matches for ambiguous query', () => {
    // Both COMPANY and COMPANY_ACME contain "company"
    const result = findWorkspace('company', [COMPANY, ACME, COMPANY_ACME])
    expect(Array.isArray(result)).toBe(true)
    expect((result as WorkspaceEntry[]).length).toBeGreaterThan(1)
  })

  it('returns null for no match', () => {
    const result = findWorkspace('nonexistent', [COMPANY, ACME])
    expect(result).toBeNull()
  })

  it('exact domain match takes precedence over partial name match', () => {
    // 'company.video23.com' is an exact domain for COMPANY
    // COMPANY_ACME has "company" in its display_name but is not an exact match
    const result = findWorkspace('company.video23.com', [COMPANY, ACME, COMPANY_ACME])
    expect(Array.isArray(result)).toBe(false)
    expect((result as WorkspaceEntry).domain).toBe('company.video23.com')
  })

  it('matching is case-insensitive', () => {
    const result = findWorkspace('COMPANY WORKSPACE', [COMPANY, ACME])
    expect(result).not.toBeNull()
    expect(Array.isArray(result)).toBe(false)
    expect((result as WorkspaceEntry).domain).toBe('company.video23.com')
  })
})
