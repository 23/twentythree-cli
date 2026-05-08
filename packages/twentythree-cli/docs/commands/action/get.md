`twentythree action:get`
========================

Get details of a CTA action

* [`twentythree action get [ID]`](#twentythree-action-get-id)

## `twentythree action get [ID]`

Get details of a CTA action

```
USAGE
  $ twentythree action get [ID] [--json] [-w <value>] [--object-id <value>] [--video-id <value>] [--webinar-id
    <value>] [--token <value>] [--player-id <value>] [--exclude-internal] [--exclude-pending] [--exclude-items]

ARGUMENTS
  [ID]  Action ID (optional)

FLAGS
  --exclude-internal    Exclude internal actions
  --exclude-items       Exclude action items
  --exclude-pending     Exclude pending actions
  --object-id=<value>   Object ID context
  --player-id=<value>   Player ID context
  --token=<value>       Object token for authentication
  --video-id=<value>    Video ID context (maps to photo_id)
  --webinar-id=<value>  Webinar ID context (maps to live_id)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get details of a CTA action

EXAMPLES
  $ twentythree action get 12345

  $ twentythree action get --video-id 6789

  $ twentythree action get --webinar-id 1234 --json

  $ twentythree action get 12345 --json
```

_See code: [src/commands/action/get.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/action/get.ts)_
