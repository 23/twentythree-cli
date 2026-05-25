`twentythree action:include`
============================

Include an object in a CTA action scope (or undo an inclusion)

* [`twentythree action include ID`](#twentythree-action-include-id)

## `twentythree action include ID`

Include an object in a CTA action scope (or undo an inclusion)

```
USAGE
  $ twentythree action include ID --object-id <value> [--json] [-w <value>] [--undo]

ARGUMENTS
  ID  Action ID

FLAGS
  --object-id=<value>  (required) Object ID to include the action on
  --undo               Remove the inclusion (reverse this operation)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Include an object in a CTA action scope (or undo an inclusion)

EXAMPLES
  $ twentythree action include 12345 --object-id 6789

  $ twentythree action include 12345 --object-id 6789 --undo

  $ twentythree action include 12345 --object-id 6789 --json
```

_See code: [src/commands/action/include.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/action/include.ts)_
