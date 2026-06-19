`twentythree webinar`
=====================

Manage webinars — create, list, update, delete, and more

* [`twentythree webinar`](#twentythree-webinar)
* [`twentythree webinar attachment delete ID`](#twentythree-webinar-attachment-delete-id)
* [`twentythree webinar attachment list ID`](#twentythree-webinar-attachment-list-id)
* [`twentythree webinar attachment set-hidden ID`](#twentythree-webinar-attachment-set-hidden-id)
* [`twentythree webinar attachment upload ID FILE`](#twentythree-webinar-attachment-upload-id-file)
* [`twentythree webinar clips ID`](#twentythree-webinar-clips-id)
* [`twentythree webinar create`](#twentythree-webinar-create)
* [`twentythree webinar delete ID`](#twentythree-webinar-delete-id)
* [`twentythree webinar highlights ID`](#twentythree-webinar-highlights-id)
* [`twentythree webinar list`](#twentythree-webinar-list)
* [`twentythree webinar list-formats`](#twentythree-webinar-list-formats)
* [`twentythree webinar log ID`](#twentythree-webinar-log-id)
* [`twentythree webinar mail add [ID]`](#twentythree-webinar-mail-add-id)
* [`twentythree webinar mail list [ID]`](#twentythree-webinar-mail-list-id)
* [`twentythree webinar mail preview ID`](#twentythree-webinar-mail-preview-id)
* [`twentythree webinar mail remove ID`](#twentythree-webinar-mail-remove-id)
* [`twentythree webinar mail send ID`](#twentythree-webinar-mail-send-id)
* [`twentythree webinar mail test ID`](#twentythree-webinar-mail-test-id)
* [`twentythree webinar mail update ID`](#twentythree-webinar-mail-update-id)
* [`twentythree webinar metrics ID`](#twentythree-webinar-metrics-id)
* [`twentythree webinar queued-video add ID`](#twentythree-webinar-queued-video-add-id)
* [`twentythree webinar queued-video remove ID`](#twentythree-webinar-queued-video-remove-id)
* [`twentythree webinar recording split ID`](#twentythree-webinar-recording-split-id)
* [`twentythree webinar recording start ID`](#twentythree-webinar-recording-start-id)
* [`twentythree webinar recording status ID`](#twentythree-webinar-recording-status-id)
* [`twentythree webinar recording stop ID`](#twentythree-webinar-recording-stop-id)
* [`twentythree webinar repeat ID`](#twentythree-webinar-repeat-id)
* [`twentythree webinar room connect ID`](#twentythree-webinar-room-connect-id)
* [`twentythree webinar room info ID`](#twentythree-webinar-room-info-id)
* [`twentythree webinar room send-recording ID`](#twentythree-webinar-room-send-recording-id)
* [`twentythree webinar room themes`](#twentythree-webinar-room-themes)
* [`twentythree webinar section add ID`](#twentythree-webinar-section-add-id)
* [`twentythree webinar section list ID`](#twentythree-webinar-section-list-id)
* [`twentythree webinar section remove WEBINARID ID`](#twentythree-webinar-section-remove-webinarid-id)
* [`twentythree webinar section update WEBINARID ID`](#twentythree-webinar-section-update-webinarid-id)
* [`twentythree webinar series apply-recurrence ID`](#twentythree-webinar-series-apply-recurrence-id)
* [`twentythree webinar series cancel ID`](#twentythree-webinar-series-cancel-id)
* [`twentythree webinar series create`](#twentythree-webinar-series-create)
* [`twentythree webinar series delete ID`](#twentythree-webinar-series-delete-id)
* [`twentythree webinar series list`](#twentythree-webinar-series-list)
* [`twentythree webinar series mapped-objects ID`](#twentythree-webinar-series-mapped-objects-id)
* [`twentythree webinar series metrics ID`](#twentythree-webinar-series-metrics-id)
* [`twentythree webinar series recurrences ID`](#twentythree-webinar-series-recurrences-id)
* [`twentythree webinar series set-ondemand ID`](#twentythree-webinar-series-set-ondemand-id)
* [`twentythree webinar series skip-recurrence ID`](#twentythree-webinar-series-skip-recurrence-id)
* [`twentythree webinar series update ID`](#twentythree-webinar-series-update-id)
* [`twentythree webinar series upload-thumbnail ID FILE`](#twentythree-webinar-series-upload-thumbnail-id-file)
* [`twentythree webinar speaker add ID`](#twentythree-webinar-speaker-add-id)
* [`twentythree webinar speaker add-from-speaker ID`](#twentythree-webinar-speaker-add-from-speaker-id)
* [`twentythree webinar speaker add-from-user ID`](#twentythree-webinar-speaker-add-from-user-id)
* [`twentythree webinar speaker cancel-guest-request WEBINARID ID`](#twentythree-webinar-speaker-cancel-guest-request-webinarid-id)
* [`twentythree webinar speaker connection-types ID`](#twentythree-webinar-speaker-connection-types-id)
* [`twentythree webinar speaker library`](#twentythree-webinar-speaker-library)
* [`twentythree webinar speaker list ID`](#twentythree-webinar-speaker-list-id)
* [`twentythree webinar speaker remove WEBINARID ID`](#twentythree-webinar-speaker-remove-webinarid-id)
* [`twentythree webinar speaker remove-avatar WEBINARID ID`](#twentythree-webinar-speaker-remove-avatar-webinarid-id)
* [`twentythree webinar speaker request-guest WEBINARID ID`](#twentythree-webinar-speaker-request-guest-webinarid-id)
* [`twentythree webinar speaker send-invitation WEBINARID ID`](#twentythree-webinar-speaker-send-invitation-webinarid-id)
* [`twentythree webinar speaker set-avatar WEBINARID ID FILE`](#twentythree-webinar-speaker-set-avatar-webinarid-id-file)
* [`twentythree webinar speaker set-order ID`](#twentythree-webinar-speaker-set-order-id)
* [`twentythree webinar speaker update WEBINARID ID`](#twentythree-webinar-speaker-update-webinarid-id)
* [`twentythree webinar transcription connect ID`](#twentythree-webinar-transcription-connect-id)
* [`twentythree webinar transcription list ID`](#twentythree-webinar-transcription-list-id)
* [`twentythree webinar transcription locales ID`](#twentythree-webinar-transcription-locales-id)
* [`twentythree webinar transcription transcriptionlist`](#twentythree-webinar-transcription-transcriptionlist)
* [`twentythree webinar update ID`](#twentythree-webinar-update-id)
* [`twentythree webinar upload-image ID FILE`](#twentythree-webinar-upload-image-id-file)

## `twentythree webinar`

Manage webinars — create, list, update, delete, and more

```
USAGE
  $ twentythree webinar

DESCRIPTION
  Manage webinars — create, list, update, delete, and more
```

_See code: [src/commands/webinar/index.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/index.ts)_

## `twentythree webinar attachment delete ID`

Delete an attachment from a webinar

```
USAGE
  $ twentythree webinar attachment delete ID [--json] [-w <value>] [--filename <value>]

ARGUMENTS
  ID  Webinar ID

FLAGS
  --filename=<value>  Filename of the attachment to delete

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete an attachment from a webinar

EXAMPLES
  $ twentythree webinar attachment delete 12345 --filename slides.pdf

  $ twentythree webinar attachment delete 12345 --filename handout.pdf --json
```

_See code: [src/commands/webinar/attachment/delete.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/attachment/delete.ts)_

## `twentythree webinar attachment list ID`

List attachments for a webinar

```
USAGE
  $ twentythree webinar attachment list ID [--json] [-w <value>] [--token <value>] [--include-hidden]

ARGUMENTS
  ID  Webinar ID

FLAGS
  --[no-]include-hidden  Include hidden attachments
  --token=<value>        Webinar token (auto-looked up if omitted)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List attachments for a webinar

EXAMPLES
  $ twentythree webinar attachment list 12345

  $ twentythree webinar attachment list 12345 --json

  $ twentythree webinar attachment list 12345 --include-hidden
```

_See code: [src/commands/webinar/attachment/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/attachment/list.ts)_

## `twentythree webinar attachment set-hidden ID`

Show or hide a webinar attachment

```
USAGE
  $ twentythree webinar attachment set-hidden ID --hidden [--json] [-w <value>] [--filename <value>]

ARGUMENTS
  ID  Webinar ID

FLAGS
  --filename=<value>  Filename of the attachment
  --[no-]hidden       (required) Set hidden (--hidden) or visible (--no-hidden)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Show or hide a webinar attachment

EXAMPLES
  $ twentythree webinar attachment set-hidden 12345 --filename slides.pdf --hidden

  $ twentythree webinar attachment set-hidden 12345 --filename slides.pdf --no-hidden

  $ twentythree webinar attachment set-hidden 12345 --filename slides.pdf --hidden --json
```

_See code: [src/commands/webinar/attachment/set-hidden.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/attachment/set-hidden.ts)_

## `twentythree webinar attachment upload ID FILE`

Upload an attachment to a webinar

```
USAGE
  $ twentythree webinar attachment upload ID FILE [--json] [-w <value>] [--chunk-size <value>] [--concurrency <value>]
    [--hidden]

ARGUMENTS
  ID    Webinar ID
  FILE  Path to file to upload

FLAGS
  --chunk-size=<value>   [default: 5242880] Chunk size in bytes (default: 5242880)
  --concurrency=<value>  [default: 5] Number of chunks to upload in parallel (default: 5)
  --[no-]hidden          Upload attachment as hidden

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Upload an attachment to a webinar

EXAMPLES
  $ twentythree webinar attachment upload 12345 ./slides.pdf

  $ twentythree webinar attachment upload 12345 ./handout.pdf --hidden
```

_See code: [src/commands/webinar/attachment/upload.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/attachment/upload.ts)_

## `twentythree webinar clips ID`

List recording clips from a webinar

```
USAGE
  $ twentythree webinar clips ID [--json] [-w <value>]

ARGUMENTS
  ID  Webinar ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List recording clips from a webinar

EXAMPLES
  $ twentythree webinar clips 12345

  $ twentythree webinar clips 12345 --json
```

_See code: [src/commands/webinar/clips.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/clips.ts)_

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

_See code: [src/commands/webinar/create.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/create.ts)_

## `twentythree webinar delete ID`

Delete a webinar from the active workspace

```
USAGE
  $ twentythree webinar delete ID [--json] [-w <value>]

ARGUMENTS
  ID  Webinar ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete a webinar from the active workspace

EXAMPLES
  $ twentythree webinar delete 12345

  $ twentythree webinar delete 12345 --json
```

_See code: [src/commands/webinar/delete.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/delete.ts)_

## `twentythree webinar highlights ID`

List highlights from a webinar

```
USAGE
  $ twentythree webinar highlights ID [--json] [-w <value>] [--video-id <value>]

ARGUMENTS
  ID  Webinar ID

FLAGS
  --video-id=<value>  Scope to specific recording by video ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List highlights from a webinar

EXAMPLES
  $ twentythree webinar highlights 12345

  $ twentythree webinar highlights 12345 --video-id 67890

  $ twentythree webinar highlights 12345 --json
```

_See code: [src/commands/webinar/highlights.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/highlights.ts)_

## `twentythree webinar list`

List webinars in the active workspace

```
USAGE
  $ twentythree webinar list [--json] [-w <value>] [--limit <value>] [--all] [--include-private] [--status
    <value>] [--search <value>]

FLAGS
  --all                   Fetch all webinars across all pages (overrides --limit)
  --[no-]include-private  Include private webinars in the results
  --limit=<value>         [default: 20] Maximum number of webinars to return (default: 20)
  --search=<value>        Search webinars by keyword
  --status=<value>        Filter by status: upcoming, live, or previous

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List webinars in the active workspace

EXAMPLES
  $ twentythree webinar list

  $ twentythree webinar list --limit 50

  $ twentythree webinar list --all

  $ twentythree webinar list --status upcoming --json
```

_See code: [src/commands/webinar/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/list.ts)_

## `twentythree webinar list-formats`

List available webinar formats

```
USAGE
  $ twentythree webinar list-formats [--json] [-w <value>]

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List available webinar formats

EXAMPLES
  $ twentythree webinar list-formats

  $ twentythree webinar list-formats --json
```

_See code: [src/commands/webinar/list-formats.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/list-formats.ts)_

## `twentythree webinar log ID`

Retrieve the event log for a webinar

```
USAGE
  $ twentythree webinar log ID [--json] [-w <value>]

ARGUMENTS
  ID  Webinar ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Retrieve the event log for a webinar

EXAMPLES
  $ twentythree webinar log 12345

  $ twentythree webinar log 12345 --json
```

_See code: [src/commands/webinar/log.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/log.ts)_

## `twentythree webinar mail add [ID]`

Add an email to a webinar

```
USAGE
  $ twentythree webinar mail add [ID] [--json] [-w <value>] [--series-id <value>] [--subject <value>] [--message
    <value>] [--recipient-groups <value>] [--scheduled-at <value>] [--cta-link <value>] [--cta-label <value>]
    [--send-immediately] [--include-live-info] [--include-series-archive]

ARGUMENTS
  [ID]  Webinar ID (omit when using --series-id)

FLAGS
  --cta-label=<value>            Call-to-action button label
  --cta-link=<value>             Call-to-action link URL
  --[no-]include-live-info       Include the webinar info block in the email
  --[no-]include-series-archive  Include the series archive block in the email
  --message=<value>              Email message body
  --recipient-groups=<value>     Recipient groups (comma-separated): speakers, registered, attendees, noshows
  --scheduled-at=<value>         When to send the email (ISO 8601 timestamp)
  --[no-]send-immediately        Send the email immediately
  --series-id=<value>            Series ID — add mail to a series instead of a webinar
  --subject=<value>              Email subject

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Add an email to a webinar

EXAMPLES
  $ twentythree webinar mail add 12345 --subject "Reminder" --message "Join us tomorrow!"

  $ twentythree webinar mail add --series-id 67890 --subject "Reminder"

  $ twentythree webinar mail add 12345 --subject "Reminder" --message "Join us!" --recipient-groups "registered,attendees" --cta-link "https://example.com" --cta-label "Join" --json
```

_See code: [src/commands/webinar/mail/add.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/mail/add.ts)_

## `twentythree webinar mail list [ID]`

List emails for a webinar

```
USAGE
  $ twentythree webinar mail list [ID] [--json] [-w <value>] [--series-id <value>]

ARGUMENTS
  [ID]  Webinar ID (omit when using --series-id)

FLAGS
  --series-id=<value>  Series ID — list mails for a series instead of a webinar

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List emails for a webinar

EXAMPLES
  $ twentythree webinar mail list 12345

  $ twentythree webinar mail list --series-id 67890

  $ twentythree webinar mail list 12345 --json
```

_See code: [src/commands/webinar/mail/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/mail/list.ts)_

## `twentythree webinar mail preview ID`

Preview a webinar email as raw HTML

```
USAGE
  $ twentythree webinar mail preview ID [--json] [-w <value>] [--webinar-id <value> | --series-id <value>]

ARGUMENTS
  ID  Mail ID

FLAGS
  --series-id=<value>   Series ID (mutually exclusive with --webinar-id)
  --webinar-id=<value>  Webinar ID (mutually exclusive with --series-id)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Preview a webinar email as raw HTML

EXAMPLES
  $ twentythree webinar mail preview 555 --webinar-id 12345

  $ twentythree webinar mail preview 555 --series-id 67890 > preview.html

  $ twentythree webinar mail preview 555 --webinar-id 12345 --json
```

_See code: [src/commands/webinar/mail/preview.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/mail/preview.ts)_

## `twentythree webinar mail remove ID`

Remove an email from a webinar

```
USAGE
  $ twentythree webinar mail remove ID [--json] [-w <value>] [--webinar-id <value> | --series-id <value>]

ARGUMENTS
  ID  Mail ID

FLAGS
  --series-id=<value>   Series ID (mutually exclusive with --webinar-id)
  --webinar-id=<value>  Webinar ID (mutually exclusive with --series-id)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Remove an email from a webinar

EXAMPLES
  $ twentythree webinar mail remove 555 --webinar-id 12345

  $ twentythree webinar mail remove 555 --series-id 67890 --json
```

_See code: [src/commands/webinar/mail/remove.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/mail/remove.ts)_

## `twentythree webinar mail send ID`

Send a webinar email

```
USAGE
  $ twentythree webinar mail send ID [--json] [-w <value>] [--webinar-id <value> | --series-id <value>]

ARGUMENTS
  ID  Mail ID

FLAGS
  --series-id=<value>   Series ID (mutually exclusive with --webinar-id)
  --webinar-id=<value>  Webinar ID (mutually exclusive with --series-id)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Send a webinar email

EXAMPLES
  $ twentythree webinar mail send 555 --webinar-id 12345

  $ twentythree webinar mail send 555 --series-id 67890 --json
```

_See code: [src/commands/webinar/mail/send.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/mail/send.ts)_

## `twentythree webinar mail test ID`

Send a test email

```
USAGE
  $ twentythree webinar mail test ID [--json] [-w <value>] [--webinar-id <value> | --series-id <value>] [--email
    <value>]

ARGUMENTS
  ID  Mail ID

FLAGS
  --email=<value>       Recipient email for test
  --series-id=<value>   Series ID (mutually exclusive with --webinar-id)
  --webinar-id=<value>  Webinar ID (mutually exclusive with --series-id)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Send a test email

EXAMPLES
  $ twentythree webinar mail test 555 --webinar-id 12345 --email me@example.com

  $ twentythree webinar mail test 555 --series-id 67890

  $ twentythree webinar mail test 555 --webinar-id 12345 --email me@example.com --json
```

_See code: [src/commands/webinar/mail/test.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/mail/test.ts)_

## `twentythree webinar mail update ID`

Update a webinar email

```
USAGE
  $ twentythree webinar mail update ID [--json] [-w <value>] [--webinar-id <value> | --series-id <value>] [--subject
    <value>] [--message <value>] [--enabled] [--recipient-groups <value>] [--scheduled-at <value>] [--cta-link
    <value>] [--cta-label <value>] [--include-live-info] [--include-series-archive] [--require-recording]

ARGUMENTS
  ID  Mail ID

FLAGS
  --cta-label=<value>            Call-to-action button label
  --cta-link=<value>             Call-to-action link URL
  --[no-]enabled                 Enable or disable the email (e.g. --no-enabled to disable the "missed" mail)
  --[no-]include-live-info       Include the webinar info block in the email
  --[no-]include-series-archive  Include the series archive block in the email
  --message=<value>              Email message body
  --recipient-groups=<value>     Recipient groups (comma-separated): speakers, registered, attendees, noshows
  --[no-]require-recording       Only send once a recording is available
  --scheduled-at=<value>         When to send the email (ISO 8601 timestamp)
  --series-id=<value>            Series ID (mutually exclusive with --webinar-id)
  --subject=<value>              Email subject
  --webinar-id=<value>           Webinar ID (mutually exclusive with --series-id)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update a webinar email

EXAMPLES
  $ twentythree webinar mail update 555 --webinar-id 12345 --subject "Updated Subject"

  $ twentythree webinar mail update 555 --series-id 67890 --message "New content"

  $ twentythree webinar mail update 555 --webinar-id 12345 --subject "Updated" --json
```

_See code: [src/commands/webinar/mail/update.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/mail/update.ts)_

## `twentythree webinar metrics ID`

Retrieve metrics for a webinar

```
USAGE
  $ twentythree webinar metrics ID [--json] [-w <value>]

ARGUMENTS
  ID  Webinar ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Retrieve metrics for a webinar

EXAMPLES
  $ twentythree webinar metrics 12345

  $ twentythree webinar metrics 12345 --json
```

_See code: [src/commands/webinar/metrics.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/metrics.ts)_

## `twentythree webinar queued-video add ID`

Add a queued video to a webinar

```
USAGE
  $ twentythree webinar queued-video add ID [--json] [-w <value>] [--video-id <value>]

ARGUMENTS
  ID  Webinar ID

FLAGS
  --video-id=<value>  Video ID to queue

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Add a queued video to a webinar

EXAMPLES
  $ twentythree webinar queued-video add 12345 --video-id 67890

  $ twentythree webinar queued-video add 12345 --video-id 67890 --json
```

_See code: [src/commands/webinar/queued-video/add.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/queued-video/add.ts)_

## `twentythree webinar queued-video remove ID`

Remove a queued video from a webinar

```
USAGE
  $ twentythree webinar queued-video remove ID [--json] [-w <value>] [--video-id <value>]

ARGUMENTS
  ID  Webinar ID

FLAGS
  --video-id=<value>  Video ID to remove from queue

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Remove a queued video from a webinar

EXAMPLES
  $ twentythree webinar queued-video remove 12345 --video-id 67890

  $ twentythree webinar queued-video remove 12345 --video-id 67890 --json
```

_See code: [src/commands/webinar/queued-video/remove.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/queued-video/remove.ts)_

## `twentythree webinar recording split ID`

Split the current recording into a new segment

```
USAGE
  $ twentythree webinar recording split ID [--json] [-w <value>]

ARGUMENTS
  ID  Webinar ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Split the current recording into a new segment

EXAMPLES
  $ twentythree webinar recording split 12345

  $ twentythree webinar recording split 12345 --json
```

_See code: [src/commands/webinar/recording/split.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/recording/split.ts)_

## `twentythree webinar recording start ID`

Start recording a webinar

```
USAGE
  $ twentythree webinar recording start ID [--json] [-w <value>]

ARGUMENTS
  ID  Webinar ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Start recording a webinar

EXAMPLES
  $ twentythree webinar recording start 12345

  $ twentythree webinar recording start 12345 --json
```

_See code: [src/commands/webinar/recording/start.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/recording/start.ts)_

## `twentythree webinar recording status ID`

Get recording status for a webinar

```
USAGE
  $ twentythree webinar recording status ID [--json] [-w <value>]

ARGUMENTS
  ID  Webinar ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get recording status for a webinar

EXAMPLES
  $ twentythree webinar recording status 12345

  $ twentythree webinar recording status 12345 --json
```

_See code: [src/commands/webinar/recording/status.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/recording/status.ts)_

## `twentythree webinar recording stop ID`

Stop recording a webinar

```
USAGE
  $ twentythree webinar recording stop ID [--json] [-w <value>]

ARGUMENTS
  ID  Webinar ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Stop recording a webinar

EXAMPLES
  $ twentythree webinar recording stop 12345

  $ twentythree webinar recording stop 12345 --json
```

_See code: [src/commands/webinar/recording/stop.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/recording/stop.ts)_

## `twentythree webinar repeat ID`

Duplicate a webinar and schedule the copy at a new date/time

```
USAGE
  $ twentythree webinar repeat ID --date <value> [--json] [-w <value>]

ARGUMENTS
  ID  Webinar ID

FLAGS
  --date=<value>  (required) Schedule date/time for the new webinar (ISO 8601)

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

## `twentythree webinar room connect ID`

Get connection info for a webinar room

```
USAGE
  $ twentythree webinar room connect ID [--json] [-w <value>]

ARGUMENTS
  ID  Webinar ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get connection info for a webinar room

EXAMPLES
  $ twentythree webinar room connect 12345

  $ twentythree webinar room connect 12345 --json
```

_See code: [src/commands/webinar/room/connect.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/room/connect.ts)_

## `twentythree webinar room info ID`

Get room information for a webinar

```
USAGE
  $ twentythree webinar room info ID [--json] [-w <value>]

ARGUMENTS
  ID  Webinar ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get room information for a webinar

EXAMPLES
  $ twentythree webinar room info 12345

  $ twentythree webinar room info 12345 --json
```

_See code: [src/commands/webinar/room/info.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/room/info.ts)_

## `twentythree webinar room send-recording ID`

Send a recording from the webinar room

```
USAGE
  $ twentythree webinar room send-recording ID [--json] [-w <value>]

ARGUMENTS
  ID  Webinar ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Send a recording from the webinar room

EXAMPLES
  $ twentythree webinar room send-recording 12345

  $ twentythree webinar room send-recording 12345 --json
```

_See code: [src/commands/webinar/room/send-recording.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/room/send-recording.ts)_

## `twentythree webinar room themes`

List available room themes

```
USAGE
  $ twentythree webinar room themes [--json] [-w <value>]

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List available room themes

EXAMPLES
  $ twentythree webinar room themes

  $ twentythree webinar room themes --json
```

_See code: [src/commands/webinar/room/themes.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/room/themes.ts)_

## `twentythree webinar section add ID`

Add an agenda section to a webinar

```
USAGE
  $ twentythree webinar section add ID [--json] [-w <value>] [--title <value>] [--description <value>] [--start-time
    <value>]

ARGUMENTS
  ID  Webinar ID

FLAGS
  --description=<value>  Section description
  --start-time=<value>   Start time in seconds
  --title=<value>        Section title

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Add an agenda section to a webinar

EXAMPLES
  $ twentythree webinar section add 12345 --title "Introduction"

  $ twentythree webinar section add 12345 --title "Q&A" --start-time 3600

  $ twentythree webinar section add 12345 --title "Welcome" --description "Opening remarks" --json
```

_See code: [src/commands/webinar/section/add.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/section/add.ts)_

## `twentythree webinar section list ID`

List agenda sections for a webinar

```
USAGE
  $ twentythree webinar section list ID [--json] [-w <value>] [--token <value>]

ARGUMENTS
  ID  Webinar ID

FLAGS
  --token=<value>  Webinar token (auto-looked up if omitted)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List agenda sections for a webinar

EXAMPLES
  $ twentythree webinar section list 12345

  $ twentythree webinar section list 12345 --json
```

_See code: [src/commands/webinar/section/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/section/list.ts)_

## `twentythree webinar section remove WEBINARID ID`

Remove an agenda section from a webinar

```
USAGE
  $ twentythree webinar section remove WEBINARID ID [--json] [-w <value>]

ARGUMENTS
  WEBINARID  Webinar ID
  ID         Section ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Remove an agenda section from a webinar

EXAMPLES
  $ twentythree webinar section remove 12345 99

  $ twentythree webinar section remove 12345 99 --json
```

_See code: [src/commands/webinar/section/remove.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/section/remove.ts)_

## `twentythree webinar section update WEBINARID ID`

Update an agenda section

```
USAGE
  $ twentythree webinar section update WEBINARID ID [--json] [-w <value>] [--title <value>] [--description <value>]
    [--start-time <value>]

ARGUMENTS
  WEBINARID  Webinar ID
  ID         Section ID

FLAGS
  --description=<value>  New section description
  --start-time=<value>   New start time in seconds
  --title=<value>        New section title

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update an agenda section

EXAMPLES
  $ twentythree webinar section update 12345 99 --title "Updated Title"

  $ twentythree webinar section update 12345 99 --start-time 1800

  $ twentythree webinar section update 12345 99 --title "Q&A" --description "Audience questions" --json
```

_See code: [src/commands/webinar/section/update.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/section/update.ts)_

## `twentythree webinar series apply-recurrence ID`

Apply a recurrence to a webinar series

```
USAGE
  $ twentythree webinar series apply-recurrence ID [--json] [-w <value>] [--recurrence-id <value>]

ARGUMENTS
  ID  Series ID

FLAGS
  --recurrence-id=<value>  Recurrence ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Apply a recurrence to a webinar series

EXAMPLES
  $ twentythree webinar series apply-recurrence 42 --recurrence-id 7

  $ twentythree webinar series apply-recurrence 42 --recurrence-id 7 --json
```

_See code: [src/commands/webinar/series/apply-recurrence.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/series/apply-recurrence.ts)_

## `twentythree webinar series cancel ID`

Cancel a webinar series

```
USAGE
  $ twentythree webinar series cancel ID [--json] [-w <value>] [--cancel-associations]

ARGUMENTS
  ID  Series ID

FLAGS
  --[no-]cancel-associations  Also cancel associated webinars

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Cancel a webinar series

EXAMPLES
  $ twentythree webinar series cancel 42

  $ twentythree webinar series cancel 42 --cancel-associations

  $ twentythree webinar series cancel 42 --json
```

_See code: [src/commands/webinar/series/cancel.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/series/cancel.ts)_

## `twentythree webinar series create`

Create a webinar series

```
USAGE
  $ twentythree webinar series create [--json] [-w <value>] [--name <value>] [--description <value>]

FLAGS
  --description=<value>  Series description
  --name=<value>         Series name

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Create a webinar series

EXAMPLES
  $ twentythree webinar series create --name "My Series"

  $ twentythree webinar series create --name "My Series" --description "Weekly sessions"

  $ twentythree webinar series create --name "My Series" --json
```

_See code: [src/commands/webinar/series/create.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/series/create.ts)_

## `twentythree webinar series delete ID`

Delete a webinar series

```
USAGE
  $ twentythree webinar series delete ID [--json] [-w <value>] [--delete-associations]

ARGUMENTS
  ID  Series ID

FLAGS
  --[no-]delete-associations  Also delete associated webinars

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete a webinar series

EXAMPLES
  $ twentythree webinar series delete 42

  $ twentythree webinar series delete 42 --delete-associations

  $ twentythree webinar series delete 42 --json
```

_See code: [src/commands/webinar/series/delete.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/series/delete.ts)_

## `twentythree webinar series list`

List webinar series

```
USAGE
  $ twentythree webinar series list [--json] [-w <value>]

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List webinar series

EXAMPLES
  $ twentythree webinar series list

  $ twentythree webinar series list --json
```

_See code: [src/commands/webinar/series/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/series/list.ts)_

## `twentythree webinar series mapped-objects ID`

List mapped objects for a webinar series

```
USAGE
  $ twentythree webinar series mapped-objects ID [--json] [-w <value>]

ARGUMENTS
  ID  Series ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List mapped objects for a webinar series

EXAMPLES
  $ twentythree webinar series mapped-objects 42

  $ twentythree webinar series mapped-objects 42 --json
```

_See code: [src/commands/webinar/series/mapped-objects.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/series/mapped-objects.ts)_

## `twentythree webinar series metrics ID`

Get metrics for a webinar series

```
USAGE
  $ twentythree webinar series metrics ID [--json] [-w <value>]

ARGUMENTS
  ID  Series ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get metrics for a webinar series

EXAMPLES
  $ twentythree webinar series metrics 42

  $ twentythree webinar series metrics 42 --json
```

_See code: [src/commands/webinar/series/metrics.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/series/metrics.ts)_

## `twentythree webinar series recurrences ID`

List recurrences for a webinar series

```
USAGE
  $ twentythree webinar series recurrences ID [--json] [-w <value>]

ARGUMENTS
  ID  Series ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List recurrences for a webinar series

EXAMPLES
  $ twentythree webinar series recurrences 42

  $ twentythree webinar series recurrences 42 --json
```

_See code: [src/commands/webinar/series/recurrences.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/series/recurrences.ts)_

## `twentythree webinar series set-ondemand ID`

Set a webinar series to on-demand

```
USAGE
  $ twentythree webinar series set-ondemand ID [--json] [-w <value>] [--update-associations]

ARGUMENTS
  ID  Series ID

FLAGS
  --[no-]update-associations  Also update associated webinars

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Set a webinar series to on-demand

EXAMPLES
  $ twentythree webinar series set-ondemand 42

  $ twentythree webinar series set-ondemand 42 --update-associations

  $ twentythree webinar series set-ondemand 42 --json
```

_See code: [src/commands/webinar/series/set-ondemand.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/series/set-ondemand.ts)_

## `twentythree webinar series skip-recurrence ID`

Skip or unskip a recurrence for a webinar series

```
USAGE
  $ twentythree webinar series skip-recurrence ID [--json] [-w <value>] [--recurrence-id <value>] [--skipped]

ARGUMENTS
  ID  Series ID

FLAGS
  --recurrence-id=<value>  Recurrence ID
  --[no-]skipped           Set skipped (--skipped) or unskipped (--no-skipped)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Skip or unskip a recurrence for a webinar series

EXAMPLES
  $ twentythree webinar series skip-recurrence 42 --recurrence-id 7 --skipped

  $ twentythree webinar series skip-recurrence 42 --recurrence-id 7 --no-skipped

  $ twentythree webinar series skip-recurrence 42 --recurrence-id 7 --skipped --json
```

_See code: [src/commands/webinar/series/skip-recurrence.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/series/skip-recurrence.ts)_

## `twentythree webinar series update ID`

Update a webinar series

```
USAGE
  $ twentythree webinar series update ID [--json] [-w <value>] [--name <value>] [--description <value>] [--seo-policy
    |index|noindex] [--trailer-video-id <value>]

ARGUMENTS
  ID  Series ID

FLAGS
  --description=<value>       Series description
  --name=<value>             Series name
  --seo-policy=<option>       SEO policy for the series: index, noindex, or empty string to reset
                             <options: |index|noindex>
  --trailer-video-id=<value>  ID of a video to use as the series trailer (API trailer_photo_id)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update a webinar series

EXAMPLES
  $ twentythree webinar series update 42 --name "Updated Series"

  $ twentythree webinar series update 42 --description "New description"

  $ twentythree webinar series update 42 --name "Updated" --json
```

_See code: [src/commands/webinar/series/update.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/series/update.ts)_

## `twentythree webinar series upload-thumbnail ID FILE`

Upload a thumbnail for a webinar series

```
USAGE
  $ twentythree webinar series upload-thumbnail ID FILE [--json] [-w <value>] [--chunk-size <value>] [--concurrency
  <value>]

ARGUMENTS
  ID    Series ID
  FILE  Path to the image file to upload

FLAGS
  --chunk-size=<value>   [default: 5242880] Chunk size in bytes (default: 5242880)
  --concurrency=<value>  [default: 5] Number of chunks to upload in parallel (default: 5)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Upload a thumbnail for a webinar series

EXAMPLES
  $ twentythree webinar series upload-thumbnail 42 ./thumb.jpg

  $ twentythree webinar series upload-thumbnail 42 ./thumbnail.png --json
```

_See code: [src/commands/webinar/series/upload-thumbnail.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/series/upload-thumbnail.ts)_

## `twentythree webinar speaker add ID`

Add a speaker to a webinar

```
USAGE
  $ twentythree webinar speaker add ID [--json] [-w <value>] [--name <value>] [--email <value>] [--title <value>]
    [--bio <value>] [--description <value>] [--company <value>] [--website <value>] [--linkedin <value>]
    [--facebook <value>] [--twitter <value>] [--connection-type webrtc|gearmode|rtmp|whip|srt|url]
    [--connection-type-pull-url <value>]

ARGUMENTS
  ID  Webinar ID

FLAGS
  --bio=<value>                       Speaker bio shown in the UI
  --company=<value>                   Speaker company / organization
  --connection-type=<option>          Speaker connection type
                                      <options: webrtc|gearmode|rtmp|whip|srt|url>
  --connection-type-pull-url=<value>  Pull URL for connection types that support stream pull (whip, url)
  --description=<value>               Alias for --bio (sets the speaker bio shown in the UI)
  --email=<value>                     Speaker email (required for WebRTC speakers)
  --facebook=<value>                  Speaker Facebook URL or handle
  --linkedin=<value>                  Speaker LinkedIn URL or handle
  --name=<value>                      Speaker name
  --title=<value>                     Speaker title or job title
  --twitter=<value>                   Speaker Twitter/X handle
  --website=<value>                   Speaker website URL

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Add a speaker to a webinar

EXAMPLES
  $ twentythree webinar speaker add 12345 --name "Jane Doe" --email jane@example.com

  $ twentythree webinar speaker add 12345 --name "John Smith" --connection-type rtmp

  $ twentythree webinar speaker add 12345 --name "Jane Doe" --title "CTO" --company "Acme" --bio "Builds things" --linkedin "in/janedoe" --json
```

_See code: [src/commands/webinar/speaker/add.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/speaker/add.ts)_

## `twentythree webinar speaker add-from-speaker ID`

Add a speaker from the workspace speaker library

```
USAGE
  $ twentythree webinar speaker add-from-speaker ID [--json] [-w <value>] [--speaker-id <value>]

ARGUMENTS
  ID  Webinar ID

FLAGS
  --speaker-id=<value>  Library speaker ID to add

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Add a speaker from the workspace speaker library

EXAMPLES
  $ twentythree webinar speaker add-from-speaker 12345 --speaker-id 99

  $ twentythree webinar speaker add-from-speaker 12345

  $ twentythree webinar speaker add-from-speaker 12345 --speaker-id 99 --json
```

_See code: [src/commands/webinar/speaker/add-from-speaker.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/speaker/add-from-speaker.ts)_

## `twentythree webinar speaker add-from-user ID`

Add a workspace user as a speaker on a webinar

```
USAGE
  $ twentythree webinar speaker add-from-user ID [--json] [-w <value>] [--user-id <value>]

ARGUMENTS
  ID  Webinar ID

FLAGS
  --user-id=<value>  User ID to add as speaker

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Add a workspace user as a speaker on a webinar

EXAMPLES
  $ twentythree webinar speaker add-from-user 12345 --user-id 42

  $ twentythree webinar speaker add-from-user 12345

  $ twentythree webinar speaker add-from-user 12345 --user-id 42 --json
```

_See code: [src/commands/webinar/speaker/add-from-user.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/speaker/add-from-user.ts)_

## `twentythree webinar speaker cancel-guest-request WEBINARID ID`

Cancel a guest request for a speaker

```
USAGE
  $ twentythree webinar speaker cancel-guest-request WEBINARID ID [--json] [-w <value>]

ARGUMENTS
  WEBINARID  Webinar ID
  ID         Speaker ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Cancel a guest request for a speaker

EXAMPLES
  $ twentythree webinar speaker cancel-guest-request 12345 9900

  $ twentythree webinar speaker cancel-guest-request 12345 9900 --json
```

_See code: [src/commands/webinar/speaker/cancel-guest-request.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/speaker/cancel-guest-request.ts)_

## `twentythree webinar speaker connection-types ID`

List available speaker connection types

```
USAGE
  $ twentythree webinar speaker connection-types ID [--json] [-w <value>]

ARGUMENTS
  ID  Webinar ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List available speaker connection types

EXAMPLES
  $ twentythree webinar speaker connection-types 12345

  $ twentythree webinar speaker connection-types 12345 --json
```

_See code: [src/commands/webinar/speaker/connection-types.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/speaker/connection-types.ts)_

## `twentythree webinar speaker library`

List speakers in the workspace library

```
USAGE
  $ twentythree webinar speaker library [--json] [-w <value>]

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List speakers in the workspace library

EXAMPLES
  $ twentythree webinar speaker library

  $ twentythree webinar speaker library --json
```

_See code: [src/commands/webinar/speaker/library.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/speaker/library.ts)_

## `twentythree webinar speaker list ID`

List speakers for a webinar

```
USAGE
  $ twentythree webinar speaker list ID [--json] [-w <value>] [--token <value>]

ARGUMENTS
  ID  Webinar ID

FLAGS
  --token=<value>  Webinar token (auto-looked up if omitted)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List speakers for a webinar

EXAMPLES
  $ twentythree webinar speaker list 12345

  $ twentythree webinar speaker list 12345 --json
```

_See code: [src/commands/webinar/speaker/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/speaker/list.ts)_

## `twentythree webinar speaker remove WEBINARID ID`

Remove a speaker from a webinar

```
USAGE
  $ twentythree webinar speaker remove WEBINARID ID [--json] [-w <value>]

ARGUMENTS
  WEBINARID  Webinar ID
  ID         Speaker ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Remove a speaker from a webinar

EXAMPLES
  $ twentythree webinar speaker remove 12345 9900

  $ twentythree webinar speaker remove 12345 9900 --json
```

_See code: [src/commands/webinar/speaker/remove.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/speaker/remove.ts)_

## `twentythree webinar speaker remove-avatar WEBINARID ID`

Remove the avatar image from a speaker

```
USAGE
  $ twentythree webinar speaker remove-avatar WEBINARID ID [--json] [-w <value>]

ARGUMENTS
  WEBINARID  Webinar ID
  ID         Speaker ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Remove the avatar image from a speaker

EXAMPLES
  $ twentythree webinar speaker remove-avatar 12345 9900

  $ twentythree webinar speaker remove-avatar 12345 9900 --json
```

_See code: [src/commands/webinar/speaker/remove-avatar.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/speaker/remove-avatar.ts)_

## `twentythree webinar speaker request-guest WEBINARID ID`

Request a speaker as a guest

```
USAGE
  $ twentythree webinar speaker request-guest WEBINARID ID [--json] [-w <value>]

ARGUMENTS
  WEBINARID  Webinar ID
  ID         Speaker ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Request a speaker as a guest

EXAMPLES
  $ twentythree webinar speaker request-guest 12345 9900

  $ twentythree webinar speaker request-guest 12345 9900 --json
```

_See code: [src/commands/webinar/speaker/request-guest.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/speaker/request-guest.ts)_

## `twentythree webinar speaker send-invitation WEBINARID ID`

Send an invitation to a speaker

```
USAGE
  $ twentythree webinar speaker send-invitation WEBINARID ID [--json] [-w <value>]

ARGUMENTS
  WEBINARID  Webinar ID
  ID         Speaker ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Send an invitation to a speaker

EXAMPLES
  $ twentythree webinar speaker send-invitation 12345 9900

  $ twentythree webinar speaker send-invitation 12345 9900 --json
```

_See code: [src/commands/webinar/speaker/send-invitation.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/speaker/send-invitation.ts)_

## `twentythree webinar speaker set-avatar WEBINARID ID FILE`

Upload an avatar image for a speaker

```
USAGE
  $ twentythree webinar speaker set-avatar WEBINARID ID FILE [--json] [-w <value>] [--chunk-size <value>] [--concurrency
  <value>]

ARGUMENTS
  WEBINARID  Webinar ID
  ID         Speaker ID
  FILE       Path to image file

FLAGS
  --chunk-size=<value>   [default: 5242880] Chunk size in bytes (default: 5242880)
  --concurrency=<value>  [default: 5] Number of chunks to upload in parallel (default: 5)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Upload an avatar image for a speaker

EXAMPLES
  $ twentythree webinar speaker set-avatar 12345 9900 ./avatar.jpg

  $ twentythree webinar speaker set-avatar 12345 9900 ./avatar.png --chunk-size 524288
```

_See code: [src/commands/webinar/speaker/set-avatar.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/speaker/set-avatar.ts)_

## `twentythree webinar speaker set-order ID`

Set the display order of a speaker on a webinar

```
USAGE
  $ twentythree webinar speaker set-order ID [--json] [-w <value>] [--speaker-id <value>] [--order <value>]

ARGUMENTS
  ID  Webinar ID

FLAGS
  --order=<value>       New display order (1-based)
  --speaker-id=<value>  Speaker ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Set the display order of a speaker on a webinar

EXAMPLES
  $ twentythree webinar speaker set-order 12345 --speaker-id 9900 --order 1

  $ twentythree webinar speaker set-order 12345

  $ twentythree webinar speaker set-order 12345 --speaker-id 9900 --order 1 --json
```

_See code: [src/commands/webinar/speaker/set-order.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/speaker/set-order.ts)_

## `twentythree webinar speaker update WEBINARID ID`

Update a speaker on a webinar

```
USAGE
  $ twentythree webinar speaker update WEBINARID ID [--json] [-w <value>] [--name <value>] [--email <value>] [--title
    <value>] [--bio <value>] [--description <value>] [--company <value>] [--website <value>] [--linkedin <value>]
    [--facebook <value>] [--twitter <value>] [--connection-type webrtc|gearmode|rtmp|whip|srt|url]
    [--connection-type-pull-url <value>]

ARGUMENTS
  WEBINARID  Webinar ID
  ID         Speaker ID

FLAGS
  --bio=<value>                       Speaker bio shown in the UI
  --company=<value>                   Speaker company / organization
  --connection-type=<option>          Speaker connection type
                                      <options: webrtc|gearmode|rtmp|whip|srt|url>
  --connection-type-pull-url=<value>  Pull URL for connection types that support stream pull (whip, url)
  --description=<value>               Alias for --bio (sets the speaker bio shown in the UI)
  --email=<value>                     Speaker email
  --facebook=<value>                  Speaker Facebook URL or handle
  --linkedin=<value>                  Speaker LinkedIn URL or handle
  --name=<value>                      Speaker name
  --title=<value>                     Speaker title or job title
  --twitter=<value>                   Speaker Twitter/X handle
  --website=<value>                   Speaker website URL

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update a speaker on a webinar

EXAMPLES
  $ twentythree webinar speaker update 12345 9900 --name "Jane Doe"

  $ twentythree webinar speaker update 12345 9900 --company "Acme" --linkedin "in/janedoe"

  $ twentythree webinar speaker update 12345 9900 --email jane@example.com --title "CTO" --bio "Builds things"

  $ twentythree webinar speaker update 12345 9900 --name "Jane Doe" --json
```

_See code: [src/commands/webinar/speaker/update.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/speaker/update.ts)_

## `twentythree webinar transcription connect ID`

Connect a transcription to a webinar

```
USAGE
  $ twentythree webinar transcription connect ID [--json] [-w <value>] [--presenter-token <value>]

ARGUMENTS
  ID  Webinar ID

FLAGS
  --presenter-token=<value>  Presenter token

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Connect a transcription to a webinar

EXAMPLES
  $ twentythree webinar transcription connect 12345

  $ twentythree webinar transcription connect 12345 --presenter-token abc123

  $ twentythree webinar transcription connect 12345 --json
```

_See code: [src/commands/webinar/transcription/connect.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/transcription/connect.ts)_

## `twentythree webinar transcription list ID`

List transcriptions for a webinar

```
USAGE
  $ twentythree webinar transcription list ID [--json] [-w <value>] [--token <value>]

ARGUMENTS
  ID  Webinar ID

FLAGS
  --token=<value>  Webinar token (auto-looked up if not provided)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List transcriptions for a webinar

EXAMPLES
  $ twentythree webinar transcription list 12345

  $ twentythree webinar transcription list 12345 --json

  $ twentythree webinar transcription list 12345 --token mytoken
```

_See code: [src/commands/webinar/transcription/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/transcription/list.ts)_

## `twentythree webinar transcription locales ID`

List available transcription locales for a webinar

```
USAGE
  $ twentythree webinar transcription locales ID [--json] [-w <value>] [--token <value>]

ARGUMENTS
  ID  Webinar ID

FLAGS
  --token=<value>  Webinar token (auto-looked up if not provided)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List available transcription locales for a webinar

EXAMPLES
  $ twentythree webinar transcription locales 12345

  $ twentythree webinar transcription locales 12345 --json

  $ twentythree webinar transcription locales 12345 --token mytoken
```

_See code: [src/commands/webinar/transcription/locales.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/transcription/locales.ts)_

## `twentythree webinar transcription transcriptionlist`

List all transcriptions in the workspace

```
USAGE
  $ twentythree webinar transcription transcriptionlist [--json] [-w <value>]

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List all transcriptions in the workspace

EXAMPLES
  $ twentythree webinar transcription transcriptionlist

  $ twentythree webinar transcription transcriptionlist --json
```

_See code: [src/commands/webinar/transcription/transcriptionlist.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/transcription/transcriptionlist.ts)_

## `twentythree webinar update ID`

Update details for a webinar

```
USAGE
  $ twentythree webinar update ID [--json] [-w <value>] [--title <value>] [--description <value>] [--status <value>]
    [--live-date <value>] [--draft] [--publish] [--seo-policy |index|noindex] [--webinar-design-id <value>]
    [--format event|webinar] [--registration-mode all|none] [--private] [--category-id <value>] [--locale <value>]
    [--publish-recordings] [--ondemand] [--series-id <value>] [--trailer-video-id <value>] [--timezone <value>]

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
  --trailer-video-id=<value>    ID of a video to use as the webinar trailer (API trailer_photo_id)
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

_See code: [src/commands/webinar/update.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/update.ts)_

## `twentythree webinar upload-image ID FILE`

Upload an image for a webinar (thumbnail, preview, or before-webinar)

```
USAGE
  $ twentythree webinar upload-image ID FILE [--json] [-w <value>] [--type thumbnail|preview|before_webinar] [--chunk-size
    <value>] [--concurrency <value>]

ARGUMENTS
  ID    Webinar ID
  FILE  Path to the image file to upload

FLAGS
  --chunk-size=<value>   [default: 5242880] Chunk size in bytes (default: 5242880)
  --concurrency=<value>  [default: 5] Number of chunks to upload in parallel (default: 5)
  --type=<option>        [default: thumbnail] Image type
                         <options: thumbnail|preview|before_webinar>

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Upload an image for a webinar (thumbnail, preview, or before-webinar)

EXAMPLES
  $ twentythree webinar upload-image 12345 ./thumb.jpg

  $ twentythree webinar upload-image 12345 ./preview.png --type preview

  $ twentythree webinar upload-image 12345 ./before.jpg --type before_webinar
```

_See code: [src/commands/webinar/upload-image.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/webinar/upload-image.ts)_
