`twentythree thumbnail:preview-scss`
====================================

Preview SCSS compiled to CSS for a thumbnail template

* [`twentythree thumbnail preview-scss ID`](#twentythree-thumbnail-preview-scss-id)

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

_See code: [src/commands/thumbnail/preview-scss.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/thumbnail/preview-scss.ts)_
