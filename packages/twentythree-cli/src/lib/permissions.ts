/**
 * API permission levels and the helpers that compare and describe them.
 *
 * Every API response carries the caller's `permission_level`, and since
 * /user/tokens caps issued tokens at the login's level, the CLI records that
 * level per workspace at login. The API stays the authority: anything these
 * helpers do not recognise is treated as "unknown" and never blocks a call.
 */

export type PermissionLevel = 'anonymous' | 'none' | 'read' | 'write' | 'admin' | 'super'

/** Ordering of permission levels, lowest first (the server's own ladder). */
const PERMISSION_RANK: Record<PermissionLevel, number> = {
  none: 0,
  anonymous: 1,
  read: 2,
  write: 3,
  admin: 4,
  super: 5,
}

/**
 * True when `have` is a known permission level strictly below `need`.
 * Unknown or missing levels never fail the comparison.
 */
export function permissionBelow(have: string | undefined, need: string | undefined): boolean {
  if (!have || !need) return false
  const h = PERMISSION_RANK[have as PermissionLevel]
  const n = PERMISSION_RANK[need as PermissionLevel]
  if (h === undefined || n === undefined) return false
  return h < n
}

/** True when the level cannot create, update or delete anything. */
export function isReadOnly(level: string | undefined): boolean {
  return permissionBelow(level, 'write')
}

/**
 * One-line, human-readable description of what a login at `level` can do,
 * shared by auth credentials, auth status and doctor so the wording matches.
 * Returns null for an unknown level.
 */
export function describePermission(level: string | undefined): string | null {
  if (!level) return null
  return isReadOnly(level)
    ? `${level}-only — commands that create, update or delete will be refused`
    : level
}
