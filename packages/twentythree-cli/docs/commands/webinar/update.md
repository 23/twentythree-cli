`twentythree webinar:update`
============================

Update details for a webinar

* [`twentythree webinar update ID`](#twentythree-webinar-update-id)

## `twentythree webinar update ID`

Update details for a webinar

```
USAGE
  $ twentythree webinar update ID [--json] [-w <value>] [--title <value>] [--description <value>] [--status <value>]
    [--live-date <value>] [--draft] [--publish]

ARGUMENTS
  ID  Webinar ID

FLAGS
  --description=<value>  New description for the webinar
  --[no-]draft           Set as draft
  --live-date=<value>    Schedule date/time (ISO 8601)
  --[no-]publish         Publish or unpublish the webinar
  --status=<value>       Webinar status: upcoming, live, or previous
  --title=<value>        New title for the webinar

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update details for a webinar

EXAMPLES
  $ twentythree webinar update 12345 --title "New Title"

  $ twentythree webinar update 12345 --status upcoming

  $ twentythree webinar update 12345
```

_See code: [src/commands/webinar/update.ts](https://github.com/23/twentythree-cli/blob/v0.1.0/src/commands/webinar/update.ts)_
