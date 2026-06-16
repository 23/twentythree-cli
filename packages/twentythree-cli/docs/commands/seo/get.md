`twentythree seo:get`
=====================

Get SEO metadata for a video, webinar, or webinar series

* [`twentythree seo get`](#twentythree-seo-get)

## `twentythree seo get`

Get SEO metadata for a video, webinar, or webinar series

```
USAGE
  $ twentythree seo get --object-id <value> [--json] [-w <value>] [--fields <value>]

FLAGS
  --fields=<value>     Comma-separated fields to return
  --object-id=<value>  (required) Object ID (video, webinar, or webinar series)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get SEO metadata for a video, webinar, or webinar series

EXAMPLES
  $ twentythree seo get --object-id 12345

  $ twentythree seo get --object-id 12345 --json
```

_See code: [src/commands/seo/get.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/seo/get.ts)_
