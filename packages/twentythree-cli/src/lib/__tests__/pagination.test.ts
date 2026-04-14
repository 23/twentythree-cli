import { describe, expect, it, vi } from 'vitest'
import { fetchAllPages } from '../pagination.js'

describe('fetchAllPages', () => {
  it('returns items from a single page result', async () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const fetchPage = vi.fn().mockResolvedValue({ data: items, total_count: 3 })

    const result = await fetchAllPages(fetchPage)

    expect(result).toEqual(items)
    expect(fetchPage).toHaveBeenCalledTimes(1)
    expect(fetchPage).toHaveBeenCalledWith(1, 100)
  })

  it('fetches multiple pages until total_count is satisfied', async () => {
    const page1 = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }))
    const page2 = Array.from({ length: 100 }, (_, i) => ({ id: i + 101 }))
    const page3 = Array.from({ length: 50 }, (_, i) => ({ id: i + 201 }))

    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({ data: page1, total_count: 250 })
      .mockResolvedValueOnce({ data: page2, total_count: 250 })
      .mockResolvedValueOnce({ data: page3, total_count: 250 })

    const result = await fetchAllPages(fetchPage)

    expect(result).toHaveLength(250)
    expect(fetchPage).toHaveBeenCalledTimes(3)
    expect(fetchPage).toHaveBeenNthCalledWith(1, 1, 100)
    expect(fetchPage).toHaveBeenNthCalledWith(2, 2, 100)
    expect(fetchPage).toHaveBeenNthCalledWith(3, 3, 100)
  })

  it('returns empty array when first page returns no items', async () => {
    const fetchPage = vi.fn().mockResolvedValue({ data: [], total_count: 0 })

    const result = await fetchAllPages(fetchPage)

    expect(result).toEqual([])
    expect(fetchPage).toHaveBeenCalledTimes(1)
  })

  it('handles missing data array gracefully', async () => {
    const fetchPage = vi.fn().mockResolvedValue({ total_count: 0 })

    const result = await fetchAllPages(fetchPage)

    expect(result).toEqual([])
  })

  it('stops fetching when an empty page is returned before total_count', async () => {
    const page1 = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }))

    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({ data: page1, total_count: 300 })
      .mockResolvedValueOnce({ data: [], total_count: 300 })

    const result = await fetchAllPages(fetchPage)

    // Should stop when empty page is returned
    expect(result).toHaveLength(100)
    expect(fetchPage).toHaveBeenCalledTimes(2)
  })

  it('handles missing total_count by stopping after empty page', async () => {
    const page1 = [{ id: 1 }, { id: 2 }]

    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({ data: page1 })
      .mockResolvedValueOnce({ data: [] })

    const result = await fetchAllPages(fetchPage)

    expect(result).toEqual(page1)
  })
})
