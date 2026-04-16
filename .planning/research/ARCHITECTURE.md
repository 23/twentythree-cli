# Architecture Patterns — v1.1 Docs & Audit Milestone

**Domain:** CLI documentation pipeline and endpoint coverage audit for a 219-command oclif v4 TypeScript CLI
**Project:** twentythree-cli v1.1 — Repository Polish & Release
**Researched:** 2026-04-16
**Overall confidence:** HIGH — all findings derived directly from the live codebase

---

## Context: What Already Exists

This architecture document is scoped to the v1.1 milestone additions only. The existing codebase state:

- 219 command files in `packages/twentythree-cli/src/commands/` organized by topic (24 topics)
- Every command file declares `static agentMetadata = { api_endpoint, auth_scope, output_shape, side_effects }`
- `oclif.manifest.json` is generated at build time (`postbuild: oclif manifest`) and **already includes `agentMetadata`** for all 219 commands — this is the key leverage point for generation
- 226 entries in the manifest (219 real commands + 7 topic index files that lack agentMetadata)
- OpenAPI spec at `packages/twentythree-cli/specs/twentythree-api-swagger.json` with 235 endpoints across 235 paths
- Current coverage gap: 210 of 235 spec endpoints have a matching `api_endpoint` field (25 uncovered, all in analytics sub-paths)

---

## New Components (v1.1)

### What Gets Added

| Component | Type | Location |
|-----------|------|----------|
| README.md | New file | Repo root (`/`) |
| docs/ folder | New directory | `packages/twentythree-cli/docs/` |
| docs/commands/ | Auto-generated | `packages/twentythree-cli/docs/commands/` |
| docs/guides/ | Hand-authored | `packages/twentythree-cli/docs/guides/` |
| scripts/generate-docs.ts | New script | `packages/twentythree-cli/scripts/generate-docs.ts` |
| scripts/audit-endpoints.ts | New script | `packages/twentythree-cli/scripts/audit-endpoints.ts` |
| pnpm script `docs` | New | Root `package.json` scripts |
| pnpm script `audit` | New | Root `package.json` scripts |

---

## README.md Placement

**Put README.md at the monorepo root (`/README.md`), not inside the package.**

Rationale:
- GitHub renders the root README as the repository homepage — that is the primary discovery surface for contributors and users browsing the repo
- npm also renders `packages/twentythree-cli/README.md` on the package page — this needs to exist too, but it can be a shorter install-focused version that links to the root README for full docs
- The monorepo root README serves repo visitors; the package README serves npm visitors; they are different audiences

Recommended structure:

```
/README.md                          (repo root — full README for GitHub)
packages/twentythree-cli/README.md  (npm package README — install + quickstart + link to docs/)
```

The root README should contain: what it is, install command, quickstart (auth + first command), link to `docs/` for the full command reference.

The package README can be shorter: install one-liner, auth setup, one example command, link to GitHub for full docs.

---

## docs/ Folder Structure

Place the docs folder **inside the package**, not at the repo root:

```
packages/twentythree-cli/
└── docs/
    ├── README.md                    Index — links to all doc sections
    ├── commands/                    Auto-generated command reference (one file per topic)
    │   ├── action.md
    │   ├── analytics.md
    │   ├── auth.md
    │   ├── category.md
    │   ├── ...                      (one file per topic, 24 total)
    │   └── video.md
    ├── guides/
    │   ├── getting-started.md       Install + auth setup + first commands
    │   ├── api-spec-upgrade.md      How to run update-api-spec.sh and fix types
    │   └── contributing.md          Dev setup, build, test, PR process
    └── endpoint-coverage.md         Auto-generated audit output (see below)
```

**Why one file per topic (not one file per command):** 219 individual files would be unnavigable. Topic-level files (24 files) match how users think: "I want to know about video commands," not "I want the file for video:list specifically." Each topic file lists all commands in that topic with flags, examples, and the mapped API endpoint.

