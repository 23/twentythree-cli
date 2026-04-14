#!/usr/bin/env node
// bin/dev.js — development mode; auto-transpiles TypeScript via tsx

const nodeVersion = process.versions.node
const [major] = nodeVersion.split('.').map(Number)
if (major < 22) {
  process.stderr.write(
    `\nError: twentythree requires Node.js 22 or later.\n` +
    `You are running Node.js ${nodeVersion}.\n` +
    `Please upgrade: https://nodejs.org\n\n`
  )
  process.exit(1)
}

process.env.NODE_ENV = 'development'

// In dev mode, attempt tsx for TypeScript transpilation of src/commands
// Fallback to compiled dist if tsx is unavailable
void (async () => {
  try {
    require('tsx/cjs')
  } catch (err) {
    if (err?.code !== 'MODULE_NOT_FOUND') throw err
    // tsx not installed — fall through to compiled dist
  }
  const oclif = await import('@oclif/core')
  await oclif.execute({ development: true, dir: __dirname })
})()
