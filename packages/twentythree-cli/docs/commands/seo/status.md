`twentythree seo:status`
========================

Get SEO readiness status for a video, webinar, or webinar series

* [`twentythree seo status`](#twentythree-seo-status)

## `twentythree seo status`

Get SEO readiness status for a video, webinar, or webinar series

```
USAGE
  $ twentythree seo status --object-id <value> [--json] [-w <value>] [--fields <value>]

FLAGS
  --fields=<value>     Comma-separated fields to return
  --object-id=<value>  (required) Object ID (video, webinar, or webinar series)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get SEO readiness status for a video, webinar, or webinar series

EXAMPLES
  $ twentythree seo status --object-id 12345

  $ twentythree seo status --object-id 12345 --json
```

_See code: [src/commands/seo/status.ts](https://github.com/23/twentythree-cli/blob/v1.6.1/src/commands/seo/status.ts)_