**Why docs/ inside the package:** The docs are specific to the CLI package. Root-level docs/ implies cross-package scope. Keeping it inside `packages/twentythree-cli/docs/` keeps the package self-contained and means the published npm package can include docs in its `files` array if desired.

**Include docs/ in the npm package files array** (optional but recommended for offline reference):
```json
"files": ["/bin", "/dist", "/oclif.manifest.json", "/docs"]
```

---

## Command Reference Generation Pipeline

### Source of Truth: oclif.manifest.json

The manifest is the right data source for doc generation — **not the TypeScript source files**. Reasons:

1. The manifest is already generated at build time (`postbuild: oclif manifest`) — reading it requires no TypeScript compilation in the docs script
2. It already contains `agentMetadata` (confirmed in the live manifest: all 219 real commands have it)
3. It contains flags with descriptions, `required`, `type`, `allowNo`, `char` — everything needed for a flags reference table
4. It contains `examples`, `description`, `args`, `enableJsonFlag`
5. Topic index files (the 7 entries without `agentMetadata`) can be filtered out by checking for the presence of `agentMetadata`

### Script: scripts/generate-docs.ts

**Input:** `oclif.manifest.json` (relative to package root)
**Output:** `docs/commands/*.md` (one file per topic) + `docs/README.md` (index)

**Algorithm:**

```
1. Read oclif.manifest.json
2. Filter to real commands: entries where agentMetadata exists
3. Group by topic: split command id on ':' → topic = id.split(':')[0]
4. For each topic, sort commands alphabetically by full id
5. Write docs/commands/{topic}.md with:
   - H1: Topic name (capitalized)
   - Topic description (from the topic index command's description field)
   - Table of commands: | Command | Description | API Endpoint | Auth Scope |
   - Per command section:
     - H2: twentythree {command id with spaces instead of colons}
     - Description paragraph
     - Flags table: | Flag | Type | Required | Description |
     - Examples block (fenced code)
     - agentMetadata summary line: "API: {api_endpoint} | Scope: {auth_scope}"
6. Write docs/README.md as a topic index table linking to each topic file
```

**Flag table columns:** `--flag` / `-shortchar`, type (`string` | `boolean` | `integer`), Required (`yes` | `no`), Description. Hidden flags (like `--include-unpublished-p`) should be omitted — filter entries where `hidden: true`.

**Dependency on build:** The script reads `oclif.manifest.json` which is only accurate after `pnpm build`. Wire this as a `postbuild` step or a separate `docs` script that requires build to have run first. A simple check at script start — verify manifest exists and is newer than src/ — can guard against stale manifests.

**Add to package.json scripts:**
```json
"docs": "tsx scripts/generate-docs.ts"
```

Add `tsx` as a dev dependency (or use `ts-node`). Alternatively, write the script in plain JavaScript to avoid a compile step — the manifest is already JSON, and the output is Markdown, so no TypeScript features are needed. A plain `.mjs` script avoids the tsx dependency.

**Recommended: write generate-docs as a plain Node.js `.mjs` script** — simpler, no build step needed, directly readable.

### Build Order

```
pnpm build                          (tsdown compile + oclif manifest regenerate)
    → dist/ and oclif.manifest.json updated
pnpm docs                           (reads manifest, writes docs/commands/*.md)
    → docs/commands/*.md updated
```

In CI, run `pnpm build && pnpm docs` before publishing to ensure docs reflect the built manifest.

---

## Endpoint Audit Script

### Problem

The audit must compare 235 OpenAPI spec endpoints against the `api_endpoint` field declared in each command's `agentMetadata`. The complication is the legacy naming in the spec: spec paths use `/photo/`, `/album/`, `/live/` but commands use `api_endpoint: 'GET /photo/list'` — they intentionally retain the spec's legacy path names in `agentMetadata` (the mapping to modern CLI terms happens in command UX, not in the API path).

This means the comparison is **direct string match** between spec paths (`METHOD /path`) and `agentMetadata.api_endpoint` values. No translation layer is needed in the audit script.

