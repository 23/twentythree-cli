`twentythree setting`
=====================

Update workspace settings (key=value pairs)

* [`twentythree setting update`](#twentythree-setting-update)

## `twentythree setting update`

Update workspace settings (key=value pairs)

```
USAGE
  $ twentythree setting update [--json] [-w <value>] [--set <value>...] [--validate-only]

FLAGS
  --set=<value>...  Setting key=value pair (repeatable)
  --validate-only   Dry-run: validate settings without applying changes

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update workspace settings (key=value pairs)

EXAMPLES
  $ twentythree setting update --set site_name="My Site"

  $ twentythree setting update --set theme=dark --set language=en

  $ twentythree setting update --set site_name="Test" --validate-only

  $ twentythree setting update --set timezone=UTC --json
```

_See code: [src/commands/setting/update.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/setting/update.ts)_
