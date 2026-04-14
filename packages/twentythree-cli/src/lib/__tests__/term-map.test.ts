import { describe, expect, it } from 'vitest'
import { toCliTerm, toApiTerm, applyCliTerms, TERM_MAP } from '../term-map.js'

describe('toCliTerm', () => {
  it('maps photo to video', () => {
    expect(toCliTerm('photo')).toBe('video')
  })

  it('maps album to category', () => {
    expect(toCliTerm('album')).toBe('category')
  })

  it('maps live to webinar', () => {
    expect(toCliTerm('live')).toBe('webinar')
  })

  it('is case-insensitive', () => {
    expect(toCliTerm('Photo')).toBe('video')
    expect(toCliTerm('ALBUM')).toBe('category')
  })

  it('returns unknown terms unchanged', () => {
    expect(toCliTerm('unknown')).toBe('unknown')
    expect(toCliTerm('user')).toBe('user')
  })
})

describe('toApiTerm', () => {
  it('maps video to photo', () => {
    expect(toApiTerm('video')).toBe('photo')
  })

  it('maps category to album', () => {
    expect(toApiTerm('category')).toBe('album')
  })

  it('maps webinar to live', () => {
    expect(toApiTerm('webinar')).toBe('live')
  })

  it('returns unknown terms unchanged', () => {
    expect(toApiTerm('unknown')).toBe('unknown')
  })
})

describe('applyCliTerms', () => {
  it('replaces all legacy terms in a string', () => {
    const input = 'photo_id refers to a photo in an album'
    const expected = 'video_id refers to a video in an category'
    expect(applyCliTerms(input)).toBe(expected)
  })

  it('replaces live with webinar', () => {
    expect(applyCliTerms('live event started')).toBe('webinar event started')
  })

  it('returns strings without legacy terms unchanged', () => {
    expect(applyCliTerms('hello world')).toBe('hello world')
  })
})

describe('TERM_MAP', () => {
  it('exposes API_TO_CLI map', () => {
    expect(TERM_MAP.API_TO_CLI).toHaveProperty('photo', 'video')
  })

  it('exposes CLI_TO_API map', () => {
    expect(TERM_MAP.CLI_TO_API).toHaveProperty('video', 'photo')
  })
})
