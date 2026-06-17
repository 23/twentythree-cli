`twentythree webinar:highlights`
================================

List highlights from a webinar

* [`twentythree webinar highlights ID`](#twentythree-webinar-highlights-id)

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
