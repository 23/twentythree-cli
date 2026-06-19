`twentythree category:list`
===========================

List categories in the active workspace

* [`twentythree category list`](#twentythree-category-list)

## `twentythree category list`

List categories in the active workspace

```
USAGE
  $ twentythree category list [--json] [-w <value>] [--include-hidden] [--search <value>] [--album-id <value>]
    [--photo-id <value>] [--user-id <value>] [--orderby sortkey|title|editing_date|creation_date|live_create]
    [--order asc|desc] [--fields <value>]

FLAGS
  --album-id=<value>    Return information for a specific category by its ID
  --fields=<value>      Comma-separated list of fields to return in the API response
  --[no-]include-hidden Include hidden categories in the results
  --order=<option>      Sort direction
                        <options: asc|desc>
  --orderby=<option>    Field to order results by
                        <options: sortkey|title|editing_date|creation_date|live_create>
  --photo-id=<value>    Filter to categories that contain a specific video
  --search=<value>      Search categories by title or keyword
  --user-id=<value>     Filter by the ID of the user that created the category

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List categories in the active workspace

EXAMPLES
  $ twentythree category list

  $ twentythree category list --json

  $ twentythree category list --include-hidden

  $ twentythree category list --search "webinar" --orderby title --order asc

  $ twentythree category list --user-id 42 --json

  $ twentythree category list --photo-id 12345 --json
```

_See code: [src/commands/category/list.ts](https://github.com/23/twentythree-cli/blob/v1.7.0/src/commands/category/list.ts)_
