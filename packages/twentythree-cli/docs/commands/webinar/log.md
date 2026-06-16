`twentythree webinar:log`
=========================

Retrieve the event log for a webinar

* [`twentythree webinar log ID`](#twentythree-webinar-log-id)

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

_See code: [src/commands/webinar/log.ts](https://github.com/23/twentythree-cli/blob/v1.6.0/src/commands/webinar/log.ts)_
