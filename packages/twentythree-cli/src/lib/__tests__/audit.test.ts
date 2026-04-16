import { describe, expect, it } from 'vitest'
import { EXCLUDED_OPERATIONS, ExcludedOperation } from '../audit.js'

describe('EXCLUDED_OPERATIONS', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(EXCLUDED_OPERATIONS)).toBe(true)
    expect(EXCLUDED_OPERATIONS.length).toBeGreaterThan(0)
  })

  it('every entry has endpoint, reason, and category fields', () => {
    for (const entry of EXCLUDED_OPERATIONS) {
      expect(entry).toHaveProperty('endpoint')
      expect(entry).toHaveProperty('reason')
      expect(entry).toHaveProperty('category')
      expect(typeof entry.endpoint).toBe('string')
      expect(typeof entry.reason).toBe('string')
      expect(typeof entry.category).toBe('string')
    }
  })

  it("every endpoint matches pattern 'METHOD /path'", () => {
    const pattern = /^(GET|POST|PUT|PATCH|DELETE) \//
    for (const entry of EXCLUDED_OPERATIONS) {
      expect(entry.endpoint).toMatch(pattern)
    }
  })

  it('every category is one of the allowed values', () => {
    const allowedCategories: ExcludedOperation['category'][] = [
      'admin-only',
      'internal',
      'deprecated',
      'super-admin',
      'non-standard',
    ]
    for (const entry of EXCLUDED_OPERATIONS) {
      expect(allowedCategories).toContain(entry.category)
    }
  })

  it('no duplicate endpoints', () => {
    const endpoints = EXCLUDED_OPERATIONS.map((e) => e.endpoint)
    const unique = new Set(endpoints)
    expect(unique.size).toBe(endpoints.length)
  })
})
