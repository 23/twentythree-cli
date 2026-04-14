# Phase 1: Foundation - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

A runnable, installable CLI skeleton exists with correct project structure, generated API types, and the terminology-mapping module ready for all downstream work. No real commands beyond `--version` and `--help` are shipped in this phase — those begin in Phase 2.

</domain>

<decisions>
## Implementation Decisions

### OpenAPI type generation
- The public `video.twentythree.com/apidocs/swagger.json` exposes all endpoints and does NOT require authentication to fetch — confirmed by the user
- The generation script (`pnpm generate-types`) fetches directly from the public URL using `openapi-typescript` CLI and outputs `packages/twentythree-cli/src/api/types.ts`
- Generated types are committed to the repo; the script is re-runnable to regenerate on spec changes (FOUND-05)

### Monorepo package scope
- Phase 1 scaffolds BOTH packages: `twentythree-cli` (real CLI) and `twentythree-skills` (stub only — `SKILL.md` placeholder, no real content)
- This establishes the final two-package monorepo architecture from day one (FOUND-01)
- `twentythree-skills` package is empty/stub; skills content is v2 work

### Node version minimum
- Minimum Node.js version: **Node 22**
- Set in `engines` field of both packages and root `package.json`
- If Node < 22 is detected at startup, CLI prints a clear error and exits with non-zero code (FOUND-04)

### CLI framework and structure
- oclif v4 (`@oclif/core` 4.x) with file-per-command layout, lazy manifest, topic namespacing (FOUND-02)
- Binary name: `twentythree` | npm package: `twentythree-cli`
- Build: tsdown (Rolldown-powered, tsup successor) — bundle to CJS for oclif compatibility

### Terminology module
- `term-map.ts` is the canonical module for API↔CLI terminology translation (FOUND-06)
- Bidirectional: API→CLI (for output) and CLI→API (for constructing API requests)
- Mappings: `photo`↔`video`, `album`↔`category`, `live`↔`webinar`
- Applied to ALL user-visible strings including error messages — no legacy term should ever surface

### Claude's Discretion
- Exact pnpm workspace / turborepo pipeline configuration
- tsdown entry point and output target details
- oclif manifest generation script setup
- Exact structure of `term-map.ts` exports (functions vs object vs both)

</decisions>

<specifics>
## Specific Ideas

- Modeled after `github.com/basecamp/basecamp-cli` — similar command structure and eventual AI skills pattern
- Skills package modeled after `github.com/basecamp/skills` — installable SKILL.md-based agent skill packages
- The CLI must not artificially limit API coverage — architecture should accommodate all 235 endpoints across 22 resource groups without restructuring

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project requirements and stack
- `.planning/REQUIREMENTS.md` — All 148 requirements; Phase 1 scope is FOUND-01 through FOUND-06
- `.planning/PROJECT.md` — Auth model, terminology mapping rules, URL normalization requirements, API scope breakdown
- `CLAUDE.md` — Recommended stack table with exact versions, alternatives considered, and rationale

### API spec
- `https://video.twentythree.com/apidocs/swagger.json` — Authoritative OpenAPI spec for all 235 endpoints; fetch for type generation

### Reference implementations
- `github.com/basecamp/basecamp-cli` — Reference CLI for command structure, file layout, and oclif patterns
- `github.com/basecamp/skills` — Reference for skills package structure and SKILL.md format

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — project is greenfield

### Established Patterns
- None yet — Phase 1 establishes the patterns all downstream phases will follow

### Integration Points
- `packages/twentythree-cli/src/api/types.ts` — Generated types; consumed by the API client in Phase 3
- `packages/twentythree-cli/src/lib/term-map.ts` — Terminology module; consumed by all commands in Phases 2–8

</code_context>

<deferred>
## Deferred Ideas

- Browser OAuth login (`twentythree auth login`) — deferred to v2
- AI skills content (`twentythree-skills` package body) — stub in Phase 1, real content in v2
- Shell completions — Phase 8 / v2

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-04-14*
