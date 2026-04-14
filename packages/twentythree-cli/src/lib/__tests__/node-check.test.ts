import { describe, expect, it } from 'vitest'

/**
 * The actual guard in bin/run.js uses process.versions.node directly.
 * This test verifies the LOGIC: given a version string, does it correctly
 * determine if the version is below the minimum?
 */
function isNodeVersionSupported(versionString: string, minMajor: number = 22): boolean {
  const [major] = versionString.split('.').map(Number)
  return major >= minMajor
}

describe('Node version check logic', () => {
  it('rejects Node 18', () => {
    expect(isNodeVersionSupported('18.19.0')).toBe(false)
  })

  it('rejects Node 20', () => {
    expect(isNodeVersionSupported('20.11.0')).toBe(false)
  })

  it('accepts Node 22', () => {
    expect(isNodeVersionSupported('22.0.0')).toBe(true)
  })

  it('accepts Node 22.x', () => {
    expect(isNodeVersionSupported('22.11.0')).toBe(true)
  })

  it('accepts Node 23+', () => {
    expect(isNodeVersionSupported('23.0.0')).toBe(true)
  })
})
