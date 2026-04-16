---
status: complete
phase: 02-auth-workspaces
source: 02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md, 02-04-SUMMARY.md, 02-05-SUMMARY.md
started: 2026-04-14T13:00:00Z
updated: 2026-04-14T13:10:00Z
---

## Current Test

[testing complete]

## Tests

### 1. auth credentials — token-based workspace setup
expected: Run `node bin/dev.js auth credentials`. Enter your domain, then your bearer token. Spinner shows "Discovering workspaces...", select prompt lists workspace names, pick one with Enter. Ends with "Credentials saved".
result: pass

### 2. auth credentials — anonymous mode
expected: Run `node bin/dev.js auth credentials`. Enter domain, press Enter to skip the token. Output says "Anonymous mode: only endpoints that do not require authentication are accessible." and "Credentials saved".
result: pass

### 3. auth status — shows workspace info
expected: Run `node bin/dev.js auth status`. Output shows the active workspace domain in dim brackets, then Domain, Display, Auth mode (authenticated), Token (active (auto-refreshes)), and Workspaces count. No token value or expiry countdown shown.
result: pass

### 4. workspace list — lists workspaces with active marker
expected: Run `node bin/dev.js workspace list`. Shows all configured workspaces, active one marked with a green `*`. Each row shows domain, display name, and `(authenticated)` or `(anonymous)`. No expiry shown.
result: pass

### 5. workspace use — switch active workspace
expected: Run `node bin/dev.js workspace use <domain-or-name>`. If unambiguous match, prints confirmation and switches the active workspace. Subsequent `auth status` shows the new workspace.
result: pass

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0

## Gaps

[none]
