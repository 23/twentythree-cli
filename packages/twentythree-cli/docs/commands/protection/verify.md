`twentythree protection:verify`
===============================

Verify access to protected content

* [`twentythree protection verify`](#twentythree-protection-verify)

## `twentythree protection verify`

Verify access to protected content

```
USAGE
  $ twentythree protection verify --protection-method <value> [--json] [-w <value>] [--video-id <value>] [--webinar-id
    <value>] [--object-id <value>] [--verification-data <value>]

FLAGS
  --object-id=<value>          Object ID to verify access for
  --protection-method=<value>  (required) Protection method to verify against
  --verification-data=<value>  Verification data (e.g. password, token)
  --video-id=<value>           Video ID to verify access for (maps to photo_id in API)
  --webinar-id=<value>         Webinar ID to verify access for (maps to live_id in API)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Verify access to protected content

EXAMPLES
  $ twentythree protection verify --protection-method password

  $ twentythree protection verify --protection-method sso --video-id 12345

  $ twentythree protection verify --protection-method token --verification-data mytoken --json
```

_See code: [src/commands/protection/verify.ts](https://github.com/23/twentythree-cli/blob/v1.7.0/src/commands/protection/verify.ts)_
