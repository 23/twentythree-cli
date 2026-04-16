#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, dirname, join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// KNOWN_NON_API: sentinel api_endpoint values used by CLI-only commands
// (e.g. auth/credentials, auth/status, workspace/use, workspace/list)
const KNOWN_NON_API = new Set([
  'interactive',
  'local',
  'POST /live/recording/split',
  'GET /user/tokens',
])

// ─── Step A: Extract spec endpoints ───────────────────────────────────────────

const specPath = resolve(__dirname, '../specs/twentythree-api-swagger.json')
const spec = JSON.parse(readFileSync(specPath, 'utf8'))
const specEndpoints = new Set()

for (const [path, methods] of Object.entries(spec.paths ?? {})) {
  for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
    if (method in methods) {
      specEndpoints.add(`${method.toUpperCase()} ${path}`)
    }
  }
}

// ─── Step B: Extract command api_endpoint values ───────────────────────────────

const cmdEndpoints = new Set()
const cmdEndpointFiles = new Map() // endpoint -> [filePaths]

function walkDir(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      walkDir(fullPath)
    } else if (extname(entry) === '.ts') {
      const content = readFileSync(fullPath, 'utf8')
      for (const match of content.matchAll(/api_endpoint:\s*'([^']+)'/g)) {
        const endpoint = match[1]
        cmdEndpoints.add(endpoint)
        if (!cmdEndpointFiles.has(endpoint)) {
          cmdEndpointFiles.set(endpoint, [])
        }
        cmdEndpointFiles.get(endpoint).push(fullPath)
      }
    }
  }
}

const commandsDir = resolve(__dirname, '../src/commands')
walkDir(commandsDir)

// ─── Step C: Parse EXCLUDED_OPERATIONS from source ────────────────────────────

const auditSrc = readFileSync(resolve(__dirname, '../src/lib/audit.ts'), 'utf8')
const excludedEndpoints = new Set()
for (const match of auditSrc.matchAll(/endpoint:\s*'([^']+)'/g)) {
  excludedEndpoints.add(match[1])
}

// ─── Step D: KNOWN_NON_API already defined above ──────────────────────────────

// ─── Step E: Compute gaps and phantoms ────────────────────────────────────────

const gaps = [...specEndpoints].filter(
  (e) => !cmdEndpoints.has(e) && !excludedEndpoints.has(e)
)

const phantoms = [...cmdEndpoints].filter(
  (e) => !specEndpoints.has(e) && !KNOWN_NON_API.has(e) && !excludedEndpoints.has(e)
)

// ─── Step F: Output ───────────────────────────────────────────────────────────

const covered = [...specEndpoints].filter(
  (e) => cmdEndpoints.has(e) && !excludedEndpoints.has(e)
).length

console.log('=== Endpoint Coverage Audit ===')
console.log('')
console.log(`Spec endpoints:  ${specEndpoints.size}`)
console.log(`Cmd endpoints:   ${cmdEndpoints.size}`)
console.log(`Excluded:        ${excludedEndpoints.size}`)
console.log(`Known non-API:   ${KNOWN_NON_API.size}`)
console.log('')
console.log(`Covered:         ${covered}`)
console.log(`Gaps:            ${gaps.length}`)
console.log(`Phantoms:        ${phantoms.length}`)

if (gaps.length > 0) {
  console.log('')
  console.log('--- Gaps (spec endpoints with no command and not excluded) ---')
  for (const gap of gaps.sort()) {
    console.log(`  ${gap}`)
  }
}

if (phantoms.length > 0) {
  console.log('')
  console.log('--- Phantoms (command api_endpoint values not in spec) ---')
  for (const phantom of phantoms.sort()) {
    const files = cmdEndpointFiles.get(phantom) ?? []
    for (const file of files) {
      // Print relative to package root
      const rel = file.replace(resolve(__dirname, '..') + '/', '')
      console.log(`  ${phantom}  (${rel})`)
    }
  }
}

if (gaps.length === 0 && phantoms.length === 0) {
  console.log('')
  console.log('All endpoints covered or excluded. Audit passed.')
}

// ─── Step G: Exit code ────────────────────────────────────────────────────────

process.exit(gaps.length > 0 || phantoms.length > 0 ? 1 : 0)
