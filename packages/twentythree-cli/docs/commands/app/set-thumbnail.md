`twentythree app:set-thumbnail`
===============================

Upload and set a custom thumbnail image for an app

* [`twentythree app set-thumbnail FILE`](#twentythree-app-set-thumbnail-file)

## `twentythree app set-thumbnail FILE`

Upload and set a custom thumbnail image for an app

```
USAGE
  $ twentythree app set-thumbnail FILE --app-id <value> [--json] [-w <value>]

ARGUMENTS
  FILE  Path to the thumbnail image file

FLAGS
  --app-id=<value>  (required) App ID to update

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Upload and set a custom thumbnail image for an app

EXAMPLES
  $ twentythree app set-thumbnail ./thumbnail.png --app-id 42

  $ twentythree app set-thumbnail ./thumbnail.jpg --app-id 42 --json
```

_See code: [src/commands/app/set-thumbnail.ts](https://github.com/23/twentythree-cli/blob/v1.6.2/src/commands/app/set-thumbnail.ts)_
