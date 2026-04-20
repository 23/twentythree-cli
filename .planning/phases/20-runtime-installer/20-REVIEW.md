---
phase: 20-runtime-installer
reviewed: 2026-04-20T00:00:00Z
depth: standard
files_reviewed: 1
files_reviewed_list:
  - packages/twentythree-skills/bin/add.js
findings:
  critical: 0
  warning: 3
  info: 2
  total: 5
status: issues_found
---

# Phase 20: Code Review Report

**Reviewed:** 2026-04-20
**Depth:** standard
**Files Reviewed:** 1
**Status:** issues_found

## Summary

Reviewed the skills installer script (`packages/twentythree-skills/bin/add.js`). The file is short, clean, and uses only Node.js built-ins with no external dependencies — a good constraint for a postinstall/npx-style tool. No security vulnerabilities or hardcoded secrets were found.

Three warnings were identified: an unhandled error from `cpSync` that will crash with an unhelpful stack trace on permission or I/O errors; an unhandled error from `walkDir`'s `readdirSync` that surfaces the same way; and a path-traversal risk where a symlink inside `skillsSource` could cause `cpSync` to follow it outside the package boundary. Two info-level issues cover a subtle `shortPath` edge case and a missing `--force` flag documentation.

## Warnings

### WR-01: `cpSync` errors crash with unhandled exception

**File:** `packages/twentythree-skills/bin/add.js:70`
**Issue:** `cpSync(absFile, destFile)` throws synchronously on permission errors, read failures, or full disks. The error propagates up through `installTo` and the `for` loop at line 85, crashing the process with a raw Node.js stack trace. Users see no actionable message — just a cryptic `EACCES` or `ENOSPC` dump. This is especially bad as an npm postinstall/npx script where users may not read stack traces.
**Fix:**
```js
function installTo(destRoot, label) {
  mkdirSync(destRoot, { recursive: true })
  console.log(`\n${label}`)
  for (const absFile of walkDir(skillsSource)) {
    const rel = relative(skillsSource, absFile)
    const destFile = join(destRoot, rel)
    mkdirSync(dirname(destFile), { recursive: true })
    try {
      cpSync(absFile, destFile)
      console.log(`  ✓ ${rel}`)
    } catch (err) {
      console.error(`  ✗ ${rel}: ${err.message}`)
      process.exitCode = 1
    }
  }
}
```

### WR-02: `walkDir` crashes silently on unreadable directories

**File:** `packages/twentythree-skills/bin/add.js:45`
**Issue:** `readdirSync(dir, { withFileTypes: true })` throws if `dir` is unreadable (e.g., permissions changed between `existsSync` check at line 75 and the actual read). The error surfaces as an unhandled exception. Additionally, if `skillsSource` itself does not exist (e.g., the package was installed without the `skills/` directory — perhaps a malformed publish), the crash message is equally unhelpful.
**Fix:** Guard the `walkDir` call with a pre-check and wrap `readdirSync` or the top-level call in a try/catch:
```js
if (!existsSync(skillsSource)) {
  console.error('Skills source directory not found. The package may be corrupted.')
  process.exit(1)
}
```
Add this check before line 75 (the `detected` filter).

### WR-03: `cpSync` follows symlinks by default — potential path traversal out of package

**File:** `packages/twentythree-skills/bin/add.js:70`
**Issue:** `cpSync(absFile, destFile)` with no options uses `{ dereference: false }` by default in Node.js, which copies symlinks as symlinks — meaning a symlink inside `skills/` pointing outside the package directory would be copied as-is and could then resolve to an unintended location on the user's machine. More critically, `walkDir` uses `entry.isDirectory()` but does NOT check `entry.isSymbolicLink()`: a symlink to a directory inside `skills/` would recurse into it (since `readdirSync` with `withFileTypes` resolves symlinks for `isDirectory()` on some platforms), potentially pulling in files from outside the package.

The risk is low in practice since the package content is controlled, but for a tool that runs as a postinstall script (elevated context), the pattern warrants an explicit guard.
**Fix:** Pass `{ dereference: false }` explicitly to `cpSync` and add a symlink guard in `walkDir`:
```js
// In walkDir:
if (entry.isSymbolicLink()) continue  // skip symlinks entirely

// In installTo:
cpSync(absFile, destFile, { dereference: false })
```
Or, if symlink-following is intentional, document the assumption and confirm the skills directory is always under version control without symlinks.

## Info

### IN-01: `shortPath` has an edge case when path separator differs

**File:** `packages/twentythree-skills/bin/add.js:58`
**Issue:** The check `abs.startsWith(cwd + '/')` hard-codes `/` as the separator. On Windows this would be `\`, so the path display falls through to the raw absolute path. The package targets npm global install (cross-platform), and while `bin/add.js` is ESM using Node builtins, Windows users running it via `npx` would get ugly absolute paths in the "project" install message.
**Fix:**
```js
import { sep } from 'node:path'
// ...
if (abs.startsWith(cwd + sep)) return '.' + abs.slice(cwd.length)
```

### IN-02: No feedback when `--project` flag is used but `cwd` equals a runtime's `globalDest` parent

**File:** `packages/twentythree-skills/bin/add.js:14`
**Issue:** The `--project` flag is the only supported argument but it is undocumented in the script output. If a user invokes the script without `--project`, skills are installed globally. There is no `--help` output, no usage line, and no confirmation prompt. For a postinstall/npx tool this is acceptable, but a one-line usage comment printed when an unknown flag is provided would prevent confusion.
**Fix:** Add minimal usage output:
```js
const unknownFlags = process.argv.slice(2).filter(a => a !== '--project')
if (unknownFlags.length > 0) {
  console.log('Usage: twentythree-skills [--project]')
  console.log('  --project  Install into current working directory instead of global location')
  process.exit(0)
}
```

---

_Reviewed: 2026-04-20_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
