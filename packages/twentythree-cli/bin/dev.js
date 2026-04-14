#!/usr/bin/env node
// bin/dev.js — development mode; auto-transpiles TypeScript via tsx

process.env.NODE_ENV = 'development'

// In dev mode, attempt tsx for TypeScript transpilation of src/commands
// Fallback to compiled dist if tsx is unavailable
void (async () => {
  try {
    require('tsx/cjs')
  } catch {
    // tsx not available — fall through to compiled dist
  }
  const oclif = await import('@oclif/core')
  await oclif.execute({ development: true, dir: __dirname })
})()
