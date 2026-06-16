`twentythree tag:list`
======================

List tags in the active workspace

* [`twentythree tag list`](#twentythree-tag-list)

## `twentythree tag list`

List tags in the active workspace

```
USAGE
  $ twentythree tag list [--json] [-w <value>] [--search <value>] [--exclude-machine-tags]
    [--only-machine-tags] [--only-published] [--orderby tag|count] [--order asc|desc]

FLAGS
  --exclude-machine-tags  Exclude machine tags from the results
  --only-machine-tags     Return only machine tags (overrides --exclude-machine-tags)
  --only-published        Return only tags from published videos
  --order=<option>        Sort order for the results
                          <options: asc|desc>
  --orderby=<option>      Order tags by this value
                          <options: tag|count>
  --search=<value>        Filter tags by a search string

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List tags in the active workspace

EXAMPLES
  $ twentythree tag list

  $ twentythree tag list --search marketing

  $ twentythree tag list --orderby count --order desc

  $ twentythree tag list --json
```

_See code: [src/commands/tag/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.1/src/commands/tag/list.ts)_
