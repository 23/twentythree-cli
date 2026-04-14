import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { setCredential, getCredential, deleteCredential, hasCredential } from '../credential-store.js'

// We use a unique domain suffix per test run to avoid collisions across parallel runs
const TEST_RUN_ID = Date.now()

// Track domains created during tests for cleanup
const createdDomains: string[] = []

function testDomain(label: string): string {
  const domain = `test-${TEST_RUN_ID}-${label}.example.com`
  createdDomains.push(domain)
  return domain
}

// Detect headless/CI environments where the OS keychain is unavailable
let keychainAvailable = true

beforeAll(() => {
  try {
    const probeKey = `probe-${TEST_RUN_ID}.example.com`
    setCredential(probeKey, 'probe')
    deleteCredential(probeKey)
  } catch {
    keychainAvailable = false
    console.warn('[credential-store tests] Keychain not available — all tests will be skipped')
  }
})

afterEach(() => {
  if (!keychainAvailable) return
  // Clean up all domains created during test — best-effort
  for (const domain of createdDomains) {
    try { deleteCredential(domain) } catch { /* ignore */ }
  }
  createdDomains.length = 0
})

describe('CredentialStore', () => {
  it('stores a credential in the OS keychain', () => {
    if (!keychainAvailable) return
    const domain = testDomain('store')
    setCredential(domain, 'tok_abc123')
    expect(getCredential(domain)).toBe('tok_abc123')
  })

  it('retrieves a stored credential by domain', () => {
    if (!keychainAvailable) return
    const domain = testDomain('retrieve')
    setCredential(domain, 'tok_retrieve_me')
    const result = getCredential(domain)
    expect(result).toBe('tok_retrieve_me')
  })

  it('returns null when no credential exists for domain', () => {
    if (!keychainAvailable) return
    const domain = `unknown-${TEST_RUN_ID}.no-entry.com`
    expect(getCredential(domain)).toBeNull()
  })

  it('deletes a credential by domain', () => {
    if (!keychainAvailable) return
    const domain = testDomain('delete')
    setCredential(domain, 'tok_to_delete')
    expect(getCredential(domain)).toBe('tok_to_delete')
    deleteCredential(domain)
    expect(getCredential(domain)).toBeNull()
  })

  it('overwrites existing credential for same domain', () => {
    if (!keychainAvailable) return
    const domain = testDomain('overwrite')
    setCredential(domain, 'tok_first')
    expect(getCredential(domain)).toBe('tok_first')
    setCredential(domain, 'tok_second')
    expect(getCredential(domain)).toBe('tok_second')
  })

  it('hasCredential returns true after storing a credential', () => {
    if (!keychainAvailable) return
    const domain = testDomain('has-true')
    setCredential(domain, 'tok_present')
    expect(hasCredential(domain)).toBe(true)
  })

  it('hasCredential returns false when no credential exists', () => {
    if (!keychainAvailable) return
    const domain = `unknown-has-${TEST_RUN_ID}.no-entry.com`
    expect(hasCredential(domain)).toBe(false)
  })

  it('hasCredential returns false after deleting a credential', () => {
    if (!keychainAvailable) return
    const domain = testDomain('has-after-delete')
    setCredential(domain, 'tok_will_be_gone')
    expect(hasCredential(domain)).toBe(true)
    deleteCredential(domain)
    expect(hasCredential(domain)).toBe(false)
  })
})
