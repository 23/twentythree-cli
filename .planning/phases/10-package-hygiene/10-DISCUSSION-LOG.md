# Phase 10: Package Hygiene - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-16
**Phase:** 10-package-hygiene
**Areas discussed:** Metadata values, prepack scope, files: /docs pre-inclusion, Version bump

---

## Metadata Values

| Option | Description | Selected |
|--------|-------------|----------|
| Name only | e.g. "TwentyThree" — clean, standard npm format | ✓ |
| Name + email | "Name <email@example.com>" | |
| Name + URL | "Name <https://twentythree.com>" | |

**User's choice:** Name only → `"TwentyThree"`

| Option | Description | Selected |
|--------|-------------|----------|
| https://github.com/23/twentythree-cli | Standard org/repo for TwentyThree's GitHub org | ✓ |
| Different URL | A different GitHub org or repo name | |

**User's choice:** `https://github.com/23/twentythree-cli`

| Option | Description | Selected |
|--------|-------------|----------|
| twentythree, video, api, cli | Core discoverability terms | ✓ |
| twentythree, video, api, cli, media, platform | Broader reach | |
| You decide | Claude chooses | |

**User's choice:** `["twentythree", "video", "api", "cli"]`

---

## prepack Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Build only | `pnpm build` — tsdown + oclif manifest | ✓ |
| Build + tests | `pnpm build && pnpm test` | |
| Build + lint + tests | Full quality gate | |

**User's choice:** Build only — `"prepack": "pnpm build"`

---

## files: /docs Pre-inclusion

| Option | Description | Selected |
|--------|-------------|----------|
| Add it now | Phase 10 owns all files changes per PKG-03 | ✓ |
| Leave to Phase 11 | Phase 11 creates docs/, adds /docs then | |

**User's choice:** Add `/docs` and `/README.md` to files in Phase 10.

---

## Version Bump

| Option | Description | Selected |
|--------|-------------|----------|
| Leave for Phase 13 | Phase 13 (npm Publish) owns versioning | ✓ |
| Bump to 1.0.0 now | Version package in Phase 10 | |

**User's choice:** Leave versioning to Phase 13. Keep `0.1.0` for now.

---

## Deferred Ideas

- Version bump — deferred to Phase 13 to keep versioning atomic with npm publish.
