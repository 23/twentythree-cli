# Feature Landscape: Agent Behavioral Guide (v1.5)

**Domain:** AI agent skills / behavioral guidance document
**Researched:** 2026-04-23
**Scope:** Categorization and depth analysis of the 7 user-specified behavioral rules for `guide.md`

---

## Summary

The 7 rules fall into two natural categories: **correctness rules** (getting these wrong produces wrong results or broken API calls) and **preference rules** (getting these wrong produces suboptimal but working behavior). Correctness rules need terse, firm statements plus a concrete example showing the right call. Preference rules need a short rationale sentence so the agent understands why, not just what.

Three implied rules surface from reading the existing reference files and the object model. These are documented below under "Implied Rules."

---

## Table Stakes (Must Document Clearly)

These rules, if violated, produce incorrect behavior — wrong API calls, broken URLs, or data the user did not ask for.

| Rule | Why It's Table Stakes | Required Depth |
|------|-----------------------|----------------|
| 1. Object type differentiation (video vs webinar) | Calling video commands on a webinar ID silently fails or returns wrong data. The CLI term-map routes `video` to `/photo/*` and `webinar` to `/live/*`. Wrong topic picks a different API family entirely. | Terse statement + one example pair showing `video list` vs `webinar list` |
| 5. Webinar creation defaults (draft, open_p) | Creates a publicly visible, open-registration webinar by default unless the agent knows to withhold `--publish` and omit `open_p`. Side effects are immediate and user-facing. | Terse rule + explicit "always omit X unless asked" phrasing; no example needed since it is a flag-omission rule |
| 6. Timezone handling | The API is timezone-aware; the platform stores timezone per workspace and per object. Converting to UTC before passing corrupts scheduling data. | One sentence rule + one "do not" example showing what to avoid |
| 7. Admin link construction | Admin links cannot be inferred from API response data alone. The agent must know the URL pattern and the workspace domain. Without this rule, agents present bare IDs. | Rule + URL pattern template table. Has a dependency: workspace domain must be known first. |

---

## Differentiators (Nice to Have Depth)

These rules, if violated, produce technically correct but suboptimal behavior — extra API calls, higher latency, or less useful output.

| Rule | Why It's a Differentiator | Required Depth |
|------|---------------------------|----------------|
| 2. Thumbnails: prefer listing URLs over dedicated endpoints | Saves an extra API call. Both approaches return the same image URL. The penalty for getting it wrong is performance, not correctness. | One-sentence rule + brief rationale ("the URL is already in the listing response") |
| 3. Analytics: prefer listing `--include-analytics` over the analytics API | Reduces round-trips for simple tasks. The analytics API is still correct; it is just a heavier path. | One-sentence rule + note on when the analytics API is appropriate (complex queries, cross-object aggregation) |
| 4. Filtering/sorting via listing flags | Prevents agents from fetching all records and filtering client-side. Wrong approach works; right approach is faster and uses less memory. | Rule + two or three representative examples showing `--status`, `--search`, and sorting flags in context |

---

## Complexity Assessment

| Rule | Statement Alone Enough? | Needs Example? | Needs Rationale? |
|------|------------------------|----------------|-----------------|
| 1. Object type differentiation | Yes | One pair (video vs webinar list) reinforces the topic-to-API mapping | No — the consequence is self-evident |
| 2. Thumbnails | Yes | No — the rule is "read from listing response first" | Yes — one sentence: why this is cheaper |
| 3. Analytics inclusion | Yes | Yes — show the `--include-analytics` flag in a list call | Yes — clarify when to use the analytics API instead |
| 4. Filtering/sorting | Yes | Yes — two or three examples cover common patterns | No |
| 5. Webinar creation defaults | Yes | No — it is a flag-omission rule | No — consequence is obvious (accidental public event) |
| 6. Timezone handling | Yes | Yes — a "do not" example prevents the UTC-conversion mistake | Yes — one sentence: "the platform applies workspace timezone" |
| 7. Admin link construction | Yes — but URL patterns must be stated explicitly | Yes — URL template table is the example | No |

---

## Dependencies Between Rules

**Rule 7 (admin links) depends on workspace domain being known.**
The workspace domain is available after authentication. `twentythree workspace list --json` retrieves it at runtime. The guide must explicitly state: "read the active workspace domain from `twentythree workspace list --json` before constructing links." SKILL.md already covers auth prerequisites; the guide can reference that rather than duplicating it.

**Rule 7 has four distinct URL patterns that must all be stated.**
These are not derivable from API responses — they are hardcoded management console paths. Agents cannot guess them. This is the only rule in the set that requires memorized knowledge (not flag names or API patterns).

- Video: `https://<domain>/manage/video/<id>`
- Webinar: `https://<domain>/manage/webinar/<id>`
- Webinar series: `https://<domain>/manage/webinar/series/<id>`
- User: `https://<domain>/manage/user/<id>`

**Rule 1 (object type) is a prerequisite for Rule 7 (admin links).**
Admin link construction requires knowing whether the resource is a video or a webinar before choosing the correct URL path segment. The guide should present Rule 1 before Rule 7.

**Rule 3 (analytics) and Rule 4 (filtering) are independent but related.**
Both concern listing endpoints. If grouped together in the guide under a "Listing Endpoints" section, they reinforce each other: listing endpoints are more capable than they appear; use them fully before reaching for specialized APIs.

