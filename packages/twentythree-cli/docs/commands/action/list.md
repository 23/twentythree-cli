`twentythree action:list`
=========================

List CTA actions for a video, webinar, or object

* [`twentythree action list`](#twentythree-action-list)

## `twentythree action list`

List CTA actions for a video, webinar, or object

```
USAGE
  $ twentythree action list [--json] [-w <value>] [--object-id <value>] [--video-id <value>] [--webinar-id
    <value>] [--player-id <value>] [--exclude-internal] [--exclude-pending] [--exclude-items]

FLAGS
  --exclude-internal    Exclude internal actions
  --exclude-items       Exclude action items
  --exclude-pending     Exclude pending actions
  --object-id=<value>   Object ID to filter actions by
  --player-id=<value>   Player ID to filter actions by
  --video-id=<value>    Video ID to filter actions by (maps to photo_id)
  --webinar-id=<value>  Webinar ID to filter actions by (maps to live_id)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List CTA actions for a video, webinar, or object

EXAMPLES
  $ twentythree action list --video-id 12345

  $ twentythree action list --webinar-id 6789

  $ twentythree action list --object-id 12345

  $ twentythree action list --video-id 12345 --json
```

_See code: [src/commands/action/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/action/list.ts)_
