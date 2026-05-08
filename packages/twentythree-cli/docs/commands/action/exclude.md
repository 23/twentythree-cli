`twentythree action:exclude`
============================

Exclude a CTA action from an object (or undo an exclusion)

* [`twentythree action exclude ID`](#twentythree-action-exclude-id)

## `twentythree action exclude ID`

Exclude a CTA action from an object (or undo an exclusion)

```
USAGE
  $ twentythree action exclude ID --object-id <value> [--json] [-w <value>] [--undo]

ARGUMENTS
  ID  Action ID

FLAGS
  --object-id=<value>  (required) Object ID to exclude the action from
  --undo               Remove the exclusion (reverse this operation)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Exclude a CTA action from an object (or undo an exclusion)

EXAMPLES
  $ twentythree action exclude 12345 --object-id 6789

  $ twentythree action exclude 12345 --object-id 6789 --undo

  $ twentythree action exclude 12345 --object-id 6789 --json
```

_See code: [src/commands/action/exclude.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/action/exclude.ts)_
