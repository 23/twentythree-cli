# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.8.0] - 2026-10-03

### Added

- `email-subscription list|add|remove` commands for the new `/email-subscription/*` endpoints (digest emails for newly published videos)
- `video upload-url` command for `POST /photo/upload-url` — create a video from a URL instead of uploading a local file
- `--yes` / `-y` flag on every destructive command to skip the confirmation prompt; without a TTY and without `--yes`/`--json` the command now exits 2 with a message naming the flag instead of hanging. Five destructive commands that never prompted (`comment reaction remove`, `audience unregister`, `webinar queued-video remove`, `webinar speaker cancel-guest-request`, `webinar speaker remove-avatar`) now confirm like the rest
- Permission level of the login is recorded from `/user/tokens` (at login, or at the next token refresh for existing configs) and shown by `auth credentials`, `auth status`, `workspace list` and `doctor`; commands whose scope exceeds a read-only login fail fast with a clear message instead of a 403 after the prompt
- Skills: `reference/email-subscription.md`, plus guide rules for `--yes`, permission levels and empty tokens

### Changed

- API spec and generated types synced with the live `swagger.json` (email subscriptions, `photo/upload-url`, `create_placeholders_p` on upload tokens, `exclude_implicit_placeholders_p` on `photo/list`, `live/speaker/connection-types` now `read`)

### Fixed

- `auth credentials --domain <d> --token ""` and an empty `TWENTYTHREE_TOKEN` no longer silently configure anonymous mode; both are errors (TWE-576)
- `video delete`, `video upload` and `category update` rendered API error objects as `[object Object]`; they now show the API message

## [1.1.1] - 2026-04-17

### Added

- Tab completion for bash and zsh via `@oclif/plugin-autocomplete`
- Guided `twentythree autocomplete` setup command with @clack/prompts: detects shell, builds completion cache, and displays eval line to paste into RC file

## [1.1.0] - 2026-04-16

### Added

- Endpoint coverage audit script verifying all 235 OpenAPI endpoints are covered
- 18 analytics sub-series commands (video, live, and usage analytics -- timeseries and totals)
- Command reference docs generated with `oclif readme --multi` (244 commands across 24 topics)
- Getting Started guide covering auth setup, workspace selection, and first command
- API Spec Upgrade guide documenting the `pnpm update-api-spec` workflow
- Root README with quickstart, command overview table, and terminology mapping
- npm package README with install instructions and link to full docs
- This CHANGELOG

### Changed

- Package.json updated with `repository`, `bugs`, `homepage`, `keywords`, `author` fields
- `files` array updated to include `/docs` and `/README.md` in published tarball
- `prepack` script added to run full build before pack/publish

## [1.0.0] - 2026-04-16

### Added

- 219 hand-authored commands covering all 235 TwentyThree API endpoints across 22 resource groups
- Multi-workspace authentication with OS keychain storage via `@napi-rs/keyring`
- Automatic bearer token refresh with file-lock concurrency protection
- Interactive workspace discovery and selection via `/api/2/user/tokens`
- Chunked upload engine (100 MB chunks, 5-way parallelism, resume on failure) for videos, webinar attachments, actions, and open uploads
- Domain-only mode for anonymous endpoint access
- `--agent` flag on every command outputting machine-readable metadata for AI agent consumption
- `doctor` command for credential, connectivity, and token validation checks
- Terminology mapping (`photo` to `video`, `album` to `category`, `live` to `webinar`) via `term-map.ts`
- URL normalization resolving relative API response URLs to full workspace URLs
- OpenAPI spec stored locally with `pnpm update-api-spec` regeneration workflow
