`twentythree webinar:attachment`
================================

Delete an attachment from a webinar

* [`twentythree webinar attachment delete ID`](#twentythree-webinar-attachment-delete-id)
* [`twentythree webinar attachment list ID`](#twentythree-webinar-attachment-list-id)
* [`twentythree webinar attachment set-hidden ID`](#twentythree-webinar-attachment-set-hidden-id)
* [`twentythree webinar attachment upload ID FILE`](#twentythree-webinar-attachment-upload-id-file)

## `twentythree webinar attachment delete ID`

Delete an attachment from a webinar

```
USAGE
  $ twentythree webinar attachment delete ID [--json] [-w <value>] [--filename <value>]

ARGUMENTS
  ID  Webinar ID

FLAGS
  --filename=<value>  Filename of the attachment to delete

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete an attachment from a webinar

EXAMPLES
  $ twentythree webinar attachment delete 12345 --filename slides.pdf

  $ twentythree webinar attachment delete 12345 --filename handout.pdf --json
```

_See code: [src/commands/webinar/attachment/delete.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/webinar/attachment/delete.ts)_

## `twentythree webinar attachment list ID`

List attachments for a webinar

```
USAGE
  $ twentythree webinar attachment list ID [--json] [-w <value>] [--token <value>] [--include-hidden]

ARGUMENTS
  ID  Webinar ID

FLAGS
  --[no-]include-hidden  Include hidden attachments
  --token=<value>        Webinar token (auto-looked up if omitted)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List attachments for a webinar

EXAMPLES
  $ twentythree webinar attachment list 12345

  $ twentythree webinar attachment list 12345 --json

  $ twentythree webinar attachment list 12345 --include-hidden
```

_See code: [src/commands/webinar/attachment/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/webinar/attachment/list.ts)_

## `twentythree webinar attachment set-hidden ID`

Show or hide a webinar attachment

```
USAGE
  $ twentythree webinar attachment set-hidden ID --hidden [--json] [-w <value>] [--filename <value>]

ARGUMENTS
  ID  Webinar ID

FLAGS
  --filename=<value>  Filename of the attachment
  --[no-]hidden       (required) Set hidden (--hidden) or visible (--no-hidden)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Show or hide a webinar attachment

EXAMPLES
  $ twentythree webinar attachment set-hidden 12345 --filename slides.pdf --hidden

  $ twentythree webinar attachment set-hidden 12345 --filename slides.pdf --no-hidden

  $ twentythree webinar attachment set-hidden 12345 --filename slides.pdf --hidden --json
```

_See code: [src/commands/webinar/attachment/set-hidden.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/webinar/attachment/set-hidden.ts)_

## `twentythree webinar attachment upload ID FILE`

Upload an attachment to a webinar

```
USAGE
  $ twentythree webinar attachment upload ID FILE [--json] [-w <value>] [--chunk-size <value>] [--concurrency <value>]
    [--hidden]

ARGUMENTS
  ID    Webinar ID
  FILE  Path to file to upload

FLAGS
  --chunk-size=<value>   [default: 5242880] Chunk size in bytes (default: 5242880)
  --concurrency=<value>  [default: 5] Number of chunks to upload in parallel (default: 5)
  --[no-]hidden          Upload attachment as hidden

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Upload an attachment to a webinar

EXAMPLES
  $ twentythree webinar attachment upload 12345 ./slides.pdf

  $ twentythree webinar attachment upload 12345 ./handout.pdf --hidden
```

_See code: [src/commands/webinar/attachment/upload.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/webinar/attachment/upload.ts)_
