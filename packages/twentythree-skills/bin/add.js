#!/usr/bin/env node
// bin/add.js — TwentyThree Skills installer
// Node.js built-ins only. ESM. No build step. Target: < 150 lines.

import { existsSync, mkdirSync, cpSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const skillsSource = join(__dirname, '..', 'skills')
const home = homedir()
const cwd = process.cwd()
const isProject = process.argv.includes('--project')
const installClaudeHookFlag = process.argv.includes('--install-claude-hook')

const RUNTIMES = [
  {
    name: 'Claude Code',
    detect: join(home, '.claude'),
    globalDest: join(home, '.claude', 'skills', 'twentythree'),
    projectDest: join(cwd, '.claude', 'skills', 'twentythree'),
  },
  {
    name: 'OpenAI Codex',
    detect: join(home, '.codex'),
    globalDest: join(home, '.codex', 'skills', 'twentythree'),
    projectDest: join(cwd, '.agents', 'skills', 'twentythree'),
  },
  {
    name: 'GitHub Copilot',
    detect: join(home, '.github', 'copilot'),
    globalDest: join(home, '.github', 'skills', 'twentythree'),
    projectDest: join(cwd, '.github', 'skills', 'twentythree'),
  },
  {
    name: 'Cursor',
    detect: join(home, '.cursor'),
    globalDest: join(home, '.cursor', 'skills', 'twentythree'),
    projectDest: join(cwd, '.cursor', 'skills', 'twentythree'),
  },
  {
    name: 'Windsurf',
    detect: join(home, '.codeium'),
    globalDest: join(home, '.codeium', 'windsurf', 'skills', 'twentythree'),
    projectDest: join(cwd, '.windsurf', 'skills', 'twentythree'),
  },
  {
    name: 'Cline',
    detect: join(home, '.clinerules'),
    globalDest: join(home, '.clinerules', 'twentythree'),
    projectDest: join(cwd, '.clinerules', 'twentythree'),
  },
  {
    name: 'Gemini CLI',
    detect: join(home, '.gemini'),
    globalDest: join(home, '.gemini', 'skills', 'twentythree'),
    projectDest: join(cwd, '.gemini', 'skills', 'twentythree'),
  },
]

function walkDir(dir) {
  const files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkDir(full))
    } else {
      files.push(full)
    }
  }
  return files
}

function shortPath(abs) {
  if (abs.startsWith(home)) return '~' + abs.slice(home.length)
  if (abs.startsWith(cwd + '/')) return '.' + abs.slice(cwd.length)
  if (abs === cwd) return '.'
  return abs
}

function installTo(destRoot, label) {
  mkdirSync(destRoot, { recursive: true })
  console.log(`\n${label}`)
  for (const absFile of walkDir(skillsSource)) {
    const rel = relative(skillsSource, absFile)
    const destFile = join(destRoot, rel)
    mkdirSync(dirname(destFile), { recursive: true })
    try {
      cpSync(absFile, destFile, { dereference: false })
      console.log(`  ✓ ${rel}`)
    } catch (err) {
      console.error(`  ✗ Error installing ${rel}: ${err.message}`)
      process.exitCode = 1
    }
  }
}

if (!existsSync(skillsSource)) {
  console.error('Skills source directory not found. The package may be corrupted.')
  process.exit(1)
}

// --install-claude-hook: install the skill globally for Claude Code and wire the
// deterministic telemetry hook into ~/.claude/settings.json (idempotent, backed up).
function installClaudeHook() {
  const claude = RUNTIMES.find(r => r.name === 'Claude Code')
  installTo(claude.globalDest, `Claude Code (${shortPath(claude.globalDest)}/)`)

  const settingsPath = join(home, '.claude', 'settings.json')
  const hookCmd = `node "${join(claude.globalDest, 'hooks', 'telemetry-hook.mjs')}"`
  let settings = {}
  if (existsSync(settingsPath)) {
    try {
      settings = JSON.parse(readFileSync(settingsPath, 'utf8'))
    } catch (err) {
      console.error(`\n✗ Could not parse ${shortPath(settingsPath)} (${err.message}). Aborting to avoid corrupting it.`)
      process.exit(1)
    }
    const backup = settingsPath + '.bak'
    cpSync(settingsPath, backup)
    console.log(`\nBacked up settings to ${shortPath(backup)}`)
  }

  settings.hooks = settings.hooks || {}
  const events = [['UserPromptSubmit', null], ['PostToolUse', 'Bash'], ['Stop', null]]
  let added = 0
  for (const [event, matcher] of events) {
    settings.hooks[event] = settings.hooks[event] || []
    const already = settings.hooks[event].some(group =>
      (group.hooks || []).some(h => typeof h.command === 'string' && h.command.includes('telemetry-hook.mjs')),
    )
    if (already) continue
    const entry = { hooks: [{ type: 'command', command: hookCmd }] }
    if (matcher) entry.matcher = matcher
    settings.hooks[event].push(entry)
    added++
  }

  if (added === 0) {
    console.log('\nTelemetry hook already present in settings.json — nothing to change.')
  } else {
    mkdirSync(dirname(settingsPath), { recursive: true })
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n')
    console.log(`\n✓ Wired the telemetry hook into ${shortPath(settingsPath)} (${added} event${added === 1 ? '' : 's'}).`)
    console.log('  Start a new Claude Code session for the hook to take effect.')
  }
  process.exit(process.exitCode ?? 0)
}

if (installClaudeHookFlag) {
  if (!existsSync(join(home, '.claude'))) {
    console.error('Claude Code not detected (~/.claude missing). --install-claude-hook only applies to Claude Code.')
    process.exit(1)
  }
  installClaudeHook()
}

const detected = RUNTIMES.filter(r => existsSync(r.detect))

if (detected.length === 0) {
  const checked = RUNTIMES.map(r => shortPath(r.detect)).join('  ')
  console.log('No supported agent runtime detected.\n')
  console.log(`Checked: ${checked}\n`)
  console.log('Install manually or see: https://www.npmjs.com/package/twentythree-skills')
  process.exit(0)
}

for (const runtime of detected) {
  const dest = isProject ? runtime.projectDest : runtime.globalDest
  const label = `${runtime.name} (${shortPath(dest)}/)`
  installTo(dest, label)
}

console.log('\nDone.')

if (detected.some(r => r.name === 'Claude Code')) {
  console.log(
    '\nTip (Claude Code): enforce session telemetry deterministically with a harness hook:\n' +
      '  npx twentythree-skills --install-claude-hook',
  )
}

process.exit(process.exitCode ?? 0)
