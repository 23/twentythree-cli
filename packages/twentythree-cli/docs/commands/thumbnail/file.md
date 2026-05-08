`twentythree thumbnail:file`
============================

Delete a file from a thumbnail template

* [`twentythree thumbnail file delete`](#twentythree-thumbnail-file-delete)
* [`twentythree thumbnail file list ID`](#twentythree-thumbnail-file-list-id)
* [`twentythree thumbnail file upload FILE`](#twentythree-thumbnail-file-upload-file)

## `twentythree thumbnail file delete`

Delete a file from a thumbnail template

```
USAGE
  $ twentythree thumbnail file delete --template-id <value> --filename <value> [--json] [-w <value>]

FLAGS
  --filename=<value>     (required) Filename to delete
  --template-id=<value>  (required) Thumbnail template ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete a file from a thumbnail template

EXAMPLES
  $ twentythree thumbnail file delete --template-id 42 --filename logo.png

  $ twentythree thumbnail file delete --template-id 42 --filename logo.png --json
```

_See code: [src/commands/thumbnail/file/delete.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/thumbnail/file/delete.ts)_

## `twentythree thumbnail file list ID`

List files associated with a thumbnail template

```
USAGE
  $ twentythree thumbnail file list ID [--json] [-w <value>]

ARGUMENTS
  ID  Thumbnail template ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List files associated with a thumbnail template

EXAMPLES
  $ twentythree thumbnail file list 42

  $ twentythree thumbnail file list 42 --json
```

_See code: [src/commands/thumbnail/file/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/thumbnail/file/list.ts)_

## `twentythree thumbnail file upload FILE`

Upload an image file to a thumbnail template

```
USAGE
  $ twentythree thumbnail file upload FILE --template-id <value> [--json] [-w <value>]

ARGUMENTS
  FILE  Path to the image file to upload

FLAGS
  --template-id=<value>  (required) Thumbnail template ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Upload an image file to a thumbnail template

EXAMPLES
  $ twentythree thumbnail file upload ./logo.png --template-id 42

  $ twentythree thumbnail file upload ./banner.jpg --template-id 42 --json
```

_See code: [src/commands/thumbnail/file/upload.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/thumbnail/file/upload.ts)_
