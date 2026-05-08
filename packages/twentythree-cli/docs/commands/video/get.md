`twentythree video:get`
=======================

Get details of a specific video

* [`twentythree video get ID`](#twentythree-video-get-id)

## `twentythree video get ID`

Get details of a specific video

```
USAGE
  $ twentythree video get ID [--json] [-w <value>]

ARGUMENTS
  ID  Video ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get details of a specific video

EXAMPLES
  $ twentythree video get 12345

  $ twentythree video get 12345 --json
```

_See code: [src/commands/video/get.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/video/get.ts)_
