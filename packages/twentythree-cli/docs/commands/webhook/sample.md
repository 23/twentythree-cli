`twentythree webhook:sample`
============================

Get a sample payload for a webhook event type

* [`twentythree webhook sample EVENT`](#twentythree-webhook-sample-event)

## `twentythree webhook sample EVENT`

Get a sample payload for a webhook event type

```
USAGE
  $ twentythree webhook sample EVENT [--json] [-w <value>]

ARGUMENTS
  EVENT  Event type to get sample for

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get a sample payload for a webhook event type

EXAMPLES
  $ twentythree webhook sample video.uploaded

  $ twentythree webhook sample video.uploaded --json
```

_See code: [src/commands/webhook/sample.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/webhook/sample.ts)_
