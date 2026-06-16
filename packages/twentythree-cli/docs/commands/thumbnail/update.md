`twentythree thumbnail:update`
==============================

Update a thumbnail template

* [`twentythree thumbnail update ID`](#twentythree-thumbnail-update-id)

## `twentythree thumbnail update ID`

Update a thumbnail template

```
USAGE
  $ twentythree thumbnail update ID [--json] [-w <value>] [--name <value>] [--liquid-template <value>] [--object-type
    <value>] [--width <value>] [--height <value>]

ARGUMENTS
  ID  Thumbnail template ID

FLAGS
  --height=<value>           Template height in pixels
  --liquid-template=<value>  New Liquid template content
  --name=<value>             New name for the template
  --object-type=<value>      Object type (photo, live, liveseries)
  --width=<value>            Template width in pixels

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update a thumbnail template

EXAMPLES
  $ twentythree thumbnail update 42 --name "Updated Name"

  $ twentythree thumbnail update 42 --liquid-template "<div>{{ video.title }}</div>"

  $ twentythree thumbnail update 42 --object-type photo --width 1280 --height 720

  $ twentythree thumbnail update 42 --name "Updated Name" --json
```

_See code: [src/commands/thumbnail/update.ts](https://github.com/23/twentythree-cli/blob/v1.6.0/src/commands/thumbnail/update.ts)_
