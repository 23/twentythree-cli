# Phase 10: Package Hygiene - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Make `packages/twentythree-cli/package.json` publish-ready: fill required npm metadata fields, wire a `prepack` script so every tarball contains a fresh build, and update the `files` array to include all assets that should ship.

Version bumping (0.1.0 → 1.0.0) is explicitly deferred to Phase 13 (npm Publish).

</domain>

<decisions>
## Implementation Decisions

### Required Metadata Fields (PKG-01)

- **D-01:** `author` → `"TwentyThree"` (name only, no email or URL)
- **D-02:** `repository` → `{ "type": "git", "url": "https://github.com/23/twentythree-cli.git" }`
- **D-03:** `homepage` → `"https://github.com/23/twentythree-cli#readme"`
- **D-04:** `bugs` → `{ "url": "https://github.com/23/twentythree-cli/issues" }`
- **D-05:** `keywords` → `["twentythree", "video", "api", "cli"]`

### prepack Script (PKG-02)

- **D-06:** `prepack` runs **build only** — `pnpm build` (tsdown + oclif manifest). No tests in prepack. Tests are a CI concern, not a pack concern.

### files Array (PKG-03)

- **D-07:** Add `/docs` and `/README.md` to the `files` array **now** (Phase 10), even though docs/ doesn't exist yet. Phase 10 owns all files array changes per PKG-03; including a not-yet-created directory is harmless.
- **D-08:** Final files array: `["/bin", "/dist", "/oclif.manifest.json", "/docs", "/README.md"]`

### Version

- **D-09:** Do **not** bump version in this phase. Leave `0.1.0` as-is. Phase 13 (npm Publish) owns the version bump to `1.0.0`.

### Claude's Discretion

- Exact field ordering in package.json — place new fields near existing metadata fields (name, description, license), following npm convention.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Current Package State
- `packages/twentythree-cli/package.json` — current state; all edits happen here

### Requirements
- `.planning/ROADMAP.md` §Phase 10 — success criteria: `npm pack --dry-run` includes `/docs`, `/README.md`, `/dist`, `oclif.manifest.json`; `prepack` exists; PKG-01/02/03 fields present

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/twentythree-cli/package.json` — the only file being modified; current `scripts`, `files`, and `oclif` sections are already correct
- Existing `build` script (`pnpm build` = `tsdown --config-loader unrun && oclif manifest`) is what `prepack` should invoke

### Established Patterns
- Build pipeline: tsdown → CJS dist → oclif manifest (postbuild). `prepack` calls the existing `build` script.
- No existing prepack/prepare/postpack hooks — clean slate.

### Integration Points
- Phase 11 (Documentation) will create `docs/` directory — Phase 10 pre-wires `/docs` in files so Phase 11's output is automatically included in the tarball.
- Phase 12 (READMEs) will create `README.md` at the package root — Phase 10 pre-wires `/README.md` similarly.
- Phase 13 (npm Publish) will bump version and run `npm publish` — relies on this phase's prepack to produce a correct tarball.

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for field formatting.

</specifics>

<deferred>
## Deferred Ideas

- Version bump (0.1.0 → 1.0.0) — intentionally deferred to Phase 13 to keep versioning atomic with the publish action.

</deferred>

---

*Phase: 10-package-hygiene*
*Context gathered: 2026-04-16*
