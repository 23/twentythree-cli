`twentythree video:frame`
=========================

Extract a frame from a video

* [`twentythree video frame ID`](#twentythree-video-frame-id)

## `twentythree video frame ID`

Extract a frame from a video

```
USAGE
  $ twentythree video frame ID [--json] [-w <value>] [--time <value>]

ARGUMENTS
  ID  Video ID

FLAGS
  --time=<value>  Time offset in seconds to extract the frame from

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Extract a frame from a video

EXAMPLES
  $ twentythree video frame 12345

  $ twentythree video frame 12345 --time 30

  $ twentythree video frame 12345 --time 30 --json
```

_See code: [src/commands/video/frame.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/video/frame.ts)_
