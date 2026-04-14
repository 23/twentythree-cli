import { describe, it, expect, vi, beforeEach } from 'vitest'

// Hoisted mock setup — variables used in vi.mock factory must be hoisted
const { mockUse, mockClient, mockCreateClient } = vi.hoisted(() => {
  const mockUse = vi.fn()
  const mockClient = { use: mockUse }
  const mockCreateClient = vi.fn(() => mockClient)
  return { mockUse, mockClient, mockCreateClient }
})

vi.mock('openapi-fetch', () => ({
  default: mockCreateClient,
}))

// Import after mocking
import { createApiClient, type ClientConfig } from '../client.js'

describe('createApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates client with baseUrl from workspace domain', () => {
    const config: ClientConfig = { baseUrl: 'https://company.video23.com/' }
    createApiClient(config)
    expect(mockCreateClient).toHaveBeenCalledWith({ baseUrl: 'https://company.video23.com/' })
  })

  it('adds Authorization header when token is configured', async () => {
    const config: ClientConfig = { baseUrl: 'https://company.video23.com/', token: 'tok_123' }
    createApiClient(config)

    // client.use() should be called with a middleware
    expect(mockUse).toHaveBeenCalledOnce()

    // Verify the middleware sets the Authorization header
    const middleware = mockUse.mock.calls[0][0]
    const mockRequest = {
      headers: {
        set: vi.fn(),
      },
    }
    const result = await middleware.onRequest({ request: mockRequest })
    expect(mockRequest.headers.set).toHaveBeenCalledWith('Authorization', 'Bearer tok_123')
    expect(result).toBe(mockRequest)
  })

  it('does NOT add Authorization header in domain-only mode (AUTH-11)', () => {
    const config: ClientConfig = { baseUrl: 'https://company.video23.com/' }
    createApiClient(config)
    // No middleware should be registered when no token
    expect(mockUse).not.toHaveBeenCalled()
  })

  it('does NOT add Authorization header when token is empty string (AUTH-11)', () => {
    const config: ClientConfig = { baseUrl: 'https://company.video23.com/', token: '' }
    createApiClient(config)
    // Empty string is falsy — no middleware
    expect(mockUse).not.toHaveBeenCalled()
  })

  it('returns the openapi-fetch client', () => {
    const config: ClientConfig = { baseUrl: 'https://company.video23.com/', token: 'tok_abc' }
    const client = createApiClient(config)
    expect(client).toBe(mockClient)
  })
})
