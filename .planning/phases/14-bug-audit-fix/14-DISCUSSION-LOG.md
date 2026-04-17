# Phase 14: Bug Audit & Fix - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-17
**Phase:** 14-bug-audit-fix
**Areas discussed:** Fix scope, Testing strategy, Republish to npm

---

## Fix Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Undefined refs only | Fix only TS2304 'Cannot find name' and runtime ReferenceError crashes. Pre-existing type mismatches are separate issues — keep the phase tight. | |
| All TypeScript errors | Fix everything — undefined refs AND the ~12 pre-existing type mismatches. Cleaner codebase but broader scope. | ✓ |

**User's choice:** All TypeScript errors
**Notes:** Broader scope but user wants a clean tsc output after this phase.

---

## Testing Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Vitest + TypeScript check | Run `pnpm test --run` and `tsc --noEmit`. If both pass clean, done. | ✓ |
| Vitest + tsc + smoke test | Also manually run fixed commands against the live API. | |

**User's choice:** Vitest + TypeScript check (no live API smoke test required)

---

## Republish to npm

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — rebuild + republish | Run `pnpm build` + `npm publish` as the final step. | ✓ |
| No — source fixes only | Fix source and commit; publish is a later concern. | |

**User's choice:** Yes — rebuild + republish

---

## Claude's Discretion

- Order of fixes within the phase
- Whether to fix the `conf` moduleResolution tsconfig warning
- Patch version bump value for the publish

## Deferred Ideas

None.