---

## Implied Rules (Not Stated by User, But Follow From the 7)

Reading the reference files and the object model reveals three additional behavioral rules that naturally follow from the user's stated rules. These should be included in the guide.

**Implied Rule A: There is no `webinar get` — use `webinar list --search`.**
`webinar.md` documents this explicitly at the top: "There is no `webinar get` command. To retrieve details for a specific webinar, use `twentythree webinar list --search '<title>' --json` or filter by status/ID client-side." Agents default to `<topic> get <id>` patterns from the video reference and will fail on webinars without this knowledge. This is a correctness trap. It belongs grouped with Rule 1 (object type differentiation) because it is a direct consequence of the video/webinar behavioral difference.

**Implied Rule B: `--object-type` flag on `comment` commands requires the API name, not the CLI name.**
Both `video.md` and `webinar.md` include this callout: "When commenting on a video via the `comment` topic, pass `--object-type photo`" and `--object-type live` respectively. This is the inverse of the terminology mapping. The CLI maps outward to modern terms (video, webinar), but certain flag values still expect the legacy API name (photo, live). An agent that has internalized the CLI's modern terminology will pass `--object-type video` and fail silently. This belongs as a callout in the object type differentiation section alongside Rule 1.

**Implied Rule C: Clips are not immediately available after `webinar recording stop`.**
`webinar.md` documents this on `webinar clips`: "Clips become available after `webinar recording stop` — allow time for recording processing before calling this command." Agents scripting a post-broadcast workflow will call `webinar clips` immediately and receive an empty result. This is a sequencing trap rather than an API selection error. It fits as a brief note in the webinar defaults section or the filtering section, and does not need more than one sentence.

---

## Structural Recommendation for `guide.md`

Based on the above analysis, the guide should have four sections:

**Section 1: Object Types**
Covers Rule 1 and Implied Rules A and B. These are tightly coupled: all three concern correct API selection and correct flag values for the video/webinar object types. Terse statement per rule; one command pair example for Rule 1; a single-sentence callout for the `--object-type` legacy name gotcha.

**Section 2: Listing Endpoint Patterns**
Covers Rules 2, 3, and 4. All three share the insight that listing endpoints are richer than they appear. Group them under one heading with a one-sentence framing: "Before reaching for a specialized endpoint, check what the listing command already returns." Two to three examples for filtering; one-sentence rationales for thumbnail and analytics shortcuts. Implied Rule C (clip availability delay) fits here as a brief note on sequencing after recording stop.

**Section 3: Webinar Creation Defaults**
Covers Rule 5 alone. Short section. One paragraph, no example needed.

**Section 4: Data Handling**
Covers Rules 6 and 7. Both concern how the agent handles data sent to or returned from the API. Rule 6: one "do not" example. Rule 7: URL template table, plus the dependency note to fetch workspace domain first.

---

## Anti-Features: What the Guide Should NOT Include

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Exhaustive flag tables | Reference files already cover all flags; duplicating in guide causes drift and maintenance burden | Point to `--agent` flag and reference files |
| Auth setup instructions | Already in SKILL.md prerequisites section | Reference SKILL.md |
| Workflow step-by-step sequences | Already in `skills/workflows/` files | Reference workflow files for multi-step tasks |
| API endpoint paths (`/photo/`, `/live/`) | Terminology notes at bottom of each reference file cover this already | Reference those sections when context requires it |
| Conditional "it depends" framing | The guide exists to give firm guidance; hedged statements defeat the purpose | State the preferred path; note exceptions in one clause, not a paragraph |

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Rule categorization (correctness vs preference) | HIGH | Based on direct reading of reference files and object model |
| Implied rules (A, B, C) | HIGH | Explicitly documented in existing `webinar.md` and `video.md` |
| URL patterns for admin links (Rule 7) | MEDIUM | Patterns stated by user; cannot verify against live platform without a workspace. Treat as approximate until confirmed. |
| `open_p` flag existence and name (Rule 5) | MEDIUM | User-stated; the flag does not appear in the `webinar create` flag table in `webinar.md`. May be a raw API parameter name or an omitted flag in the hand-authored docs. Must verify. |
| `--include-analytics` flag existence (Rule 3) | MEDIUM | User-stated; `video list` and `webinar list` in reference files do not show this flag. May exist but be omitted from hand-authored docs, or the mechanism may differ. Must verify. |

---

## Open Questions (Resolve Before Writing `guide.md`)

1. **What is the exact flag name for `open_p`?**
   Run `twentythree webinar create --agent` and check whether `open_p` appears as a CLI flag. If it does not, the rule may need to reference the underlying API parameter name and note that the CLI does not expose it. This changes the phrasing of Rule 5 significantly.

2. **Does `--include-analytics` exist on `video list` and/or `webinar list`?**
   Run `twentythree video list --agent` and `twentythree webinar list --agent`. If the flag does not exist on the listing command, Rule 3 may refer to a different flag name, a parameter, or a different mechanism. This changes the example for Rule 3.

3. **Are the admin link URL patterns confirmed?**
   The user provided four URL patterns. These should be verified against a live workspace admin console before hardcoding them in the guide. The risk is low (the guide is markdown, easy to correct), but agents will use these patterns verbatim.

---

*Feature research for: twentythree-skills agent behavioral guide (v1.5)*
*Researched: 2026-04-23*
