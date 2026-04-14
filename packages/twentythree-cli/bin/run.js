#!/usr/bin/env node
// bin/run.js — MUST be plain JavaScript

// Node version guard: runs BEFORE oclif loads
// This is the only location that catches old Node reliably.
// The oclif init hook fires too late (after oclif itself is loaded).
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

// Load oclif only after version check passes
const { run } = require('@oclif/core')
const { handle } = require('@oclif/core/handle')

run(process.argv.slice(2), require('../package.json'))
  .catch(async (error) => {
    await handle(error)
  })
