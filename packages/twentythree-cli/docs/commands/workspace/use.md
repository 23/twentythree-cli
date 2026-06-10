`twentythree workspace:use`
===========================

Switch the active workspace

* [`twentythree workspace use NAME`](#twentythree-workspace-use-name)

## `twentythree workspace use NAME`

Switch the active workspace

```
USAGE
  $ twentythree workspace use NAME [--json] [-w <value>]

ARGUMENTS
  NAME  Workspace domain or display name

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Switch the active workspace

EXAMPLES
  $ twentythree workspace use company.video23.com

  $ twentythree workspace use "Company Name"
```

_See code: [src/commands/workspace/use.ts](https://github.com/23/twentythree-cli/blob/v1.4.0/src/commands/workspace/use.ts)_
