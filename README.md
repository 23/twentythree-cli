# TwentyThree CLI

[![npm version](https://img.shields.io/npm/v/twentythree-cli.svg)](https://www.npmjs.com/package/twentythree-cli) [![license](https://img.shields.io/npm/l/twentythree-cli.svg)](https://github.com/23/twentythree-cli/blob/master/LICENSE)

Terminal access to every TwentyThree API endpoint. Authenticate, select a workspace, and start calling any of the 244 commands from your terminal in under a minute.

## Quickstart

```sh
npm install -g twentythree-cli
twentythree auth credentials
twentythree video list
```

See the [Getting Started guide](packages/twentythree-cli/docs/guides/getting-started.md) for full setup instructions.

## Install from your AI assistant

Have an AI coding agent? Skip the terminal. Paste this into Claude Code, OpenAI Codex, Cursor, Windsurf, Cline, Gemini CLI, or GitHub Copilot, and it installs the CLI plus its skills for you:

```text
Install the TwentyThree CLI and its AI skills on this machine, then verify:
1. Run: npm install -g twentythree-cli
2. Run: npx -y twentythree-skills
3. Run: twentythree auth credentials  (pause so I can enter my workspace domain + token)
4. Verify with: twentythree doctor
If Node 22+ / npm isn't installed, stop and tell me how to install it first.
```

Once installed, ask in plain language — *"upload ./keynote.mp4 and publish it"* — and the agent runs the right commands. See the [AI agents guide](packages/twentythree-cli/docs/guides/ai-agents.md) for per-runtime quick starts (Claude Code, Codex, Copilot, Cursor, Windsurf, Cline, Gemini CLI).

## Tab Completion

Enable tab completion for bash or zsh -- run once, then use `<TAB>` to discover commands and flags.

```sh
twentythree autocomplete
```

Follow the on-screen instructions to add the eval line to your shell RC file (`~/.zshrc` or `~/.bashrc`), then restart your terminal.

## Commands

TwentyThree CLI provides 247 commands across 26 topics.

| Topic | Description | Reference |
|-------|-------------|-----------|
| `action` | Create a new CTA action on a video or webinar | [docs](packages/twentythree-cli/docs/commands/action.md) |
| `analytics` | Get conversion analytics data | [docs](packages/twentythree-cli/docs/commands/analytics.md) |
| `app` | Create a new app integration | [docs](packages/twentythree-cli/docs/commands/app.md) |
| `audience` | List audience companies | [docs](packages/twentythree-cli/docs/commands/audience.md) |
| `auth` | Configure domain and bearer token for a TwentyThree workspace | [docs](packages/twentythree-cli/docs/commands/auth.md) |
| `category` | Manage categories -- list, create, update, and delete | [docs](packages/twentythree-cli/docs/commands/category.md) |
| `collector` | Block a collector from a video or webinar | [docs](packages/twentythree-cli/docs/commands/collector.md) |
| `comment` | Add a comment to an object | [docs](packages/twentythree-cli/docs/commands/comment.md) |
| `doctor` | Check CLI credentials, connectivity, and token validity | [docs](packages/twentythree-cli/docs/commands/doctor.md) |
| `openupload` | List open upload tokens in the active workspace | [docs](packages/twentythree-cli/docs/commands/openupload.md) |
| `player` | Delete a player from the active workspace | [docs](packages/twentythree-cli/docs/commands/player.md) |
| `poll` | Create a new poll for a webinar | [docs](packages/twentythree-cli/docs/commands/poll.md) |
| `presentation` | List available presentation page link locations | [docs](packages/twentythree-cli/docs/commands/presentation.md) |
| `protection` | Apply protection to content | [docs](packages/twentythree-cli/docs/commands/protection.md) |
| `seo` | Get and update SEO metadata for videos, webinars, and webinar series | [docs](packages/twentythree-cli/docs/commands/seo.md) |
| `session` | Get a session access token | [docs](packages/twentythree-cli/docs/commands/session.md) |
| `setting` | Update workspace settings (key=value pairs) | [docs](packages/twentythree-cli/docs/commands/setting.md) |
| `site` | Get site settings for the active workspace | [docs](packages/twentythree-cli/docs/commands/site.md) |
| `spot` | Get details of a specific spot | [docs](packages/twentythree-cli/docs/commands/spot.md) |
| `tag` | List tags in the active workspace | [docs](packages/twentythree-cli/docs/commands/tag.md) |
| `thumbnail` | Manage thumbnail templates -- list, add, update, delete, duplicate, data, and manage files | [docs](packages/twentythree-cli/docs/commands/thumbnail.md) |
| `user` | Create a new user | [docs](packages/twentythree-cli/docs/commands/user.md) |
| `video` | Manage videos -- upload, list, update, delete, and more | [docs](packages/twentythree-cli/docs/commands/video.md) |
| `webhook` | List available webhook event types | [docs](packages/twentythree-cli/docs/commands/webhook.md) |
| `webinar` | Manage webinars -- create, list, update, delete, and more | [docs](packages/twentythree-cli/docs/commands/webinar.md) |
| `workspace` | List all configured workspaces | [docs](packages/twentythree-cli/docs/commands/workspace.md) |

## Terminology

The TwentyThree API and CLI use different names for some objects:

| API Term | CLI Term |
|----------|----------|
| `photo` | `video` |
| `album` | `category` |
| `live` | `webinar` |

## Documentation

- [Command Reference](packages/twentythree-cli/docs/commands/README.md)
- [Getting Started](packages/twentythree-cli/docs/guides/getting-started.md)
- [Using TwentyThree with AI agents](packages/twentythree-cli/docs/guides/ai-agents.md)
- [API Spec Upgrade Guide](packages/twentythree-cli/docs/guides/api-spec-upgrade.md)

## License

MIT
