# Getting Started

## Prerequisites

- Node.js 22 or later
- Install the CLI globally:

```bash
npm install -g twentythree-cli
```

## Step 1: Add your credentials

The CLI stores your TwentyThree domain and bearer token in the OS keychain. You only need to do this once per workspace.

```bash
twentythree auth credentials
```

The command prompts you for your domain and bearer token:

```
Domain (e.g. company.video23.com): company.video23.com
Bearer token (press Enter to skip for anonymous access): ••••••••
```

After you enter a bearer token, the CLI automatically discovers all workspaces associated with your token and sets the first one as active. If your token has access to multiple workspaces, you will be prompted to select a default.

## Step 2: Select a workspace

If your token has access to multiple workspaces, you can list them and switch between them at any time.

```bash
twentythree workspace list
twentythree workspace use company.video23.com
```

## Step 3: Enable tab completion (optional)

Run this once to set up `<TAB>` completion for all commands and flags:

```bash
twentythree autocomplete
```

The command detects your shell (bash or zsh), builds the completion cache, and shows the eval line to paste into your RC file. After sourcing your RC file or restarting your terminal, try:

```bash
twentythree video <TAB>
```

## Step 4: Run your first command

List the videos in your active workspace.

```bash
twentythree video list
```

Sample output:

```
 ID        Title                        Duration  Status   Published  Updated
 ─────────────────────────────────────────────────────────────────────────────
 12345678  Introduction to TwentyThree  2:34      encoded  yes        2024-03-15
 12345679  Product Demo Q1              5:12      encoded  yes        2024-03-10
 12345680  Webinar Recap                48:00     encoded  no         2024-03-08
3 videos
```

## Next steps

Browse all 244 commands in the [Command Reference](../commands/README.md).

Run `twentythree <topic> --help` for help on any topic. For example:

```bash
twentythree video --help
twentythree auth --help
```

Use `<TAB>` after any command to discover subcommands and flags.
