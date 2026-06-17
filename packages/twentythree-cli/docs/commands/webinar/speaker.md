`twentythree webinar:speaker`
=============================

Add a speaker to a webinar

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

_See code: [src/commands/webinar/speaker/add.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/webinar/speaker/add.ts)_

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

_See code: [src/commands/webinar/speaker/add-from-speaker.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/webinar/speaker/add-from-speaker.ts)_

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

_See code: [src/commands/webinar/speaker/add-from-user.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/webinar/speaker/add-from-user.ts)_

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

_See code: [src/commands/webinar/speaker/cancel-guest-request.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/webinar/speaker/cancel-guest-request.ts)_

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

_See code: [src/commands/webinar/speaker/connection-types.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/webinar/speaker/connection-types.ts)_

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

_See code: [src/commands/webinar/speaker/library.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/webinar/speaker/library.ts)_

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

_See code: [src/commands/webinar/speaker/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/webinar/speaker/list.ts)_

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

_See code: [src/commands/webinar/speaker/remove.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/webinar/speaker/remove.ts)_

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

_See code: [src/commands/webinar/speaker/remove-avatar.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/webinar/speaker/remove-avatar.ts)_

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

_See code: [src/commands/webinar/speaker/request-guest.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/webinar/speaker/request-guest.ts)_

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

_See code: [src/commands/webinar/speaker/send-invitation.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/webinar/speaker/send-invitation.ts)_

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

_See code: [src/commands/webinar/speaker/set-avatar.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/webinar/speaker/set-avatar.ts)_

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

_See code: [src/commands/webinar/speaker/set-order.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/webinar/speaker/set-order.ts)_

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

_See code: [src/commands/webinar/speaker/update.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/webinar/speaker/update.ts)_
