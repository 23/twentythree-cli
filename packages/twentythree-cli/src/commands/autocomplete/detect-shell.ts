/**
 * Detect shell from the $SHELL environment variable.
 * Returns 'zsh', 'bash', or null for unrecognized / unset shells.
 */
export function detectShell(shellEnv: string): 'zsh' | 'bash' | null {
  if (shellEnv.endsWith('zsh')) return 'zsh'
  if (shellEnv.endsWith('bash')) return 'bash'
  return null
}
