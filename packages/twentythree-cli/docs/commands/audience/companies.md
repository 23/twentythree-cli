`twentythree audience:companies`
================================

List audience companies

* [`twentythree audience companies`](#twentythree-audience-companies)

## `twentythree audience companies`

List audience companies

```
USAGE
  $ twentythree audience companies [--json] [-w <value>] [--page <value>] [--size <value>] [--offset <value>] [--orderby
    <value>] [--order <value>] [--identified] [--domains <value>]

FLAGS
  --domains=<value>  Filter by company domains (space-separated)
  --[no-]identified  Filter to identified companies only
  --offset=<value>   Offset for pagination
  --order=<value>    Sort direction (asc/desc)
  --orderby=<value>  Order by field
  --page=<value>     Page number
  --size=<value>     Page size

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List audience companies

EXAMPLES
  $ twentythree audience companies

  $ twentythree audience companies --identified --size 50

  $ twentythree audience companies --domains "acme.com" --json
```

_See code: [src/commands/audience/companies.ts](https://github.com/23/twentythree-cli/blob/v1.6.0/src/commands/audience/companies.ts)_
