---
status: partial
phase: 07-analytics-audience
source: [07-VERIFICATION.md]
started: 2026-04-16T09:45:00Z
updated: 2026-04-16T09:45:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Live analytics query
expected: `twentythree analytics video timeseries --date-expression thisweek` returns table output or "No data found." with no unhandled errors

result: [pending]

### 2. JSON output shape
expected: `twentythree analytics video weekday --json` output has `ok`, `data`, `summary`, `breadcrumbs` fields

result: [pending]

### 3. Storage command key-value render
expected: `twentythree analytics usage storage --json` returns `data` as a single object (not an array)

result: [pending]

### 4. Audience list pagination
expected: `twentythree audience list --page 1 --size 10` shows table with UUID/Name/Email/Company/Score/Timelines columns

result: [pending]

### 5. audience remove cancel
expected: `twentythree audience remove --email test@example.com` → press N → prints "Cancelled." with exit code 2

result: [pending]

### 6. audience field/remove cancel
expected: `twentythree audience field remove --key somekey` → press N → exit code 2

result: [pending]

## Summary

total: 6
passed: 0
issues: 0
pending: 6
skipped: 0
blocked: 0

## Gaps
