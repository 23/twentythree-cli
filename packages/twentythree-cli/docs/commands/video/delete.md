`twentythree video:delete`
==========================

Delete a video from the active workspace

* [`twentythree video delete ID`](#twentythree-video-delete-id)

## `twentythree video delete ID`

Delete a video from the active workspace

```
USAGE
  $ twentythree video delete ID [--json] [-w <value>]

ARGUMENTS
  ID  Video ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete a video from the active workspace

EXAMPLES
  $ twentythree video delete 12345

  $ twentythree video delete 12345 --json
```

_See code: [src/commands/video/delete.ts](https://github.com/23/twentythree-cli/blob/v0.1.0/src/commands/video/delete.ts)_
