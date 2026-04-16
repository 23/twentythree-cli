import { Flags } from '@oclif/core'

/**
 * Shared date filter flags for all analytics commands.
 * Supports explicit date ranges (date_start/date_end) or a predefined expression.
 */
export const ANALYTICS_DATE_FLAGS = {
  'date-start': Flags.string({
    description: 'First date (YYYY-MM-DD)',
    required: false,
  }),
  'date-end': Flags.string({
    description: 'Last date (YYYY-MM-DD)',
    required: false,
  }),
  'date-expression': Flags.string({
    description: 'Predefined date range (e.g. thisweek, lastyear)',
    required: false,
  }),
}

/**
 * Pagination flags for analytics endpoints that support paging.
 */
export const ANALYTICS_PAGINATION_FLAGS = {
  page: Flags.integer({
    description: 'Page number',
    required: false,
  }),
  size: Flags.integer({
    description: 'Page size',
    required: false,
  }),
}

/**
 * Optional filter flags for analytics endpoints that support grouping and ordering.
 */
export const ANALYTICS_FILTER_FLAGS = {
  selection: Flags.string({
    description: 'Scope to specific objects/types',
    required: false,
  }),
  groupby: Flags.string({
    description: 'Group results by dimension',
    required: false,
  }),
  orderby: Flags.string({
    description: 'Order results by field',
    required: false,
  }),
  order: Flags.string({
    description: 'Sort direction (asc/desc)',
    required: false,
  }),
}
