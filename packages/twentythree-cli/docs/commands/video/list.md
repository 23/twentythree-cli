`twentythree video:list`
========================

List videos in the active workspace

* [`twentythree video list`](#twentythree-video-list)

## `twentythree video list`

List videos in the active workspace

```
USAGE
  $ twentythree video list [--json] [-w <value>] [--limit <value>] [--include-unpublished]

FLAGS
  --[no-]include-unpublished  Include unpublished videos in the results
  --limit=<value>             Maximum number of videos to return (default: all)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List videos in the active workspace

EXAMPLES
  $ twentythree video list

  $ twentythree video list --json
```

_See code: [src/commands/video/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/video/list.ts)_
