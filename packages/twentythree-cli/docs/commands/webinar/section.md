`twentythree webinar:section`
=============================

Add an agenda section to a webinar

* [`twentythree webinar section add ID`](#twentythree-webinar-section-add-id)
* [`twentythree webinar section list ID`](#twentythree-webinar-section-list-id)
* [`twentythree webinar section remove WEBINARID ID`](#twentythree-webinar-section-remove-webinarid-id)
* [`twentythree webinar section update WEBINARID ID`](#twentythree-webinar-section-update-webinarid-id)

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

_See code: [src/commands/webinar/section/add.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/webinar/section/add.ts)_

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

_See code: [src/commands/webinar/section/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/webinar/section/list.ts)_

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

_See code: [src/commands/webinar/section/remove.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/webinar/section/remove.ts)_

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

_See code: [src/commands/webinar/section/update.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/webinar/section/update.ts)_
