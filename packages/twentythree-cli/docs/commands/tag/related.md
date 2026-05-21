`twentythree tag:related`
=========================

List tags related to a given tag

* [`twentythree tag related TAG`](#twentythree-tag-related-tag)

## `twentythree tag related TAG`

List tags related to a given tag

```
USAGE
  $ twentythree tag related TAG [--json] [-w <value>]

ARGUMENTS
  TAG  Tag to find related tags for

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List tags related to a given tag

EXAMPLES
  $ twentythree tag related marketing

  $ twentythree tag related marketing --json
```

_See code: [src/commands/tag/related.ts](https://github.com/23/twentythree-cli/blob/v1.3.5/src/commands/tag/related.ts)_
