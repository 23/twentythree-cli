# Phase 8: Platform & Polish - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete the remaining platform command groups (spot, thumbnail, webhook, app, presentation, protection, session, openupload, site/setting, user) and ship two infrastructure features: `twentythree doctor` health check and `--help --agent` machine-readable metadata. This phase makes the CLI distribution-ready.

Out of scope: browser OAuth flow, non-npm distribution, GUI tooling.

</domain>

<decisions>
## Implementation Decisions

### D-1: `doctor` — 3-check pass/fail table

`twentythree doctor` runs exactly 3 checks in order:
1. **Credentials stored** — credentials non-empty in config/keychain
2. **Connectivity** — HTTPS reachable to the active workspace domain
3. **Token valid** — authenticated API call returns 200 (not 401/403)

Output format: coloured pass/fail table.

```
Check               Status  Detail
─────────────────────────────────────────────────────
Credentials stored   ✓ OK
Connectivity         ✓ OK     acme.video.twentythree.com
Token valid          ✗ FAIL   401 Unauthorized
```

- Green `✓ OK` / Red `✗ FAIL` per row using chalk
- Exit code 0 if all pass, exit code 1 if any fail
- `--json` output: `{ ok: boolean, checks: [{ name, passed, detail }] }`
- No auto-fix, no suggestions — report only. User re-runs `twentythree auth credentials` themselves.

### D-2: `--help --agent` — global flag, oclif-derived JSON with full metadata

`--agent` is a global flag registered on `BaseCommand` — all commands inherit it automatically.

Invocation: `twentythree <any-command> --help --agent`

Output is structured JSON with full metadata:

```json
{
  "command": "video list",
  "description": "...",
  "flags": [
    {
      "name": "page",
      "type": "integer",
      "required": false,
      "default": null,
      "description": "..."
    }
  ],
  "examples": ["twentythree video list --size 10"],
  "api_endpoint": "GET /api/2/photo/list",
  "auth_scope": "read",
  "output_shape": {
    "type": "table",
    "columns": ["ID", "Title", "Duration", "Published"]
  },
  "side_effects": "none"
}
```

Fields:
- `command` — full oclif command ID
- `description` — command description string
- `flags` — array with name, type, required, default, description per flag
- `examples` — usage examples from static examples array
- `api_endpoint` — HTTP method + path (e.g. `GET /api/2/photo/list`)
- `auth_scope` — `anonymous` | `none` | `read` | `write` | `admin` | `super`
- `output_shape` — `{ type: "table", columns: [...] }` or `{ type: "key-value" }` or `{ type: "none" }`
- `side_effects` — `none` | `destructive` | `creates` | `updates`

Each command provides `static agentMetadata` (or similar) with the API endpoint, auth scope, output shape, and side effects. The `--agent` flag reads this alongside oclif's existing flag/description introspection.

### D-3: `thumbnail file upload` — direct multipart, not chunked engine

`thumbnail file upload` uses direct multipart POST. Thumbnails are PNG/JPEG images (typically <5 MB) — the chunked upload engine exists for multi-GB video files and is inappropriate here.

No progress bar needed. Simple spinner like other non-upload commands.

`thumbnail file` is a 3-level oclif topic:
```
thumbnail/file/list.ts    → twentythree thumbnail file list
thumbnail/file/upload.ts  → twentythree thumbnail file upload
thumbnail/file/delete.ts  → twentythree thumbnail file delete
```

### D-4: `presentation` — 3-level oclif topic matching domain structure

```
presentation/
  setting/
    list.ts           → twentythree presentation setting list
    update.ts         → twentythree presentation setting update
  page/
    link-locations.ts → twentythree presentation page link-locations
```

Consistent with `analytics/<resource>/<dim>` and `audience/field/<op>` patterns.

### D-5: Patterns carried from prior phases (global, apply everywhere)

