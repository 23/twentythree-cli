`twentythree webhook:unsubscribe`
=================================

Unsubscribe from a webhook event

* [`twentythree webhook unsubscribe`](#twentythree-webhook-unsubscribe)

## `twentythree webhook unsubscribe`

Unsubscribe from a webhook event

```
USAGE
  $ twentythree webhook unsubscribe [--json] [-w <value>] [--webhook-id <value>] [--target-url <value>]

FLAGS
  --target-url=<value>  Target URL to unsubscribe
  --webhook-id=<value>  Webhook subscription ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Unsubscribe from a webhook event

EXAMPLES
  $ twentythree webhook unsubscribe --webhook-id 12345

  $ twentythree webhook unsubscribe --target-url https://example.com/hook

  $ twentythree webhook unsubscribe --webhook-id 12345 --json
```

_See code: [src/commands/webhook/unsubscribe.ts](https://github.com/23/twentythree-cli/blob/v1.7.0/src/commands/webhook/unsubscribe.ts)_
