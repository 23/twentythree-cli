`twentythree action:upload`
===========================

Upload a file to an action variable

* [`twentythree action upload ID VARIABLE-NAME FILE`](#twentythree-action-upload-id-variable-name-file)

## `twentythree action upload ID VARIABLE-NAME FILE`

Upload a file to an action variable

```
USAGE
  $ twentythree action upload ID VARIABLE-NAME FILE [--json] [-w <value>]

ARGUMENTS
  ID             Action ID
  VARIABLE-NAME  Variable name for the file upload
  FILE           Path to the file to upload

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Upload a file to an action variable

EXAMPLES
  $ twentythree action upload 12345 image ./banner.png

  $ twentythree action upload 12345 video ./clip.mp4

  $ twentythree action upload 12345 image ./banner.png --json
```

_See code: [src/commands/action/upload.ts](https://github.com/23/twentythree-cli/blob/v0.1.0/src/commands/action/upload.ts)_
