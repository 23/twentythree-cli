`twentythree thumbnail`
=======================

Manage thumbnail templates — list, add, update, delete, duplicate, data, and manage files

* [`twentythree thumbnail`](#twentythree-thumbnail)
* [`twentythree thumbnail add`](#twentythree-thumbnail-add)
* [`twentythree thumbnail data ID`](#twentythree-thumbnail-data-id)
* [`twentythree thumbnail delete ID`](#twentythree-thumbnail-delete-id)
* [`twentythree thumbnail duplicate ID`](#twentythree-thumbnail-duplicate-id)
* [`twentythree thumbnail file delete`](#twentythree-thumbnail-file-delete)
* [`twentythree thumbnail file list ID`](#twentythree-thumbnail-file-list-id)
* [`twentythree thumbnail file upload FILE`](#twentythree-thumbnail-file-upload-file)
* [`twentythree thumbnail list`](#twentythree-thumbnail-list)
* [`twentythree thumbnail preview-scss ID`](#twentythree-thumbnail-preview-scss-id)
* [`twentythree thumbnail update ID`](#twentythree-thumbnail-update-id)

## `twentythree thumbnail`

Manage thumbnail templates — list, add, update, delete, duplicate, data, and manage files

```
USAGE
  $ twentythree thumbnail

DESCRIPTION
  Manage thumbnail templates — list, add, update, delete, duplicate, data, and manage files
```

_See code: [src/commands/thumbnail/index.ts](https://github.com/23/twentythree-cli/blob/v1.3.5/src/commands/thumbnail/index.ts)_

## `twentythree thumbnail add`

Create a new thumbnail template

```
USAGE
  $ twentythree thumbnail add --name <value> --liquid-template <value> [--json] [-w <value>]

FLAGS
  --liquid-template=<value>  (required) Liquid template content for the thumbnail
  --name=<value>             (required) Name for the new thumbnail template

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Create a new thumbnail template

EXAMPLES
  $ twentythree thumbnail add --name "My Template" --liquid-template "<div>{{ video.title }}</div>"

  $ twentythree thumbnail add --name "My Template" --liquid-template "<div>{{ video.title }}</div>" --json
```

_See code: [src/commands/thumbnail/add.ts](https://github.com/23/twentythree-cli/blob/v1.3.5/src/commands/thumbnail/add.ts)_

## `twentythree thumbnail data ID`

Get Liquid render data for a thumbnail template and object

```
USAGE
  $ twentythree thumbnail data ID --object-id <value> [--json] [-w <value>]

ARGUMENTS
  ID  Thumbnail template ID

FLAGS
  --object-id=<value>  (required) Object ID to get template data for

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get Liquid render data for a thumbnail template and object

EXAMPLES
  $ twentythree thumbnail data 42 --object-id 12345

  $ twentythree thumbnail data 42 --object-id 12345 --json
```

_See code: [src/commands/thumbnail/data.ts](https://github.com/23/twentythree-cli/blob/v1.3.5/src/commands/thumbnail/data.ts)_

## `twentythree thumbnail delete ID`

Delete a thumbnail template from the active workspace

```
USAGE
  $ twentythree thumbnail delete ID [--json] [-w <value>]

ARGUMENTS
  ID  Thumbnail template ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete a thumbnail template from the active workspace

EXAMPLES
  $ twentythree thumbnail delete 42

  $ twentythree thumbnail delete 42 --json
```

_See code: [src/commands/thumbnail/delete.ts](https://github.com/23/twentythree-cli/blob/v1.3.5/src/commands/thumbnail/delete.ts)_

## `twentythree thumbnail duplicate ID`

Duplicate a thumbnail template

```
USAGE
  $ twentythree thumbnail duplicate ID [--json] [-w <value>] [--name <value>]

ARGUMENTS
  ID  Thumbnail template ID

FLAGS
  --name=<value>  Name for the duplicate

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Duplicate a thumbnail template

EXAMPLES
  $ twentythree thumbnail duplicate 42

  $ twentythree thumbnail duplicate 42 --name "My Copy"

  $ twentythree thumbnail duplicate 42 --name "My Copy" --json
```

_See code: [src/commands/thumbnail/duplicate.ts](https://github.com/23/twentythree-cli/blob/v1.3.5/src/commands/thumbnail/duplicate.ts)_

## `twentythree thumbnail file delete`

Delete a file from a thumbnail template

```
USAGE
  $ twentythree thumbnail file delete --template-id <value> --filename <value> [--json] [-w <value>]

FLAGS
  --filename=<value>     (required) Filename to delete
  --template-id=<value>  (required) Thumbnail template ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete a file from a thumbnail template

EXAMPLES
  $ twentythree thumbnail file delete --template-id 42 --filename logo.png

  $ twentythree thumbnail file delete --template-id 42 --filename logo.png --json
```

_See code: [src/commands/thumbnail/file/delete.ts](https://github.com/23/twentythree-cli/blob/v1.3.5/src/commands/thumbnail/file/delete.ts)_

## `twentythree thumbnail file list ID`

List files associated with a thumbnail template

```
USAGE
  $ twentythree thumbnail file list ID [--json] [-w <value>]

ARGUMENTS
  ID  Thumbnail template ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List files associated with a thumbnail template

EXAMPLES
  $ twentythree thumbnail file list 42

  $ twentythree thumbnail file list 42 --json
```

_See code: [src/commands/thumbnail/file/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.5/src/commands/thumbnail/file/list.ts)_

## `twentythree thumbnail file upload FILE`

Upload an image file to a thumbnail template

```
USAGE
  $ twentythree thumbnail file upload FILE --template-id <value> [--json] [-w <value>]

ARGUMENTS
  FILE  Path to the image file to upload

FLAGS
  --template-id=<value>  (required) Thumbnail template ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Upload an image file to a thumbnail template

EXAMPLES
  $ twentythree thumbnail file upload ./logo.png --template-id 42

  $ twentythree thumbnail file upload ./banner.jpg --template-id 42 --json
```

_See code: [src/commands/thumbnail/file/upload.ts](https://github.com/23/twentythree-cli/blob/v1.3.5/src/commands/thumbnail/file/upload.ts)_

## `twentythree thumbnail list`

List thumbnail templates in the active workspace

```
USAGE
  $ twentythree thumbnail list [--json] [-w <value>] [--search <value>] [--object-type <value>]

FLAGS
  --object-type=<value>  Filter by object type (photo, live, liveseries)
  --search=<value>       Filter by name

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List thumbnail templates in the active workspace

EXAMPLES
  $ twentythree thumbnail list

  $ twentythree thumbnail list --search "my template"

  $ twentythree thumbnail list --object-type photo

  $ twentythree thumbnail list --json
```

_See code: [src/commands/thumbnail/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.5/src/commands/thumbnail/list.ts)_

## `twentythree thumbnail preview-scss ID`

Preview SCSS compiled to CSS for a thumbnail template

```
USAGE
  $ twentythree thumbnail preview-scss ID --scss <value> [--json] [-w <value>]

ARGUMENTS
  ID  Thumbnail template ID

FLAGS
  --scss=<value>  (required) SCSS styles to prerender into CSS

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Preview SCSS compiled to CSS for a thumbnail template

EXAMPLES
  $ twentythree thumbnail preview-scss 42 --scss ".title { font-size: 32px; }"

  $ twentythree thumbnail preview-scss 42 --scss ".title { color: red; }" --json
```

_See code: [src/commands/thumbnail/preview-scss.ts](https://github.com/23/twentythree-cli/blob/v1.3.5/src/commands/thumbnail/preview-scss.ts)_

## `twentythree thumbnail update ID`

Update a thumbnail template

```
USAGE
  $ twentythree thumbnail update ID [--json] [-w <value>] [--name <value>] [--liquid-template <value>] [--object-type
    <value>] [--width <value>] [--height <value>]

ARGUMENTS
  ID  Thumbnail template ID

FLAGS
  --height=<value>           Template height in pixels
  --liquid-template=<value>  New Liquid template content
  --name=<value>             New name for the template
  --object-type=<value>      Object type (photo, live, liveseries)
  --width=<value>            Template width in pixels

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update a thumbnail template

EXAMPLES
  $ twentythree thumbnail update 42 --name "Updated Name"

  $ twentythree thumbnail update 42 --liquid-template "<div>{{ video.title }}</div>"

  $ twentythree thumbnail update 42 --object-type photo --width 1280 --height 720

  $ twentythree thumbnail update 42 --name "Updated Name" --json
```

_See code: [src/commands/thumbnail/update.ts](https://github.com/23/twentythree-cli/blob/v1.3.5/src/commands/thumbnail/update.ts)_
