`twentythree audience:field`
============================

List custom audience fields

* [`twentythree audience field list`](#twentythree-audience-field-list)
* [`twentythree audience field remove`](#twentythree-audience-field-remove)
* [`twentythree audience field set`](#twentythree-audience-field-set)
* [`twentythree audience field types`](#twentythree-audience-field-types)

## `twentythree audience field list`

List custom audience fields

```
USAGE
  $ twentythree audience field list [--json] [-w <value>] [--include-widget-html]

FLAGS
  --include-widget-html  Include HTML widget for each field

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List custom audience fields

EXAMPLES
  $ twentythree audience field list

  $ twentythree audience field list --include-widget-html

  $ twentythree audience field list --json
```

_See code: [src/commands/audience/field/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/audience/field/list.ts)_

## `twentythree audience field remove`

Remove a custom audience field

```
USAGE
  $ twentythree audience field remove --key <value> [--json] [-w <value>]

FLAGS
  --key=<value>  (required) Field key to remove

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Remove a custom audience field

EXAMPLES
  $ twentythree audience field remove --key "department"

  $ twentythree audience field remove --key "old-field" --json
```

_See code: [src/commands/audience/field/remove.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/audience/field/remove.ts)_

## `twentythree audience field set`

Create or update a custom audience field

```
USAGE
  $ twentythree audience field set --key <value> --type <value> --label <value> [--json] [-w <value>] [--options
    <value>] [--priority <value>]

FLAGS
  --key=<value>       (required) Unique field key
  --label=<value>     (required) Human-readable label
  --options=<value>   Semicolon-separated options (for enumerable types)
  --priority=<value>  Display order priority
  --type=<value>      (required) Field type (use audience field types to list valid values)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Create or update a custom audience field

EXAMPLES
  $ twentythree audience field set --key "department" --type text --label "Department"

  $ twentythree audience field set --key "tier" --type enum --label "Customer Tier" --options "free;pro;enterprise"

  $ twentythree audience field set --key "score" --type number --label "NPS Score" --priority 1 --json
```

_See code: [src/commands/audience/field/set.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/audience/field/set.ts)_

## `twentythree audience field types`

List valid audience field types

```
USAGE
  $ twentythree audience field types [--json] [-w <value>]

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List valid audience field types

EXAMPLES
  $ twentythree audience field types

  $ twentythree audience field types --json
```

_See code: [src/commands/audience/field/types.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/audience/field/types.ts)_