### Current Coverage (from live codebase analysis)

- 235 spec endpoints
- 219 `agentMetadata.api_endpoint` declarations (some commands have `api_endpoint: 'local'` for commands that don't call the API)
- 210 direct matches between spec endpoints and command `api_endpoint` values
- 25 uncovered spec endpoints (all in analytics sub-paths: timeseries/totals variants)
- 5 commands with duplicate `api_endpoint` (two commands cover the same endpoint — expected for `GET /photo/list` which maps to both `video list` and `video get`)
- 3 commands with `api_endpoint: 'local'` (auth:status, workspace:use, workspace:list — correct, these don't call the API)

### Script: scripts/audit-endpoints.ts (or .mjs)

**Inputs:**
1. `specs/twentythree-api-swagger.json` — OpenAPI spec
2. `oclif.manifest.json` — command manifest with agentMetadata

**Algorithm:**

```
1. Read spec, extract all (METHOD PATH) strings:
   for each path in spec.paths:
     for each method in [get, post, put, delete, patch]:
       if method exists: spec_endpoints.add(`${METHOD} ${path}`)

2. Read manifest, extract all api_endpoint values:
   for each command where agentMetadata exists:
     ep = command.agentMetadata.api_endpoint
     if ep && ep !== 'local': command_endpoints.add(ep)

3. Compute:
   covered = intersection(spec_endpoints, command_endpoints)
   uncovered = spec_endpoints - command_endpoints
   phantom = command_endpoints - spec_endpoints  (command references non-existent endpoint)
   duplicates = endpoints covered by 2+ commands

4. Output report to stdout and write docs/endpoint-coverage.md:
   - Total spec endpoints: N
   - Covered: N (percent)
   - Uncovered: N (list)
   - Phantom: N (list — these are bugs)
   - Duplicate coverage: N (list — may be intentional)
   - Exit code 0 if uncovered == 0 && phantom == 0, else exit code 1
```

**Exit code 1 on gaps** makes this usable as a CI gate.

**Phantom endpoints** (command `api_endpoint` values that don't match any spec path) are more important than uncovered — they indicate a command is calling a deleted or renamed endpoint.

### Data Flow

```
specs/twentythree-api-swagger.json
          |
          v
    audit-endpoints.mjs
          |
          v
    oclif.manifest.json
          |
          v
    stdout report + docs/endpoint-coverage.md
    exit 0 (full coverage) or exit 1 (gaps found)
```

**Add to root package.json scripts:**
```json
"audit": "pnpm --filter twentythree-cli exec node scripts/audit-endpoints.mjs"
```

Or add directly to `packages/twentythree-cli/package.json`:
```json
"audit": "node scripts/audit-endpoints.mjs"
```

---

## Integration Points Summary

| New Component | Reads From | Writes To | Depends On |
|---------------|-----------|----------|-----------|
| `scripts/generate-docs.mjs` | `oclif.manifest.json` | `docs/commands/*.md`, `docs/README.md` | Build must run first (manifest must be current) |
| `scripts/audit-endpoints.mjs` | `oclif.manifest.json`, `specs/twentythree-api-swagger.json` | `docs/endpoint-coverage.md`, stdout | Manifest must be current; spec must be current |
| `/README.md` | — | — | Hand-authored once; references docs/ paths |
| `packages/twentythree-cli/README.md` | — | — | Hand-authored once; shorter install-focused |
| `docs/guides/*.md` | — | — | Hand-authored; no generation dependency |

---

## Modified Files

| File | Change |
|------|--------|
| `packages/twentythree-cli/package.json` | Add `"docs"` and `"audit"` scripts; optionally add `/docs` to `files` array |
| `packages/twentythree-cli/package.json` | Add `tsx` or leave as plain `.mjs` (no new dep if plain JS) |
| Root `package.json` | Add `"docs"` and `"audit"` workspace scripts for convenience |

---

## Build Order for v1.1 Work

This reflects hard dependencies — each step requires the previous to be complete.

```
Step 1: Write audit script (scripts/audit-endpoints.mjs)
  — No dependencies; reads existing manifest and spec
  — Run it immediately to get the actual gap report
  — Fix gaps found before writing docs (docs should reflect complete coverage)

Step 2: Fill coverage gaps found by audit
  — 25 uncovered analytics endpoints currently
  — Add missing command files, rebuild, rerun audit until exit 0

Step 3: Write generate-docs script (scripts/generate-docs.mjs)
  — After coverage is complete, manifest is authoritative
  — Generate initial docs/commands/*.md files

Step 4: Write hand-authored docs
  — docs/guides/getting-started.md
  — docs/guides/api-spec-upgrade.md  (already described in CLAUDE.md; formalize it)
  — docs/guides/contributing.md

Step 5: Write README files
  — packages/twentythree-cli/README.md  (install + quickstart)
  — /README.md  (repo root — links to package README and docs/)

Step 6: Verify npm publish readiness
  — pnpm build && pnpm audit && pnpm docs
  — All three must succeed cleanly before publish
```

**Critical path:** audit script → fill gaps → generate-docs → READMEs. The docs cannot be final until coverage is complete.

---

## Anti-Patterns to Avoid

### Reading TypeScript Source for Doc Generation

**Problem:** Parsing TypeScript source with regex or AST to extract agentMetadata
**Why bad:** Fragile, requires TypeScript parsing infrastructure, re-implements what oclif manifest already provides
**Instead:** Read `oclif.manifest.json` — it already contains the compiled, normalized metadata

### One Markdown File Per Command

**Problem:** Writing 219 individual `.md` files under `docs/commands/`
**Why bad:** Unnavigable, high file count, GitHub directory rendering becomes useless
**Instead:** One file per topic (24 files) with all commands in that topic listed

### Generating Docs Without Build Dependency

**Problem:** Running generate-docs before or instead of build
**Why bad:** `oclif.manifest.json` is generated by `oclif manifest` as a postbuild step; if docs run against a stale manifest, they will reflect outdated command definitions
**Instead:** Always run `pnpm build` before `pnpm docs`; add a manifest-freshness guard in the script

### Audit Script With Fuzzy Matching

**Problem:** Trying to match CLI command names (modern terms) against spec paths (legacy terms) via heuristics
**Why bad:** The `api_endpoint` field in `agentMetadata` already stores the legacy spec path — the mapping is already done. Fuzzy matching introduces false positives and false negatives.
**Instead:** Direct string comparison between spec `METHOD /path` and `agentMetadata.api_endpoint` values

### Treating Topic Index Commands as Real Commands

**Problem:** Including topic index entries (category, video, webinar, thumbnail, video:section, video:subtitle) in the command reference output
**Why bad:** These are display-only entries for `twentythree help video` — they have no flags, no args, no agentMetadata
**Instead:** Filter by presence of `agentMetadata` field in the manifest entry — all 219 real commands have it; the 7 topic indexes do not

---

## Scalability Notes

The generate-docs script will run in under a second — it reads one ~560KB JSON file and writes 24 markdown files. No performance considerations needed.

The audit script is equally fast — two JSON file reads and set operations over 235 and 219 items.

If the API grows significantly (e.g. to 500+ endpoints), the one-file-per-topic structure still works because topics will grow naturally with the API. The only change needed is adding new topic files as new resource groups are introduced.

---

## Sources

- Live codebase analysis: `packages/twentythree-cli/oclif.manifest.json` (226 entries confirmed)
- Live codebase analysis: endpoint coverage gap computed directly (210/235 matched, 25 uncovered)
- agentMetadata confirmed present in manifest for all 219 real commands; absent for all 7 topic indexes
- oclif manifest generation: `postbuild: oclif manifest` in `packages/twentythree-cli/package.json`
- Spec path format confirmed: uses legacy naming (`/photo/`, `/album/`, `/live/`) matching `api_endpoint` field values in source
