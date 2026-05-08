`twentythree video:transcoding-progress`
========================================

Check the transcoding progress for a video

* [`twentythree video transcoding-progress ID`](#twentythree-video-transcoding-progress-id)

## `twentythree video transcoding-progress ID`

Check the transcoding progress for a video

```
USAGE
  $ twentythree video transcoding-progress ID [--json] [-w <value>]

ARGUMENTS
  ID  Video ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Check the transcoding progress for a video

EXAMPLES
  $ twentythree video transcoding-progress 12345

  $ twentythree video transcoding-progress 12345 --json
```

_See code: [src/commands/video/transcoding-progress.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/video/transcoding-progress.ts)_
