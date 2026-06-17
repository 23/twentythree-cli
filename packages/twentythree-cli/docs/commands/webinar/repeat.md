`twentythree webinar:repeat`
============================

Duplicate a webinar and schedule the copy at a new date/time

* [`twentythree webinar repeat ID`](#twentythree-webinar-repeat-id)

## `twentythree webinar repeat ID`

Duplicate a webinar and schedule the copy at a new date/time

```
USAGE
  $ twentythree webinar repeat ID --date <value> [--json] [-w <value>] [--webinar-design-id <value>]

ARGUMENTS
  ID  Webinar ID

FLAGS
  --date=<value>               (required) Schedule date/time for the new webinar (ISO 8601)
  --webinar-design-id=<value>  Assign a webinar design by ID to the new webinar

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Duplicate a webinar and schedule the copy at a new date/time

EXAMPLES
  $ twentythree webinar repeat 12345 --date "2024-12-01T14:00:00Z"

  $ twentythree webinar repeat 12345 --date "2024-12-01T14:00:00Z" --json
```

_See code: [src/commands/webinar/repeat.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/repeat.ts)_
