`twentythree webhook`
=====================

List available webhook event types

* [`twentythree webhook events`](#twentythree-webhook-events)
* [`twentythree webhook list`](#twentythree-webhook-list)
* [`twentythree webhook sample EVENT`](#twentythree-webhook-sample-event)
* [`twentythree webhook subscribe`](#twentythree-webhook-subscribe)
* [`twentythree webhook unsubscribe`](#twentythree-webhook-unsubscribe)

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

_See code: [src/commands/webhook/events.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/webhook/events.ts)_

## `twentythree webhook list`

List webhook subscriptions for the active workspace

```
USAGE
  $ twentythree webhook list [--json] [-w <value>]

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List webhook subscriptions for the active workspace

EXAMPLES
  $ twentythree webhook list

  $ twentythree webhook list --json
```

_See code: [src/commands/webhook/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/webhook/list.ts)_

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

_See code: [src/commands/webhook/sample.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/webhook/sample.ts)_

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

_See code: [src/commands/webhook/subscribe.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/webhook/subscribe.ts)_

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

_See code: [src/commands/webhook/unsubscribe.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/webhook/unsubscribe.ts)_
