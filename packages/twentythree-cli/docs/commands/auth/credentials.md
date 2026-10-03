`twentythree auth:credentials`
==============================

Configure domain and bearer token for a TwentyThree workspace

* [`twentythree auth credentials`](#twentythree-auth-credentials)

## `twentythree auth credentials`

Configure domain and bearer token for a TwentyThree workspace

```
USAGE
  $ twentythree auth credentials [--json] [--domain <value>] [--token <value>] [--workspace <value>]

FLAGS
  --domain=<value>     Workspace domain (e.g. company.video23.com). Passing this runs the command non-interactively (no
                       prompts).
  --token=<value>      Bearer/login token. Falls back to the TWENTYTHREE_TOKEN env var. Omit (and leave the env var
                       unset) for anonymous (domain-only) access; an empty value is an error.
  --workspace=<value>  Which discovered workspace to set active (domain or display name) when the token unlocks several.
                       Non-interactive mode only.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Configure domain and bearer token for a TwentyThree workspace

EXAMPLES
  $ twentythree auth credentials

  $ twentythree auth credentials --domain company.video23.com --token <token>

  $ twentythree auth credentials --domain company.video23.com --token <token> --workspace "Marketing"

  TWENTYTHREE_TOKEN=<token> twentythree auth credentials --domain company.video23.com --json
```

_See code: [src/commands/auth/credentials.ts](https://github.com/23/twentythree-cli/blob/v1.7.0/src/commands/auth/credentials.ts)_
