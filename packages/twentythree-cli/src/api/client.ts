import createClient, { type Middleware } from 'openapi-fetch'
import type { paths } from './types.js'

export interface ClientConfig {
  baseUrl: string  // use workspace.api_base_url directly (has trailing slash)
  token?: string   // undefined in domain-only/anonymous mode
}

/**
 * Create a typed openapi-fetch client for a TwentyThree workspace.
 *
 * When token is provided, an auth middleware injects the Authorization header.
 * When token is undefined or empty string (domain-only mode per AUTH-11), no
 * auth header is sent.
 *
 * Pass api_base_url from WorkspaceEntry directly — it already has a trailing slash.
 */
export function createApiClient(config: ClientConfig) {
  const client = createClient<paths>({
    baseUrl: config.baseUrl,
  })

  if (config.token) {
    const authMiddleware: Middleware = {
      async onRequest({ request }) {
        request.headers.set('Authorization', `Bearer ${config.token}`)
        return request
      },
    }
    client.use(authMiddleware)
  }

  return client
}
