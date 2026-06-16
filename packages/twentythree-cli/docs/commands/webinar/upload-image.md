`twentythree webinar:upload-image`
==================================

Upload an image for a webinar (thumbnail, preview, or before-webinar)

* [`twentythree webinar upload-image ID FILE`](#twentythree-webinar-upload-image-id-file)

## `twentythree webinar upload-image ID FILE`

Upload an image for a webinar (thumbnail, preview, or before-webinar)

```
USAGE
  $ twentythree webinar upload-image ID FILE [--json] [-w <value>] [--type thumbnail|preview|before_webinar] [--chunk-size
    <value>] [--concurrency <value>]

ARGUMENTS
  ID    Webinar ID
  FILE  Path to the image file to upload

FLAGS
  --chunk-size=<value>   [default: 5242880] Chunk size in bytes (default: 5242880)
  --concurrency=<value>  [default: 5] Number of chunks to upload in parallel (default: 5)
  --type=<option>        [default: thumbnail] Image type
                         <options: thumbnail|preview|before_webinar>

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Upload an image for a webinar (thumbnail, preview, or before-webinar)

EXAMPLES
  $ twentythree webinar upload-image 12345 ./thumb.jpg

  $ twentythree webinar upload-image 12345 ./preview.png --type preview

  $ twentythree webinar upload-image 12345 ./before.jpg --type before_webinar
```

_See code: [src/commands/webinar/upload-image.ts](https://github.com/23/twentythree-cli/blob/v1.6.0/src/commands/webinar/upload-image.ts)_
