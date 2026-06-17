`twentythree thumbnail:add`
===========================

Create a new thumbnail template

* [`twentythree thumbnail add`](#twentythree-thumbnail-add)

## `twentythree thumbnail add`

Create a new thumbnail template

```
USAGE
  $ twentythree thumbnail add --name <value> --liquid-template <value> [--json] [-w <value>]

FLAGS
  --liquid-template=<value>  (required) Liquid template content for the thumbnail
  --name=<value>             (required) Name for the new thumbnail template

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Create a new thumbnail template

EXAMPLES
  $ twentythree thumbnail add --name "My Template" --liquid-template "<div>{{ video.title }}</div>"

  $ twentythree thumbnail add --name "My Template" --liquid-template "<div>{{ video.title }}</div>" --json
```

_See code: [src/commands/thumbnail/add.ts](https://github.com/23/twentythree-cli/blob/v1.6.2/src/commands/thumbnail/add.ts)_
