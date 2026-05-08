`twentythree video:update`
==========================

Update metadata for a video

* [`twentythree video update ID`](#twentythree-video-update-id)

## `twentythree video update ID`

Update metadata for a video

```
USAGE
  $ twentythree video update ID [--360] [--json] [-w <value>] [--title <value>] [--description <value>] [--tags
    <value>] [--category-id <value>] [--publish] [--promote] [--publish-date <value>] [--seo-policy |index|noindex]

ARGUMENTS
  ID  Video ID

FLAGS
  --[no-]360              Mark as 360° video
  --category-id=<value>   Category ID (or comma-separated IDs) to assign the video to
  --description=<value>   New description for the video
  --[no-]promote          Promote or demote the video
  --[no-]publish          Publish or unpublish the video
  --publish-date=<value>  Scheduled publish date/time (ISO 8601)
  --seo-policy=<option>   SEO policy for the video: index, noindex, or empty string to reset
                          <options: |index|noindex>
  --tags=<value>          Space-separated tags (replaces existing tags)
  --title=<value>         New title for the video

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update metadata for a video

EXAMPLES
  $ twentythree video update 12345 --title "New Title"

  $ twentythree video update 12345 --publish

  $ twentythree video update 12345
```

_See code: [src/commands/video/update.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/video/update.ts)_
