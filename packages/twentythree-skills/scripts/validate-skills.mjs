#!/usr/bin/env node
// scripts/validate-skills.mjs
// Validates twentythree-skills package structure and content.
//
// Two-gate validation (see 18-RESEARCH.md "validate-skills.mjs — Design"):
//   Gate 1 (strict): skills/SKILL.md must exist with name + description frontmatter.
//   Gate 2 (soft):   skills/reference/ — warn if absent (Phase 19 creates it);
//                    error only if present but missing any of the 22 groups.
//
// Exits 0 on success, 1 on any hard failure.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const packageRoot = join(__dirname, '..')
const skillsDir = join(packageRoot, 'skills')

// The 22 resource groups that must each have a reference/<group>.md file
// once Phase 19 creates skills/reference/. Source: REQUIREMENTS.md SKILL-02.
const RESOURCE_GROUPS = [
  'action', 'analytics', 'app', 'audience', 'category', 'collector',
  'comment', 'openupload', 'player', 'poll', 'presentation', 'protection',
  'session', 'setting', 'site', 'spot', 'tag', 'thumbnail', 'user',
  'video', 'webhook', 'webinar',
]

const errors = []
const warnings = []

// ─── Gate 1: Root SKILL.md ────────────────────────────────────────────────────

const rootSkillPath = join(skillsDir, 'SKILL.md')

if (!existsSync(rootSkillPath)) {
  errors.push(`Missing required file: skills/SKILL.md`)
} else {
  const content = readFileSync(rootSkillPath, 'utf8')
  const fm = parseFrontmatter(content)
  if (!fm) {
    errors.push(`skills/SKILL.md is missing a YAML frontmatter block (expected '---' fences at the top of the file)`)
  } else {
    if (!fm.hasKey('name') || fm.isEmpty('name')) {
      errors.push(`skills/SKILL.md frontmatter is missing required key 'name' (or it is empty)`)
    }
    if (!fm.hasKey('description')) {
      errors.push(`skills/SKILL.md frontmatter is missing required key 'description'`)
    }
  }
}

// ─── Gate 2: Reference files (soft) ───────────────────────────────────────────

const referenceDir = join(skillsDir, 'reference')

if (!existsSync(referenceDir)) {
  warnings.push(`skills/reference/ not yet created (Phase 19 creates it). Skipping reference-file check.`)
} else {
  for (const group of RESOURCE_GROUPS) {
    const filePath = join(referenceDir, `${group}.md`)
    if (!existsSync(filePath)) {
      errors.push(`Missing reference file: skills/reference/${group}.md`)
    }
  }
}

// ─── Gate 3: Pack file count ──────────────────────────────────────────────────
// Update EXPECTED_FILE_COUNT when adding new files to the package.
const EXPECTED_FILE_COUNT = 29

const packResult = spawnSync('npm', ['pack', '--dry-run'], {
  cwd: packageRoot,
  encoding: 'utf8',
})

if (packResult.error) {
  errors.push(`Gate 3: failed to run npm pack --dry-run: ${packResult.error.message}`)
} else {
  const packOutput = packResult.stderr || ''

  const countMatch = packOutput.match(/total files:\s*(\d+)/)
  if (!countMatch) {
    errors.push(`Gate 3: could not parse file count from npm pack --dry-run output`)
  } else {
    const actualCount = Number(countMatch[1])
    if (actualCount !== EXPECTED_FILE_COUNT) {
      errors.push(
        `Gate 3: npm pack file count is ${actualCount}, expected ${EXPECTED_FILE_COUNT}. ` +
        `Update EXPECTED_FILE_COUNT in validate-skills.mjs when adding or removing package files.`
      )
    }
  }

  if (!packOutput.includes('skills/guide.md')) {
    errors.push(`Gate 3: skills/guide.md not found in npm pack --dry-run output — file may be missing or excluded from package`)
  }
}

// ─── Report ───────────────────────────────────────────────────────────────────

for (const w of warnings) console.warn(`warn: ${w}`)
for (const e of errors) console.error(`error: ${e}`)

if (errors.length > 0) {
  console.error(`\nvalidate-skills: FAILED (${errors.length} error${errors.length === 1 ? '' : 's'})`)
  process.exit(1)
}

console.log(`validate-skills: OK (SKILL.md frontmatter valid${warnings.length > 0 ? `, ${warnings.length} warning${warnings.length === 1 ? '' : 's'}` : ''})`)
process.exit(0)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseFrontmatter(content) {
  // Match the first --- ... --- block at the start of the file.
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return null

  const raw = {}
  const keys = new Set()
  let lastKey = null

  for (const line of match[1].split(/\r?\n/)) {
    // Match top-level key (not indented).
    const keyMatch = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/)
    if (keyMatch) {
      lastKey = keyMatch[1]
      const val = keyMatch[2].trim()
      keys.add(lastKey)
      // Block scalar marker | or > means value is on following lines; otherwise use inline value.
      if (val === '|' || val === '>' || val === '|-' || val === '>-') {
        raw[lastKey] = '__block__'
      } else if (val.length > 0) {
        raw[lastKey] = val
      } else {
        raw[lastKey] = ''
      }
    }
  }

  return {
    hasKey: (k) => keys.has(k),
    isEmpty: (k) => {
      const v = raw[k]
      return v === undefined || v === ''
    },
  }
}
