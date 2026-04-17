import { Command } from '@oclif/core'
import * as p from '@clack/prompts'

export default class Autocomplete extends Command {
  static description = 'Set up tab completion for your shell'

  static agentMetadata = {
    api_endpoint: 'interactive',
    auth_scope: 'none' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'creates' as const,
  }

  static examples = ['<%= config.bin %> autocomplete']

  public async run(): Promise<void> {
    await this.parse(Autocomplete)

    p.intro('Tab completion setup')

    // Shell detection via $SHELL env var
    const rawShell = process.env.SHELL ?? ''
    const detectedShell = rawShell.endsWith('zsh') ? 'zsh'
      : rawShell.endsWith('bash') ? 'bash'
      : null

    let shell: string

    if (detectedShell) {
      const confirm = await p.confirm({
        message: `Detected shell: ${detectedShell}. Set up completion for ${detectedShell}?`,
      })
      if (p.isCancel(confirm)) {
        p.cancel('Cancelled')
        return
      }
      if (confirm) {
        shell = detectedShell
      } else {
        const chosen = await p.select({
          message: 'Select your shell',
          options: [
            { value: 'zsh', label: 'zsh' },
            { value: 'bash', label: 'bash' },
          ],
        })
        if (p.isCancel(chosen)) {
          p.cancel('Cancelled')
          return
        }
        shell = chosen as string
      }
    } else {
      const chosen = await p.select({
        message: 'Select your shell',
        options: [
          { value: 'zsh', label: 'zsh' },
          { value: 'bash', label: 'bash' },
        ],
      })
      if (p.isCancel(chosen)) {
        p.cancel('Cancelled')
        return
      }
      shell = chosen as string
    }

    // Build completion cache BEFORE showing eval line (avoids cache-miss on first source)
    const s = p.spinner()
    s.start('Building completion cache...')
    try {
      // Use oclif command runner to invoke the plugin's create command
      // This bridges the ESM/CJS boundary safely — avoids direct subpath import
      await this.config.runCommand('autocomplete:create', [])
      s.stop('Completion cache built')
    } catch (err) {
      s.stop('Failed to build completion cache')
      this.error(
        `Could not build completion cache: ${err instanceof Error ? err.message : String(err)}`,
        { exit: 1 },
      )
      return
    }

    const rcFile = shell === 'zsh' ? '~/.zshrc' : '~/.bashrc'
    const evalLine = `printf "$(twentythree autocomplete script ${shell})" >> ${rcFile}; source ${rcFile}`

    p.note(
      `Add tab completion to your shell by running:\n\n  ${evalLine}\n\nThen restart your terminal or run: source ${rcFile}`,
      'Setup instructions',
    )

    p.outro('After setup, try: twentythree video <TAB>')
  }
}
