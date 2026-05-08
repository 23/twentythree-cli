`twentythree player:embed`
==========================

Generate embed code for a video, webinar, or category

* [`twentythree player embed`](#twentythree-player-embed)

## `twentythree player embed`

Generate embed code for a video, webinar, or category

```
USAGE
  $ twentythree player embed [--json] [-w <value>] [--video-id <value>] [--webinar-id <value>] [--category-id
    <value>] [--player-id <value>] [--url <value>] [--width <value>] [--height <value>] [--responsive] [--autoplay]
    [--iframe] [--start <value>] [--include-unpublished] [--token <value>] [--source <value>]

FLAGS
  --[no-]autoplay             Enable auto-play in the embed code (maps to autoplay_p)
  --category-id=<value>       Category ID to embed (maps to album_id)
  --height=<value>            Desired embed height in pixels
  --[no-]iframe               Return an iframe-based embed code (maps to iframe_p)
  --[no-]include-unpublished  Include unpublished content in player parameters (maps to include_unpublished_p)
  --player-id=<value>         Player ID to use (default: workspace default)
  --[no-]responsive           Return a responsive embed code (maps to responsive_p)
  --source=<value>            Analytics source tag
  --start=<value>             Start position in seconds
  --token=<value>             Video token for private or token-protected videos
  --url=<value>               Workspace URL to resolve to an embed code
  --video-id=<value>          Video ID to embed (maps to photo_id)
  --webinar-id=<value>        Webinar ID to embed (maps to live_id)
  --width=<value>             Desired embed width in pixels

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Generate embed code for a video, webinar, or category

EXAMPLES
  $ twentythree player embed --video-id 123

  $ twentythree player embed --video-id 123 --responsive > embed.html

  $ twentythree player embed --webinar-id 456 --iframe

  $ twentythree player embed --video-id 123 --json
```

_See code: [src/commands/player/embed.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/player/embed.ts)_
