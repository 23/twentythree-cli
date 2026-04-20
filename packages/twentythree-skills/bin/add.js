#!/usr/bin/env node
// bin/add.js — TwentyThree Skills installer
// Node.js built-ins only. ESM. No build step. Target: < 150 lines.

import { existsSync, mkdirSync, cpSync, readdirSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const skillsSource = join(__dirname, '..', 'skills')
const home = homedir()
const cwd = process.cwd()
const isProject = process.argv.includes('--project')

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
]

function walkDir(dir) {
  const files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
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
    cpSync(absFile, destFile)
    console.log(`  ✓ ${rel}`)
  }
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
process.exit(0)
