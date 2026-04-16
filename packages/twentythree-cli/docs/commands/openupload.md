`twentythree openupload`
========================

List open upload tokens in the active workspace

* [`twentythree openupload list`](#twentythree-openupload-list)
* [`twentythree openupload update-file`](#twentythree-openupload-update-file)
* [`twentythree openupload upload-file`](#twentythree-openupload-upload-file)

## `twentythree openupload list`

List open upload tokens in the active workspace

```
USAGE
  $ twentythree openupload list [--json] [-w <value>] [--token-upload-id <value>] [--token <value>] [--app]

FLAGS
  --app                      Filter by app open uploads
  --token=<value>            Filter by open upload token
  --token-upload-id=<value>  Filter by open upload token upload ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List open upload tokens in the active workspace

EXAMPLES
  $ twentythree openupload list

  $ twentythree openupload list --token-upload-id 123

  $ twentythree openupload list --json
```

_See code: [src/commands/openupload/list.ts](https://github.com/23/twentythree-cli/blob/v0.1.0/src/commands/openupload/list.ts)_

## `twentythree openupload update-file`

Update metadata for an open upload entry

```
USAGE
  $ twentythree openupload update-file --token-upload-id <value> --token <value> --upload-key <value> [--json] [-w <value>]
    [--title <value>] [--description <value>] [--tags <value>]

FLAGS
  --description=<value>      New description for the uploaded file
  --tags=<value>             Tags for the uploaded file (space-separated)
  --title=<value>            New title for the uploaded file
  --token=<value>            (required) Open upload token
  --token-upload-id=<value>  (required) Open upload token upload ID
  --upload-key=<value>       (required) Upload key identifying the uploaded file

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update metadata for an open upload entry

EXAMPLES
  $ twentythree openupload update-file --token-upload-id 123 --token abc123 --upload-key key456 --title "My Video"

  $ twentythree openupload update-file --token-upload-id 123 --token abc123 --upload-key key456 --tags "demo tutorial"

  $ twentythree openupload update-file --token-upload-id 123 --token abc123 --upload-key key456 --json
```

_See code: [src/commands/openupload/update-file.ts](https://github.com/23/twentythree-cli/blob/v0.1.0/src/commands/openupload/update-file.ts)_

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

_See code: [src/commands/openupload/upload-file.ts](https://github.com/23/twentythree-cli/blob/v0.1.0/src/commands/openupload/upload-file.ts)_
