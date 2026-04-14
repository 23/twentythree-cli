import { describe, expect, it } from 'vitest'
import {
  formatJsonOutput,
  renderTable,
  formatBytes,
  resolveUrl,
  EXIT_SUCCESS,
  EXIT_ERROR,
  EXIT_CANCELLED,
} from '../output.js'

describe('exit code constants', () => {
  it('EXIT_SUCCESS is 0', () => {
    expect(EXIT_SUCCESS).toBe(0)
  })

  it('EXIT_ERROR is 1', () => {
    expect(EXIT_ERROR).toBe(1)
  })

  it('EXIT_CANCELLED is 2', () => {
    expect(EXIT_CANCELLED).toBe(2)
  })
})

describe('formatJsonOutput', () => {
  it('returns ok:true shape with data, summary, breadcrumbs', () => {
    const result = formatJsonOutput({
      data: [{ id: 1 }],
      summary: 'Found 1 video',
      breadcrumbs: [{ domain: 'example.com', resource: 'video' }],
    })
    expect(result).toEqual({
      ok: true,
      data: [{ id: 1 }],
      summary: 'Found 1 video',
      breadcrumbs: [{ domain: 'example.com', resource: 'video' }],
    })
  })

  it('defaults ok to true when not provided', () => {
    const result = formatJsonOutput({ data: null, summary: 'done', breadcrumbs: [] })
    expect(result.ok).toBe(true)
  })

  it('returns ok:false shape with null data when ok=false', () => {
    const result = formatJsonOutput({
      ok: false,
      data: null,
      summary: 'Not found',
      breadcrumbs: [],
    })
    expect(result.ok).toBe(false)
    expect(result.data).toBeNull()
  })

  it('applies applyCliTerms to error summary when ok=false', () => {
    const result = formatJsonOutput({
      ok: false,
      data: null,
      summary: 'The photo was not found in the album',
      breadcrumbs: [],
    })
    // applyCliTerms should replace 'photo' with 'video' and 'album' with 'category'
    expect(result.summary).toContain('video')
    expect(result.summary).toContain('category')
    expect(result.summary).not.toContain('photo')
    expect(result.summary).not.toContain('album')
  })

  it('does NOT apply applyCliTerms to success summary', () => {
    const result = formatJsonOutput({
      ok: true,
      data: null,
      summary: 'photo uploaded to album',
      breadcrumbs: [],
    })
    // On success path, terms should NOT be replaced
    expect(result.summary).toBe('photo uploaded to album')
  })

  it('includes breadcrumbs in output', () => {
    const breadcrumbs = [
      { domain: 'example.com', resource: 'video', id: '42' },
    ]
    const result = formatJsonOutput({ data: {}, summary: 'ok', breadcrumbs })
    expect(result.breadcrumbs).toEqual(breadcrumbs)
  })
})

describe('renderTable', () => {
  it('returns a cli-table3 Table instance', () => {
    const table = renderTable(['ID', 'Name'], [['1', 'My Video'], ['2', 'Another']])
    expect(table).toBeDefined()
    // cli-table3 has a toString() method
    expect(typeof table.toString).toBe('function')
  })

  it('table string includes header values', () => {
    const table = renderTable(['ID', 'Title'], [['42', 'Hello World']])
    const output = table.toString()
    expect(output).toContain('ID')
    expect(output).toContain('Title')
  })

  it('table string includes row values', () => {
    const table = renderTable(['ID', 'Title'], [['42', 'Hello World']])
    const output = table.toString()
    expect(output).toContain('42')
    expect(output).toContain('Hello World')
  })

  it('handles empty rows', () => {
    const table = renderTable(['Col1', 'Col2'], [])
    expect(typeof table.toString()).toBe('string')
  })
})

describe('formatBytes', () => {
  it('formats bytes under 1 KB', () => {
    expect(formatBytes(512)).toBe('512 B')
  })

  it('formats kilobytes', () => {
    expect(formatBytes(45 * 1024)).toBe('45 KB')
  })

  it('formats megabytes', () => {
    expect(formatBytes(300 * 1024 * 1024)).toBe('300 MB')
  })

  it('formats gigabytes', () => {
    expect(formatBytes(1.5 * 1024 * 1024 * 1024)).toBe('1.5 GB')
  })

  it('formats 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B')
  })

  it('formats fractional MB', () => {
    const result = formatBytes(1.5 * 1024 * 1024)
    expect(result).toBe('1.5 MB')
  })
})

describe('resolveUrl', () => {
  const baseUrl = 'https://video.company.com'

  it('converts relative URL to absolute using baseUrl', () => {
    expect(resolveUrl('/page', baseUrl)).toBe('https://video.company.com/page')
  })

  it('returns already-absolute https URL unchanged', () => {
    expect(resolveUrl('https://video.company.com/page', baseUrl)).toBe(
      'https://video.company.com/page'
    )
  })

  it('returns already-absolute http URL unchanged', () => {
    expect(resolveUrl('http://other.com/page', baseUrl)).toBe('http://other.com/page')
  })

  it('returns empty string unchanged', () => {
    expect(resolveUrl('', baseUrl)).toBe('')
  })

  it('returns undefined unchanged', () => {
    expect(resolveUrl(undefined, baseUrl)).toBeUndefined()
  })

  it('handles baseUrl with trailing slash', () => {
    expect(resolveUrl('/videos/1', 'https://video.company.com/')).toBe(
      'https://video.company.com/videos/1'
    )
  })
})
