`twentythree webinar:transcription`
===================================

Connect a transcription to a webinar

* [`twentythree webinar transcription connect ID`](#twentythree-webinar-transcription-connect-id)
* [`twentythree webinar transcription list ID`](#twentythree-webinar-transcription-list-id)
* [`twentythree webinar transcription locales ID`](#twentythree-webinar-transcription-locales-id)
* [`twentythree webinar transcription transcriptionlist`](#twentythree-webinar-transcription-transcriptionlist)

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

_See code: [src/commands/webinar/transcription/connect.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/webinar/transcription/connect.ts)_

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

_See code: [src/commands/webinar/transcription/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/webinar/transcription/list.ts)_

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

_See code: [src/commands/webinar/transcription/locales.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/webinar/transcription/locales.ts)_

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

_See code: [src/commands/webinar/transcription/transcriptionlist.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/webinar/transcription/transcriptionlist.ts)_
