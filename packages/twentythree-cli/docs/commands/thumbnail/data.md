`twentythree thumbnail:data`
============================

Get Liquid render data for a thumbnail template and object

* [`twentythree thumbnail data ID`](#twentythree-thumbnail-data-id)

## `twentythree thumbnail data ID`

Get Liquid render data for a thumbnail template and object

```
USAGE
  $ twentythree thumbnail data ID --object-id <value> [--json] [-w <value>]

ARGUMENTS
  ID  Thumbnail template ID

FLAGS
  --object-id=<value>  (required) Object ID to get template data for

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get Liquid render data for a thumbnail template and object

EXAMPLES
  $ twentythree thumbnail data 42 --object-id 12345

  $ twentythree thumbnail data 42 --object-id 12345 --json
```

_See code: [src/commands/thumbnail/data.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/thumbnail/data.ts)_
