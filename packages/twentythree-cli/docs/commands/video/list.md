`twentythree video:list`
========================

List videos in the active workspace

* [`twentythree video list`](#twentythree-video-list)

## `twentythree video list`

List videos in the active workspace

```
USAGE
  $ twentythree video list [--json] [-w <value>] [--limit <value>] [--search <value>] [--album-id <value>]
    [--user-id <value>] [--photo-id <value>] [--live-id <value>] [--tag <value>] [--tags <value>] [--tag-mode and|or]
    [--order-by uploaded|published|created|creation|taken|title|views|comments|rating|numratings|video_length|words|related|posted|rank|default-published]
    [--order asc|desc] [--before-time <value>] [--after-time <value>] [--year <value>] [--month <value>]
    [--day <value>] [--published] [--no-published] [--promoted] [--no-promoted] [--unalbummed]
    [--include-unpublished] [--include-stats] [--include-sections-count] [--include-user-group] [--fields <value>]

FLAGS
  --after-time=<value>          Filter to videos uploaded after this timestamp (ISO 8601)
  --album-id=<value>            Filter to videos in one or more categories (comma-separated IDs)
  --before-time=<value>         Filter to videos uploaded before this timestamp (ISO 8601)
  --day=<value>                 Filter to videos from a specific day (1–31, requires --year and --month)
  --fields=<value>              Comma-separated list of fields to return in the API response
  --[no-]include-unpublished    Include unpublished videos in the results
  --[no-]include-stats          Include per-video performance statistics (view count, play rate, engagement)
  --[no-]include-sections-count Include the number of chapters for each video
  --[no-]include-user-group     Include the user group assignment for each video
  --limit=<value>               Maximum number of videos to return (default: all)
  --live-id=<value>             Filter to videos associated with a specific webinar
  --month=<value>               Filter to videos from a specific month (1–12, requires --year)
  --order=<option>              Sort direction
                                <options: asc|desc>
  --order-by=<option>           Order results by this field
                                <options: uploaded|published|created|creation|taken|title|views|comments|rating|numratings|video_length|words|related|posted|rank|default-published>
  --photo-id=<value>            Limit results to a single video by its ID
  --[no-]promoted               Filter to promoted videos only
  --[no-]published              Filter by published status
  --search=<value>              Search by title, description, or tags
  --tag=<value>                 Filter to videos with a specific tag
  --tag-mode=<option>           How to combine tag filters: "and" requires all tags to match, "or" requires any
                                <options: and|or>
  --tags=<value>                Space-separated list of tags to filter by
  --unalbummed                  Filter to videos not assigned to any category
  --user-id=<value>             Filter to videos uploaded by a specific user (use "me" for the authenticated user)
  --year=<value>                Filter to videos from a specific year

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List videos in the active workspace

EXAMPLES
  $ twentythree video list

  $ twentythree video list --json

  $ twentythree video list --search "intro" --order-by views --order desc

  $ twentythree video list --album-id 42 --include-unpublished

  $ twentythree video list --user-id me --limit 10

  $ twentythree video list --after-time 2024-01-01T00:00:00Z --fields photo_id,title
```

_See code: [src/commands/video/list.ts](https://github.com/23/twentythree-cli/blob/v1.7.0/src/commands/video/list.ts)_
