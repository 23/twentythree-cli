`twentythree auth`
==================

Configure domain and bearer token for a TwentyThree workspace

* [`twentythree auth credentials`](#twentythree-auth-credentials)
* [`twentythree auth status`](#twentythree-auth-status)
* [`twentythree auth switch`](#twentythree-auth-switch)

## `twentythree auth credentials`

Configure domain and bearer token for a TwentyThree workspace

```
USAGE
  $ twentythree auth credentials [--json] [--domain <value>] [--token <value>] [--workspace <value>]

FLAGS
  --domain=<value>     Workspace domain (e.g. company.video23.com). Passing this runs the command
                       non-interactively (no prompts).
  --token=<value>      Bearer/login token. Falls back to the TWENTYTHREE_TOKEN env var. Omit for
                       anonymous (domain-only) access.
  --workspace=<value>  Which discovered workspace to set active (domain or display name) when the
                       token unlocks several. Non-interactive mode only.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Configure domain and bearer token for a TwentyThree workspace

  Run with no flags for an interactive prompt. Pass --domain to run non-interactively — useful for
  AI agents, scripts, and CI. The bearer token can be supplied via --token or the TWENTYTHREE_TOKEN
  environment variable (preferred, so the token stays out of shell history and process listings).

EXAMPLES
  $ twentythree auth credentials

  $ twentythree auth credentials --domain company.video23.com --token <token>

  $ twentythree auth credentials --domain company.video23.com --token <token> --workspace "Marketing"

  $ TWENTYTHREE_TOKEN=<token> twentythree auth credentials --domain company.video23.com --json
```

_See code: [src/commands/auth/credentials.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/auth/credentials.ts)_

## `twentythree auth status`

Show authentication status and active workspace

```
USAGE
  $ twentythree auth status [--json] [-w <value>]

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Show authentication status and active workspace

EXAMPLES
  $ twentythree auth status
```

_See code: [src/commands/auth/status.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/auth/status.ts)_

## `twentythree auth switch`

Switch the active workspace

```
USAGE
  $ twentythree auth switch

DESCRIPTION
  Switch the active workspace

EXAMPLES
  $ twentythree auth switch
```

_See code: [src/commands/auth/switch.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/auth/switch.ts)_
