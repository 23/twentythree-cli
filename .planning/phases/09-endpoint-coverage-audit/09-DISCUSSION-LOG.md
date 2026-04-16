# Phase 9: Endpoint Coverage Audit - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-16
**Phase:** 09-endpoint-coverage-audit
**Areas discussed:** EXCLUDED_OPERATIONS format, Gap fill scope, Phantom detection

---

## EXCLUDED_OPERATIONS Format

| Option | Description | Selected |
|--------|-------------|----------|
| Constant in source | TypeScript array in e.g. src/lib/audit.ts — co-located with audit logic, type-checked, importable | ✓ |
| Standalone JSON file | dedicated excluded-operations.json at package root | |
| Top of audit script | Inline list at top of the script itself | |

**User's choice:** Constant in source

---

| Option | Description | Selected |
|--------|-------------|----------|
| Endpoint + rationale string | `{ endpoint, reason }` | |
| Endpoint + rationale + category | `{ endpoint, reason, category }` | ✓ |
| Endpoint only | Just a list of strings | |

**User's choice:** Endpoint + rationale + category

---

## Gap Fill Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Full hand-authored quality | Same standard as existing 219 commands — typed flags, --json, table, agentMetadata | ✓ |
| Minimal skeleton | Enough to register the endpoint, no UX polish | |
| Depends on endpoint type | Full quality for user-facing, skeleton for admin/internal | |

**User's choice:** Full hand-authored quality

---

| Option | Description | Selected |
|--------|-------------|----------|
| Exclude with rationale | Add to EXCLUDED_OPERATIONS with category + reason; audit still exits 0 | ✓ |
| Implement everything | Build a command for every endpoint regardless of scope | |
| Ask per endpoint during execution | Decide at implementation time | |

**User's choice:** Exclude with rationale (for admin/super-scope endpoints with no practical CLI use case)

---

## Phantom Detection

| Option | Description | Selected |
|--------|-------------|----------|
| Fail the audit (exit non-zero) | Phantom = error; must be fixed | ✓ |
| Warn but don't fail | Print warnings, still exit 0 | |

**User's choice:** Fail the audit (exit non-zero)

---

## Claude's Discretion

- Audit script location, naming, exact output format
- Category values used in EXCLUDED_OPERATIONS
- Order of gap-fill vs script-writing in the plan

## Deferred Ideas

None
