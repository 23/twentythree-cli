`twentythree audience:register`
===============================

Register an audience contact

* [`twentythree audience register`](#twentythree-audience-register)

## `twentythree audience register`

Register an audience contact

```
USAGE
  $ twentythree audience register --email <value> [--json] [-w <value>] [--object-id <value>] [--uuid <value>]
    [--action-id <value>] [--firstname <value>] [--lastname <value>] [--company <value>] [--phone <value>] [--return-url
    <value>] [--source <value>]

FLAGS
  --action-id=<value>   Collector action ID
  --company=<value>     Company name
  --email=<value>       (required) Contact email address
  --firstname=<value>   First name
  --lastname=<value>    Last name
  --object-id=<value>   Webinar/video ID to register for
  --phone=<value>       Phone number
  --return-url=<value>  Base URL for tracking URL
  --source=<value>      Registration source (api, import, site, custom)
  --uuid=<value>        Existing contact UUID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Register an audience contact

EXAMPLES
  $ twentythree audience register --email "jane@example.com"

  $ twentythree audience register --email "john@acme.com" --object-id 123 --firstname "John" --lastname "Doe"

  $ twentythree audience register --email "user@co.com" --company "Acme Corp" --source api --json
```

_See code: [src/commands/audience/register.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/audience/register.ts)_
