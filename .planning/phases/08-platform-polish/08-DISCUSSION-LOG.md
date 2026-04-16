# Phase 8: Platform & Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-16
**Phase:** 08-platform-polish
**Areas discussed:** doctor design, --help --agent format, thumbnail file upload approach, presentation topic structure

---

## doctor design

| Option | Description | Selected |
|--------|-------------|----------|
| Credentials + connectivity + token | 3 checks, structured pass/fail per check | ✓ |
| Credentials only | No network call, fast | |
| Credentials + full API smoke test | Additional representative API calls | |

**User's choice:** Credentials + connectivity + token (recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Coloured pass/fail table | Check/Status/Detail table, green/red chalk, exit 0/1 | ✓ |
| Bulleted list with spinner | Animated per-check, resolves to ✓/✗ | |

**User's choice:** Coloured pass/fail table (recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Report only, no auto-fix | Exit 1, user re-authenticates manually | ✓ |
| Suggest the fix command | Print hint to run auth credentials | |
| Offer to re-auth interactively | Prompt and launch auth flow on failure | |

**User's choice:** Report only, no auto-fix (recommended)

---

## --help --agent format

| Option | Description | Selected |
|--------|-------------|----------|
| Structured JSON — oclif-derived | Extend oclif help with agent block | ✓ |
| MCP-compatible tool schema | MCP spec JSON Schema output | |
| Plain markdown help | Just --help text to stdout | |

**User's choice:** Structured JSON — oclif-derived (recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Global flag on every command | Registered in BaseCommand, all inherit | ✓ |
| Standalone `help` command | Separate `twentythree help <cmd> --agent` | |

**User's choice:** Global flag on every command (recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Flags + description + example + API endpoint | Minimum for AI invocation | |
| Flags + description + example only | No endpoint mapping | |
| Full metadata including auth scope + output shape | auth_scope, output_shape, side_effects also included | ✓ |

**User's choice:** Full metadata including auth scope + output shape

---

## thumbnail file upload approach

| Option | Description | Selected |
|--------|-------------|----------|
| Direct multipart — thumbnails are images | No chunked engine, images are <5 MB | ✓ |
| Chunked engine for consistency | Same engine as video upload | |
| Auto-select based on file size | Branch on <10 MB threshold | |

**User's choice:** Direct multipart — thumbnails are images (recommended)

---

## presentation topic structure

| Option | Description | Selected |
|--------|-------------|----------|
| 3-level: presentation/setting/ and presentation/page/ | Mirrors domain structure, consistent with analytics pattern | ✓ |
| Flat: all under presentation/ | presentation/setting-list.ts etc. | |

**User's choice:** 3-level topic structure (recommended)

---

## Claude's Discretion

- Flag naming for unspecified commands
- `openupload upload-file` flag shape (follow `video upload` pattern)
- Column selection for table output per command
- Whether to add root index.ts files for topic disambiguation

## Deferred Ideas

None.
