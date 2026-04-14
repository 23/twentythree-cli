/**
 * Generic auto-pagination helper (CLI-02).
 *
 * Fetches all pages from a paginated API endpoint by calling fetchPage
 * repeatedly until all items have been retrieved or an empty page is returned.
 */

const PAGE_SIZE = 100

/**
 * Fetch all pages from a paginated API endpoint.
 *
 * @param fetchPage - Function that takes (page: number, size: number) and returns
 *   a promise resolving to { data?: T[], total_count?: number }
 * @returns Concatenated array of all items across all pages
 */
export async function fetchAllPages<T>(
  fetchPage: (page: number, size: number) => Promise<{ data?: T[]; total_count?: number }>
): Promise<T[]> {
  const allItems: T[] = []
  let page = 1

  while (true) {
    const response = await fetchPage(page, PAGE_SIZE)
    const items = response.data ?? []

    if (items.length === 0) {
      break
    }

    allItems.push(...items)

    const totalCount = response.total_count ?? 0

    if (totalCount > 0 && allItems.length >= totalCount) {
      break
    }

    if (totalCount === 0) {
      // No total_count — stop after first empty page (already handled above)
      // If we got items but no total_count, fetch next page to see if there are more
      page++
      continue
    }

    page++
  }

  return allItems
}