- **Pagination**: `--offset`/`--size` (or `--page`/`--size` where API uses `p`) — no auto-fetch loops
- **List output**: `renderTable()` + dim count line; empty state "No X found."
- **Single-object output**: key-value render
- **`--json` shape**: `{ ok, data, summary, breadcrumbs }` on all commands
- **Confirmation + exit 2**: all destructive commands (`delete`, `unsubscribe`, `unprotect`, etc.)
- **`applyCliTerms()`**: on all user-facing strings and error messages
- **3-level oclif topics**: via directory structure — no manual registration

### Claude's Discretion

- Flag naming for commands not explicitly specified above — follow existing patterns in the codebase (mirror API param names, drop `_p` suffix for booleans)
- `openupload upload-file` flag shape — use same flag names as `video upload` where applicable (`--file-path`, `--title`, etc.) since OUP-02 already mandates the chunked engine
- Column selection for table output per command — use the most useful subset of API response fields
- Whether to add a root `presentation index.ts` / `thumbnail index.ts` — follow the `analytics video index.ts` pattern from Phase 7 if needed for oclif topic disambiguation

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project specs
- `packages/twentythree-cli/specs/twentythree-api-swagger.json` — authoritative API spec; all endpoint paths, params, response shapes come from here
- `.planning/REQUIREMENTS.md` — full requirement list for Phase 8 (SPT-*, THB-*, WHK-*, APP-*, PRS-*, PRT-*, SES-*, OUP-*, SITE-*, USR-*, CLI-05, CLI-06)

### Established patterns (read before implementing)
- `packages/twentythree-cli/src/lib/base-command.ts` — BaseCommand; add `--agent` flag here
- `packages/twentythree-cli/src/lib/output.ts` — renderTable, renderKeyValue, renderCount
- `packages/twentythree-cli/src/upload/chunk-pool.ts` — chunked upload engine (used by `openupload upload-file`)
- `packages/twentythree-cli/src/commands/video/upload.ts` — reference for `openupload upload-file` flag design
- `packages/twentythree-cli/src/commands/analytics/video/index.ts` — 3-level topic root command pattern

### Prior phase context
- `.planning/phases/07-analytics-audience/07-CONTEXT.md` — D-4 (pagination), D-5 (audience field 3-level topic) — global patterns apply to Phase 8

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/base-command.ts` — add `--agent` global flag here; all commands inherit automatically
- `src/lib/output.ts` — `renderTable()`, `renderKeyValue()`, `renderCount()` used by all commands
- `src/lib/analytics-flags.ts` — example of shared flag module (pattern for any shared flags needed in Phase 8)
- `src/upload/chunk-pool.ts` — chunked engine reused by `openupload upload-file` (OUP-02 mandate)
- `src/lib/pagination.ts` — pagination helpers for list commands

### Established Patterns
- Destructive commands: `await confirm({ message: 'Delete X on domain.com?' })` → `this.exit(2)` on cancel
- Table output: `renderTable(data, columns)` followed by `renderCount(n, 'singular', 'plural')`
- `--json` flag: inherited from BaseCommand; commands check `this.jsonEnabled()` before `this.log()`
- 3-level topics: directory structure auto-registers in oclif — `thumbnail/file/list.ts` → `twentythree thumbnail file list`

### Integration Points
- `doctor` connects to: credential store (conf + keyring), active workspace domain, HTTP client
- `--agent` flag connects to: BaseCommand (global registration), each command's static metadata
- `openupload upload-file` connects to: chunk-pool engine (same as `video upload`)
- `thumbnail file upload` connects to: HTTP client with multipart form (same pattern as subtitle upload)

</code_context>

<specifics>
## Specific Ideas

- `doctor` output chosen to match the coloured table mockup exactly: Check | Status | Detail columns, chalk green/red, overall exit code reflects aggregate
- `--help --agent` JSON must include `auth_scope`, `output_shape`, and `side_effects` in addition to the standard oclif fields — these are what make it useful for AI agents vs plain `--help`
- `presentation` 3-level structure chosen to mirror `analytics` pattern already in codebase

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 08-platform-polish*
*Context gathered: 2026-04-16*
