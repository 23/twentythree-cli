`twentythree seo`
=================

Get SEO metadata for a video, webinar, or webinar series

* [`twentythree seo get`](#twentythree-seo-get)
* [`twentythree seo status`](#twentythree-seo-status)
* [`twentythree seo update`](#twentythree-seo-update)

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

_See code: [src/commands/seo/get.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/seo/get.ts)_

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

_See code: [src/commands/seo/status.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/seo/status.ts)_

## `twentythree seo update`

Update SEO metadata for a video, webinar, or webinar series

```
USAGE
  $ twentythree seo update --object-id <value> [--json] [-w <value>] [--seo-name <value>] [--seo-description
    <value>] [--seo-keywords <value>] [--canonical-url <value>] [--seo-policy |index|noindex] [--enrich-immediately]
    [--fields <value>]

FLAGS
  --canonical-url=<value>    Canonical URL for the object
  --enrich-immediately       Enrich SEO metadata immediately
  --fields=<value>           Comma-separated fields to return
  --object-id=<value>        (required) Object ID (video, webinar, or webinar series)
  --seo-description=<value>  SEO description for the object
  --seo-keywords=<value>     SEO keywords for the object
  --seo-name=<value>         SEO title for the object
  --seo-policy=<option>      SEO indexing policy ("", "index", or "noindex")
                             <options: |index|noindex>

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update SEO metadata for a video, webinar, or webinar series

EXAMPLES
  $ twentythree seo update --object-id 12345 --seo-name "My Video"

  $ twentythree seo update --object-id 12345 --seo-policy index --json
```

_See code: [src/commands/seo/update.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/seo/update.ts)_
