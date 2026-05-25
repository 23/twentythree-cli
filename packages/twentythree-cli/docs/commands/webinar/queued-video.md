`twentythree webinar:queued-video`
==================================

Add a queued video to a webinar

* [`twentythree webinar queued-video add ID`](#twentythree-webinar-queued-video-add-id)
* [`twentythree webinar queued-video remove ID`](#twentythree-webinar-queued-video-remove-id)

## `twentythree webinar queued-video add ID`

Add a queued video to a webinar

```
USAGE
  $ twentythree webinar queued-video add ID [--json] [-w <value>] [--video-id <value>]

ARGUMENTS
  ID  Webinar ID

FLAGS
  --video-id=<value>  Video ID to queue

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Add a queued video to a webinar

EXAMPLES
  $ twentythree webinar queued-video add 12345 --video-id 67890

  $ twentythree webinar queued-video add 12345 --video-id 67890 --json
```

_See code: [src/commands/webinar/queued-video/add.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/webinar/queued-video/add.ts)_

## `twentythree webinar queued-video remove ID`

Remove a queued video from a webinar

```
USAGE
  $ twentythree webinar queued-video remove ID [--json] [-w <value>] [--video-id <value>]

ARGUMENTS
  ID  Webinar ID

FLAGS
  --video-id=<value>  Video ID to remove from queue

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Remove a queued video from a webinar

EXAMPLES
  $ twentythree webinar queued-video remove 12345 --video-id 67890

  $ twentythree webinar queued-video remove 12345 --video-id 67890 --json
```

_See code: [src/commands/webinar/queued-video/remove.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/webinar/queued-video/remove.ts)_
