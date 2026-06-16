`twentythree site:get`
======================

Get site settings for the active workspace

* [`twentythree site get`](#twentythree-site-get)

## `twentythree site get`

Get site settings for the active workspace

```
USAGE
  $ twentythree site get [--json] [-w <value>] [--include-presentation] [--include-quota]

FLAGS
  --include-presentation  Include presentation settings in the response
  --include-quota         Include quota information in the response

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get site settings for the active workspace

EXAMPLES
  $ twentythree site get

  $ twentythree site get --include-presentation

  $ twentythree site get --include-quota --json
```

_See code: [src/commands/site/get.ts](https://github.com/23/twentythree-cli/blob/v1.6.1/src/commands/site/get.ts)_
