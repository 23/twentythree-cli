`twentythree webhook:subscribe`
===============================

Subscribe to a webhook event

* [`twentythree webhook subscribe`](#twentythree-webhook-subscribe)

## `twentythree webhook subscribe`

Subscribe to a webhook event

```
USAGE
  $ twentythree webhook subscribe --target-url <value> --event <value> [--json] [-w <value>]

FLAGS
  --event=<value>       (required) Event type to subscribe to
  --target-url=<value>  (required) URL to receive webhook POST requests

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Subscribe to a webhook event

EXAMPLES
  $ twentythree webhook subscribe --target-url https://example.com/hook --event video.uploaded

  $ twentythree webhook subscribe --target-url https://example.com/hook --event video.uploaded --json
```

_See code: [src/commands/webhook/subscribe.ts](https://github.com/23/twentythree-cli/blob/v1.7.0/src/commands/webhook/subscribe.ts)_
