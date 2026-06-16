`twentythree seo:update`
========================

Update SEO metadata for a video, webinar, or webinar series

* [`twentythree seo update`](#twentythree-seo-update)

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

_See code: [src/commands/seo/update.ts](https://github.com/23/twentythree-cli/blob/v1.6.1/src/commands/seo/update.ts)_
