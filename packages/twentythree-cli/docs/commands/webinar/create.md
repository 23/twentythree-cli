`twentythree webinar:create`
============================

Create a new webinar

* [`twentythree webinar create`](#twentythree-webinar-create)

## `twentythree webinar create`

Create a new webinar

```
USAGE
  $ twentythree webinar create --title <value> [--json] [-w <value>] [--description <value>] [--status <value>]
    [--live-date <value>] [--draft] [--publish] [--webinar-design-id <value>] [--format event|webinar]
    [--registration-mode |all|none] [--private] [--category-id <value>] [--locale <value>] [--publish-recordings]
    [--series-id <value>] [--timezone <value>]

FLAGS
  --category-id=<value>         Assign the webinar to a category by ID (API album_id)
  --description=<value>         Description for the webinar
  --[no-]draft                  Set as draft
  --format=<option>             Webinar format: "webinar" (registration, hub) or "event" (freeform live stream)
                                <options: event|webinar>
  --live-date=<value>           Schedule date/time (ISO 8601)
  --locale=<value>              Webinar language/locale (e.g. en_US, da_DK)
  --[no-]private                Make the webinar private (use --no-private to make it public and appear on the hub)
  --[no-]publish                Publish the webinar
  --[no-]publish-recordings     Publish the webinar recordings
  --registration-mode=<option>  [default: all] Registration mode. Defaults to "all" (registration enabled); pass
                                "none" to disable.
                                <options: |all|none>
  --series-id=<value>           Attach the webinar to a webinar series by ID
  --status=<value>              Webinar status: upcoming, live, or previous
  --timezone=<value>            Timezone for the webinar schedule (e.g. Europe/Copenhagen)
  --title=<value>               (required) Title for the new webinar
  --webinar-design-id=<value>   Assign a webinar design by ID to this webinar

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Create a new webinar. By default the webinar is created as a draft with registration enabled
  (registration-mode=all); pass --no-draft/--publish or --registration-mode none to change this.

EXAMPLES
  $ twentythree webinar create --title "My Webinar"

  $ twentythree webinar create --title "My Webinar" --live-date "2024-12-01T14:00:00Z" --timezone Europe/Copenhagen

  $ twentythree webinar create --title "My Webinar" --format webinar --locale da_DK --category-id 127972488

  $ twentythree webinar create --title "My Webinar" --no-draft --no-private --publish-recordings

  $ twentythree webinar create --title "Episode 3" --series-id 67890 --json
```

_See code: [src/commands/webinar/create.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/webinar/create.ts)_
