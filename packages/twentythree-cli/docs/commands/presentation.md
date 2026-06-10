`twentythree presentation`
==========================

List available presentation page link locations

* [`twentythree presentation page link-locations`](#twentythree-presentation-page-link-locations)
* [`twentythree presentation setting list`](#twentythree-presentation-setting-list)
* [`twentythree presentation setting update`](#twentythree-presentation-setting-update)

## `twentythree presentation page link-locations`

List available presentation page link locations

```
USAGE
  $ twentythree presentation page link-locations [--json] [-w <value>]

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List available presentation page link locations

EXAMPLES
  $ twentythree presentation page link-locations

  $ twentythree presentation page link-locations --json
```

_See code: [src/commands/presentation/page/link-locations.ts](https://github.com/23/twentythree-cli/blob/v1.4.0/src/commands/presentation/page/link-locations.ts)_

## `twentythree presentation setting list`

List workspace presentation settings

```
USAGE
  $ twentythree presentation setting list [--json] [-w <value>]

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List workspace presentation settings

EXAMPLES
  $ twentythree presentation setting list

  $ twentythree presentation setting list --json
```

_See code: [src/commands/presentation/setting/list.ts](https://github.com/23/twentythree-cli/blob/v1.4.0/src/commands/presentation/setting/list.ts)_

## `twentythree presentation setting update`

Update workspace presentation settings

```
USAGE
  $ twentythree presentation setting update [--json] [-w <value>] [--set <value>...]

FLAGS
  --set=<value>...  Setting key=value pair (repeatable)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update workspace presentation settings

EXAMPLES
  $ twentythree presentation setting update --set site_name="My Site"

  $ twentythree presentation setting update --set site_name="My Site" --set logo_url="https://example.com/logo.png"

  $ twentythree presentation setting update --set site_name="My Site" --json
```

_See code: [src/commands/presentation/setting/update.ts](https://github.com/23/twentythree-cli/blob/v1.4.0/src/commands/presentation/setting/update.ts)_
