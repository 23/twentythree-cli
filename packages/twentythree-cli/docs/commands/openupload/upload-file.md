`twentythree openupload:upload-file`
====================================

Upload a file via an open upload token using the chunked upload engine

* [`twentythree openupload upload-file`](#twentythree-openupload-upload-file)

## `twentythree openupload upload-file`

Upload a file via an open upload token using the chunked upload engine

```
USAGE
  $ twentythree openupload upload-file --file-path <value> --token-upload-id <value> --token <value> [--json] [-w <value>]
    [--chunk-size <value>] [--concurrency <value>]

FLAGS
  --chunk-size=<value>       [default: 5242880] Chunk size in bytes (default: 5242880 = 100MB)
  --concurrency=<value>      [default: 5] Number of chunks to upload in parallel (default: 5)
  --file-path=<value>        (required) Path to the file to upload
  --token=<value>            (required) Open upload token
  --token-upload-id=<value>  (required) Open upload token upload ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Upload a file via an open upload token using the chunked upload engine

EXAMPLES
  $ twentythree openupload upload-file --file-path ./video.mp4 --token-upload-id 123 --token abc123

  $ twentythree openupload upload-file --file-path ./video.mp4 --token-upload-id 123 --token abc123 --chunk-size 52428800

  $ twentythree openupload upload-file --file-path ./video.mp4 --token-upload-id 123 --token abc123 --json
```

_See code: [src/commands/openupload/upload-file.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/openupload/upload-file.ts)_
