#!/usr/bin/env node
// bin/dev.js — development mode; auto-transpiles TypeScript via tsx

process.env.NODE_ENV = 'development'

// In dev mode, attempt tsx for TypeScript transpilation of src/commands
// Fallback to compiled dist if tsx is unavailable
try {
  require('tsx/cjs')
  const { run } = require('@oclif/core')
  const { handle } = require('@oclif/core/handle')
  run(process.argv.slice(2), require('../package.json'))
    .catch(async (error) => {
      await handle(error)
    })
} catch {
  // Fallback: run compiled dist
  const { run } = require('@oclif/core')
  const { handle } = require('@oclif/core/handle')
  run(process.argv.slice(2), require('../package.json'))
    .catch(async (error) => {
      await handle(error)
    })
}
