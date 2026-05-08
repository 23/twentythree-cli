`twentythree webinar:create`
============================

Create a new webinar

* [`twentythree webinar create`](#twentythree-webinar-create)

## `twentythree webinar create`

Create a new webinar

```
USAGE
  $ twentythree webinar create --title <value> [--json] [-w <value>] [--description <value>] [--status <value>]
    [--live-date <value>] [--draft] [--publish]

FLAGS
  --description=<value>  Description for the webinar
  --[no-]draft           Set as draft
  --live-date=<value>    Schedule date/time (ISO 8601)
  --[no-]publish         Publish the webinar
  --status=<value>       Webinar status: upcoming, live, or previous
  --title=<value>        (required) Title for the new webinar

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Create a new webinar

EXAMPLES
  $ twentythree webinar create --title "My Webinar"

  $ twentythree webinar create --title "My Webinar" --live-date "2024-12-01T14:00:00Z"

  $ twentythree webinar create --title "My Webinar" --json
```

_See code: [src/commands/webinar/create.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/webinar/create.ts)_
