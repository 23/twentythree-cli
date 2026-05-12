`twentythree webhook:events`
============================

List available webhook event types

* [`twentythree webhook events`](#twentythree-webhook-events)

## `twentythree webhook events`

List available webhook event types

```
USAGE
  $ twentythree webhook events [--json] [-w <value>] [--test-authentication]

FLAGS
  --test-authentication  Include test authentication events

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List available webhook event types

EXAMPLES
  $ twentythree webhook events

  $ twentythree webhook events --test-authentication

  $ twentythree webhook events --json
```

_See code: [src/commands/webhook/events.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/webhook/events.ts)_
