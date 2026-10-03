`twentythree webinar:delete`
============================

Delete a webinar from the active workspace

* [`twentythree webinar delete ID`](#twentythree-webinar-delete-id)

## `twentythree webinar delete ID`

Delete a webinar from the active workspace

```
USAGE
  $ twentythree webinar delete ID [--json] [-w <value>] [-y]

ARGUMENTS
  ID  Webinar ID

FLAGS
  -y, --yes  Skip the confirmation prompt. Required when no terminal is attached (CI, agents); --json also skips it.

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete a webinar from the active workspace

EXAMPLES
  $ twentythree webinar delete 12345

  $ twentythree webinar delete 12345 --json
```

_See code: [src/commands/webinar/delete.ts](https://github.com/23/twentythree-cli/blob/v1.8.0/src/commands/webinar/delete.ts)_
