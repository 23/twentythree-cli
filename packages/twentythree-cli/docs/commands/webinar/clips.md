`twentythree webinar:clips`
===========================

List recording clips from a webinar

* [`twentythree webinar clips ID`](#twentythree-webinar-clips-id)

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

_See code: [src/commands/webinar/clips.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/webinar/clips.ts)_
