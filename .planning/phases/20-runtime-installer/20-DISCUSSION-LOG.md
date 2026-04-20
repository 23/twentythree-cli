# Phase 20: Runtime Installer - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-20
**Phase:** 20-runtime-installer
**Areas discussed:** Multi-runtime behavior, Files to copy, Output verbosity, No-runtime fallback

---

## Multi-runtime behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Install to all detected | Silently install to every detected runtime — no prompt | ✓ |
| Prompt user | When 2+ runtimes detected, show a menu to pick one | |
| `--target` flag | Explicit runtime selection via flag, auto-detect as default | |

**User's choice:** Install to all detected runtimes silently.
**Notes:** Idempotency makes "install everywhere" safe — re-running is harmless, so no prompt needed.

---

## Files to copy

| Option | Description | Selected |
|--------|-------------|----------|
| Root SKILL.md only | Copy only `skills/SKILL.md` (1 file per runtime) | |
| Full skills/ tree | Copy `SKILL.md` + `reference/` (22 files) + `workflows/` (2 files) = 25 files | ✓ |

**User's choice:** Full skills/ tree.
**Notes:** Agents get all reference files available locally — no need to fall back to `--agent` introspection for flag details.

---

## Output verbosity

| Option | Description | Selected |
|--------|-------------|----------|
| Per-file listing | One line per file written, grouped by runtime with a header | ✓ |
| Summary line | `Installed 25 files to ~/.claude/skills/twentythree/` per runtime | |
| Silent | No output on success | |

**User's choice:** Per-file listing (full context).
**Notes:** Print every destination file written; group under a runtime header for readability.

---

## No-runtime fallback

| Option | Description | Selected |
|--------|-------------|----------|
| Short message + npm link | Print directories checked + link to npmjs.com/package/twentythree-skills, exit 0 | ✓ |
| Create fallback directory | Install to a default location regardless | |
| Error out | Exit non-zero if no runtime detected | |

**User's choice:** Short message + npm link, exit 0.
**Notes:** No runtime found is not an error — user may be on a clean machine. Link to npm page for manual install instructions.

---

## Deferred Ideas

None.
