---
phase: "01"
slug: foundation
status: verified
threats_open: 0
asvs_level: 1
created: 2026-04-14
---

# Phase 01 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| bin/run.js Node guard | `process.versions.node` is runtime-provided — trusted | Version string only; no user input |
| OpenAPI spec fetch | Network fetch from `https://video.twentythree.com/apidocs/swagger.json` at build time | Public API schema; read-only; no credentials |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-01-01 | N/A | scaffold | accept | No security surface — project structure files only; no runtime code | closed |
| T-01-02 | Tampering | bin/run.js | accept | Committed source file; included in npm `files`; no runtime user input processed | closed |
| T-01-03 | Elevation of Privilege | Node guard bypass | accept | Guard is defense-in-depth; `engines` field enforces via npm/pnpm; guard catches direct `node bin/run.js` invocations on old Node | closed |
| T-01-04 | Tampering | OpenAPI spec fetch | accept | Fetched from HTTPS public endpoint; generated types reviewed via git diff before commit; compile-time only — no runtime trust | closed |
| T-01-05 | Information Disclosure | term-map.ts | accept | Mappings are public API knowledge; no secrets or credentials involved | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-01-01 | T-01-01 | Foundation phase creates only scaffolding — package.json, tsconfig, turbo.json. Zero runtime code, zero attack surface. | gsd-security-auditor | 2026-04-14 |
| AR-01-02 | T-01-02 | bin/run.js is committed source distributed via npm. Tampering requires either repo write access or npm publish compromise — both are outside the CLI's threat model for v1. | gsd-security-auditor | 2026-04-14 |
| AR-01-03 | T-01-03 | The Node version guard is defense-in-depth, not a primary security control. The `engines` field in package.json enforces the minimum at install time. Bypass requires intentional misuse. | gsd-security-auditor | 2026-04-14 |
| AR-01-04 | T-01-04 | The OpenAPI spec URL is public and unauthenticated by design. Types are generated at dev time and checked into source — a compromised fetch would be caught in code review via git diff. Generated types carry no runtime trust. | gsd-security-auditor | 2026-04-14 |
| AR-01-05 | T-01-05 | Term map contains only publicly documented API terminology mappings (photo↔video, album↔category, live↔webinar). No credentials, tokens, or sensitive configuration. | gsd-security-auditor | 2026-04-14 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-04-14 | 5 | 5 | 0 | gsd-secure-phase (automated) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-04-14
