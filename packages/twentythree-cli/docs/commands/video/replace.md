`twentythree video:replace`
===========================

Replace the video file for an existing video

* [`twentythree video replace ID FILE`](#twentythree-video-replace-id-file)

## `twentythree video replace ID FILE`

Replace the video file for an existing video

```
USAGE
  $ twentythree video replace ID FILE [--json] [-w <value>] [--chunk-size <value>] [--concurrency <value>]

ARGUMENTS
  ID    Video ID to replace
  FILE  Path to the replacement video file

FLAGS
  --chunk-size=<value>   [default: 5242880] Chunk size in bytes (default: 5242880 = 100MB)
  --concurrency=<value>  [default: 5] Number of chunks to upload in parallel (default: 5)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Replace the video file for an existing video

EXAMPLES
  $ twentythree video replace 12345 ./new-video.mp4

  $ twentythree video replace 12345 ./new-video.mp4 --chunk-size 52428800 --concurrency 3
```

_See code: [src/commands/video/replace.ts](https://github.com/23/twentythree-cli/blob/v1.6.1/src/commands/video/replace.ts)_
