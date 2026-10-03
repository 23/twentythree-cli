`twentythree video:upload-url`
==============================

Create a video by downloading the file from a URL

* [`twentythree video upload-url URL`](#twentythree-video-upload-url-url)

## `twentythree video upload-url URL`

Create a video by downloading the file from a URL

```
USAGE
  $ twentythree video upload-url URL [--json] [-w <value>] [--title <value>] [--description <value>] [--content-format
    text/enhanced|text/plain|text/html] [--tags <value>] [--category-id <value>] [--publish] [--publish-date <value>]
    [--user-id <value>] [--fields <value>]

ARGUMENTS
  URL  URL of the video file to download

FLAGS
  --category-id=<value>      Category ID to place the video in
  --content-format=<option>  Format of the description
                             <options: text/enhanced|text/plain|text/html>
  --description=<value>      Description of the video
  --fields=<value>           Comma-separated list of fields to return in the API response
  --[no-]publish             Publish the video once it lands (API default). Use --no-publish to keep it unpublished
  --publish-date=<value>     Publish date (past or future), e.g. "2026-11-01 09:00:00"
  --tags=<value>             Comma-separated tags for the video
  --title=<value>            Title for the video
  --user-id=<value>          Upload on behalf of this user ID (super users only; otherwise ignored)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Create a video by downloading the file from a URL

EXAMPLES
  $ twentythree video upload-url https://example.com/keynote.mp4 --title "Keynote"

  $ twentythree video upload-url https://example.com/keynote.mp4 --no-publish --category-id 1234 --json

  $ twentythree video upload-url https://example.com/keynote.mp4 --publish-date "2026-11-01 09:00:00"
```

_See code: [src/commands/video/upload-url.ts](https://github.com/23/twentythree-cli/blob/v1.7.0/src/commands/video/upload-url.ts)_
