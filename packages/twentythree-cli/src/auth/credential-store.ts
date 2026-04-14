import { Entry } from '@napi-rs/keyring'

const SERVICE_NAME = 'twentythree-cli'

export function setCredential(domain: string, token: string): void {
  const entry = new Entry(SERVICE_NAME, domain)
  entry.setPassword(token)
}

export function getCredential(domain: string): string | null {
  const entry = new Entry(SERVICE_NAME, domain)
  return entry.getPassword()
}

export function deleteCredential(domain: string): boolean {
  const entry = new Entry(SERVICE_NAME, domain)
  return entry.deleteCredential()
}

export function hasCredential(domain: string): boolean {
  return getCredential(domain) !== null
}
