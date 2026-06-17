`twentythree webinar:recording`
===============================

Split the current recording into a new segment

* [`twentythree webinar recording split ID`](#twentythree-webinar-recording-split-id)
* [`twentythree webinar recording start ID`](#twentythree-webinar-recording-start-id)
* [`twentythree webinar recording status ID`](#twentythree-webinar-recording-status-id)
* [`twentythree webinar recording stop ID`](#twentythree-webinar-recording-stop-id)

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
