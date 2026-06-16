`twentythree seo:metrics`
=========================

Get workspace-wide SEO and GEO metrics

* [`twentythree seo metrics`](#twentythree-seo-metrics)

## `twentythree seo metrics`

Get workspace-wide SEO and GEO metrics

```
USAGE
  $ twentythree seo metrics [--json] [-w <value>] [--fields <value>]

FLAGS
  --fields=<value>  Comma-separated fields to return

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get workspace-wide SEO and GEO metrics

  Returns the average score across all objects, counts of videos, webinars, and pages, and a
  breakdown of the library's SEO health into high, medium, and low tiers.

EXAMPLES
  $ twentythree seo metrics

  $ twentythree seo metrics --json
```

_See code: [src/commands/seo/metrics.ts](https://github.com/23/twentythree-cli/blob/v1.4.0/src/commands/seo/metrics.ts)_
