`twentythree protection:protect`
================================

Apply protection to content

* [`twentythree protection protect`](#twentythree-protection-protect)

## `twentythree protection protect`

Apply protection to content

```
USAGE
  $ twentythree protection protect --protection-method <value> [--json] [-w <value>] [--object-id <value>]
    [--grace-minutes <value>]

FLAGS
  --grace-minutes=<value>      Grace period in minutes before protection activates
  --object-id=<value>          Object ID to protect
  --protection-method=<value>  (required) Protection method (e.g. password, sso, token)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Apply protection to content

EXAMPLES
  $ twentythree protection protect --protection-method password

  $ twentythree protection protect --protection-method sso --object-id 12345

  $ twentythree protection protect --protection-method token --grace-minutes 30 --json
```

_See code: [src/commands/protection/protect.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/protection/protect.ts)_
