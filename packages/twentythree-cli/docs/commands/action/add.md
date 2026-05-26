`twentythree action:add`
========================

Create a new CTA action on a video or webinar

* [`twentythree action add`](#twentythree-action-add)

## `twentythree action add`

Create a new CTA action on a video or webinar

```
USAGE
  $ twentythree action add --type <value> --object-id <value> [--json] [-w <value>] [--fields <value>]

FLAGS
  --fields=<value>     Additional fields for the action (key=value pairs)
  --object-id=<value>  (required) Object ID (video or webinar) to attach the action to
  --type=<value>       (required) Action type (use `action types` to list available types)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Create a new CTA action on a video or webinar

EXAMPLES
  $ twentythree action add --type overlay --object-id 12345

  $ twentythree action add --type overlay --object-id 12345 --fields "title=Buy Now"

  $ twentythree action add --type overlay --object-id 12345 --json
```

_See code: [src/commands/action/add.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/action/add.ts)_
