`twentythree protection`
========================

Apply protection to content

* [`twentythree protection protect`](#twentythree-protection-protect)
* [`twentythree protection unprotect`](#twentythree-protection-unprotect)
* [`twentythree protection verify`](#twentythree-protection-verify)

## `twentythree protection protect`

Apply protection to content

```
USAGE
  $ twentythree protection protect --protection-method <value> [--json] [-w <value>] [--object-id <value>]
    [--grace-minutes <value>]

FLAGS
  --grace-minutes=<value>      Grace period in minutes before protection activates
  --object-id=<value>          Object ID to protect
  --protection-method=<value>  (required) Protection method (e.g. password, sso, token)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Apply protection to content

EXAMPLES
  $ twentythree protection protect --protection-method password

  $ twentythree protection protect --protection-method sso --object-id 12345

  $ twentythree protection protect --protection-method token --grace-minutes 30 --json
```

_See code: [src/commands/protection/protect.ts](https://github.com/23/twentythree-cli/blob/v0.1.0/src/commands/protection/protect.ts)_

## `twentythree protection unprotect`

Remove protection from content

```
USAGE
  $ twentythree protection unprotect [--json] [-w <value>] [--object-id <value>]

FLAGS
  --object-id=<value>  Object ID to remove protection from

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Remove protection from content

EXAMPLES
  $ twentythree protection unprotect

  $ twentythree protection unprotect --object-id 12345

  $ twentythree protection unprotect --object-id 12345 --json
```

_See code: [src/commands/protection/unprotect.ts](https://github.com/23/twentythree-cli/blob/v0.1.0/src/commands/protection/unprotect.ts)_

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

_See code: [src/commands/protection/verify.ts](https://github.com/23/twentythree-cli/blob/v0.1.0/src/commands/protection/verify.ts)_
