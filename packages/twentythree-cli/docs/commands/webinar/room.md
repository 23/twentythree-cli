`twentythree webinar:room`
==========================

Get connection info for a webinar room

* [`twentythree webinar room connect ID`](#twentythree-webinar-room-connect-id)
* [`twentythree webinar room info ID`](#twentythree-webinar-room-info-id)
* [`twentythree webinar room send-recording ID`](#twentythree-webinar-room-send-recording-id)
* [`twentythree webinar room themes`](#twentythree-webinar-room-themes)

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

_See code: [src/commands/webinar/room/connect.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/webinar/room/connect.ts)_

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

_See code: [src/commands/webinar/room/info.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/webinar/room/info.ts)_

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

_See code: [src/commands/webinar/room/send-recording.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/webinar/room/send-recording.ts)_

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

_See code: [src/commands/webinar/room/themes.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/webinar/room/themes.ts)_
