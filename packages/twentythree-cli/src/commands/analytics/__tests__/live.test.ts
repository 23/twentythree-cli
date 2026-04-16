import { describe, it } from 'vitest'

describe('AnalyticsLive', () => {
  it.todo('root live command renders paginated data from GET /analytics/data/live')
  it.todo('timeseries passes date flags to GET /analytics/data/live/timeseries')
  it.todo('totals returns aggregate data without pagination')
  it.todo('weekday renders with pagination flags')
  it.todo('event renders with pagination flags')
  it.todo('event-timeseries uses /live/event/timeseries path (slash not hyphen)')
  it.todo('event-totals uses /live/event/totals path (slash not hyphen)')
})
