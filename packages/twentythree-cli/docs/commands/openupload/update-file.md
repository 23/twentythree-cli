`twentythree openupload:update-file`
====================================

Update metadata for an open upload entry

* [`twentythree openupload update-file`](#twentythree-openupload-update-file)

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

_See code: [src/commands/openupload/update-file.ts](https://github.com/23/twentythree-cli/blob/v1.6.0/src/commands/openupload/update-file.ts)_
