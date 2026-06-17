`twentythree webinar:update`
============================

Update details for a webinar

* [`twentythree webinar update ID`](#twentythree-webinar-update-id)

## `twentythree webinar update ID`

Update details for a webinar

```
USAGE
  $ twentythree webinar update ID [--json] [-w <value>] [--title <value>] [--description <value>] [--status <value>]
    [--live-date <value>] [--draft] [--publish] [--seo-policy |index|noindex] [--webinar-design-id <value>]
    [--format event|webinar] [--registration-mode all|none] [--private] [--category-id <value>] [--locale <value>]
    [--publish-recordings] [--ondemand] [--series-id <value>] [--timezone <value>]

ARGUMENTS
  ID  Webinar ID

FLAGS
  --category-id=<value>         Assign the webinar to a category by ID (API album_id)
  --description=<value>         New description for the webinar
  --[no-]draft                  Set as draft
  --format=<option>             Webinar format: "webinar" or "event"
                                <options: event|webinar>
  --live-date=<value>           Schedule date/time (ISO 8601)
  --locale=<value>              Webinar language/locale (e.g. en_US, da_DK)
  --[no-]ondemand               Make the recording available on demand
  --[no-]private                Make the webinar private (use --no-private to make it public)
  --[no-]publish                Publish or unpublish the webinar
  --[no-]publish-recordings     Publish the webinar recordings
  --registration-mode=<option>  Registration mode: "all" (enabled) or "none" (disabled)
                                <options: all|none>
  --seo-policy=<option>         SEO policy for the webinar: index, noindex, or empty string to reset
                                <options: |index|noindex>
  --series-id=<value>           Attach the webinar to a webinar series by ID
  --status=<value>              Webinar status: upcoming, live, or previous
  --timezone=<value>            Timezone for the webinar schedule (e.g. Europe/Copenhagen)
  --title=<value>               New title for the webinar
  --webinar-design-id=<value>   Assign a webinar design by ID to this webinar

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update details for a webinar

EXAMPLES
  $ twentythree webinar update 12345 --title "New Title"

  $ twentythree webinar update 12345 --status upcoming

  $ twentythree webinar update 12345 --ondemand --no-private --locale da_DK

  $ twentythree webinar update 12345
```

_See code: [src/commands/webinar/update.ts](https://github.com/23/twentythree-cli/blob/v1.6.2/src/commands/webinar/update.ts)_
