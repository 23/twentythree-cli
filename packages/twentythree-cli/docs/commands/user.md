`twentythree user`
==================

Create a new user

* [`twentythree user create`](#twentythree-user-create)
* [`twentythree user get ID`](#twentythree-user-get-id)
* [`twentythree user get-login-token ID`](#twentythree-user-get-login-token-id)
* [`twentythree user list`](#twentythree-user-list)
* [`twentythree user redeem-login-token`](#twentythree-user-redeem-login-token)
* [`twentythree user send-invitation ID`](#twentythree-user-send-invitation-id)
* [`twentythree user tokens`](#twentythree-user-tokens)
* [`twentythree user update ID`](#twentythree-user-update-id)

## `twentythree user create`

Create a new user

```
USAGE
  $ twentythree user create --email <value> [--json] [-w <value>] [--username <value>] [--full-name <value>]
    [--site-admin] [--user-type <value>]

FLAGS
  --email=<value>      (required) Email address for the new user
  --full-name=<value>  Full display name for the new user
  --[no-]site-admin    Grant site admin privileges
  --user-type=<value>  User type (e.g. standard, administrator)
  --username=<value>   Username for the new user

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Create a new user

EXAMPLES
  $ twentythree user create --email alice@example.com

  $ twentythree user create --email alice@example.com --full-name "Alice Smith"

  $ twentythree user create --email alice@example.com --site-admin

  $ twentythree user create --email alice@example.com --json
```

_See code: [src/commands/user/create.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/user/create.ts)_

## `twentythree user get ID`

Get details of a specific user

```
USAGE
  $ twentythree user get ID [--json] [-w <value>] [--include-invitation]

ARGUMENTS
  ID  User ID

FLAGS
  --[no-]include-invitation  Include invitation details in the response

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get details of a specific user

EXAMPLES
  $ twentythree user get 12345

  $ twentythree user get 12345 --include-invitation

  $ twentythree user get 12345 --json
```

_See code: [src/commands/user/get.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/user/get.ts)_

## `twentythree user get-login-token ID`

Generate a login token for a user

```
USAGE
  $ twentythree user get-login-token ID [--json] [-w <value>] [--return-url <value>]

ARGUMENTS
  ID  User ID

FLAGS
  --return-url=<value>  URL to redirect to after login

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Generate a login token for a user

EXAMPLES
  $ twentythree user get-login-token 12345

  $ twentythree user get-login-token 12345 --return-url https://example.com/dashboard

  $ twentythree user get-login-token 12345 --json
```

_See code: [src/commands/user/get-login-token.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/user/get-login-token.ts)_

## `twentythree user list`

List users in the workspace

```
USAGE
  $ twentythree user list [--json] [-w <value>] [--page <value>] [--size <value>] [--search <value>] [--user-id
    <value>]

FLAGS
  --page=<value>     Page number
  --search=<value>   Search query (username, display name, or email)
  --size=<value>     Number of results per page
  --user-id=<value>  Filter by user ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List users in the workspace

EXAMPLES
  $ twentythree user list

  $ twentythree user list --search "alice"

  $ twentythree user list --page 2 --size 20

  $ twentythree user list --json
```

_See code: [src/commands/user/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/user/list.ts)_

## `twentythree user redeem-login-token`

Redeem a login token to authenticate a user

```
USAGE
  $ twentythree user redeem-login-token --login-token <value> [--json] [-w <value>]

FLAGS
  --login-token=<value>  (required) Login token to redeem

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Redeem a login token to authenticate a user

EXAMPLES
  $ twentythree user redeem-login-token --login-token abc123

  $ twentythree user redeem-login-token --login-token abc123 --json
```

_See code: [src/commands/user/redeem-login-token.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/user/redeem-login-token.ts)_

## `twentythree user send-invitation ID`

Send an invitation email to a user

```
USAGE
  $ twentythree user send-invitation ID [--json] [-w <value>] [--invitation-message <value>]

ARGUMENTS
  ID  User ID

FLAGS
  --invitation-message=<value>  Custom invitation message

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Send an invitation email to a user

EXAMPLES
  $ twentythree user send-invitation 12345

  $ twentythree user send-invitation 12345 --invitation-message "Welcome to the platform!"

  $ twentythree user send-invitation 12345 --json
```

_See code: [src/commands/user/send-invitation.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/user/send-invitation.ts)_

## `twentythree user tokens`

Retrieve cross-site tokens for the authenticated user

```
USAGE
  $ twentythree user tokens [--json] [-w <value>] [--cross-sites]

FLAGS
  --[no-]cross-sites  Include cross-site tokens

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Retrieve cross-site tokens for the authenticated user

EXAMPLES
  $ twentythree user tokens

  $ twentythree user tokens --no-cross-sites

  $ twentythree user tokens --json
```

_See code: [src/commands/user/tokens.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/user/tokens.ts)_

## `twentythree user update ID`

Update a user profile

```
USAGE
  $ twentythree user update ID [--json] [-w <value>] [--email <value>] [--full-name <value>] [--password <value>]
    [--profile-image <value>]

ARGUMENTS
  ID  User ID

FLAGS
  --email=<value>          New email address
  --full-name=<value>      New full display name
  --password=<value>       New password (WARNING: visible in process list and shell history — prefer interactive prompt
                           for sensitive environments)
  --profile-image=<value>  Path to profile image file

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update a user profile

EXAMPLES
  $ twentythree user update 12345 --full-name "Alice Smith"

  $ twentythree user update 12345 --email alice@example.com

  $ twentythree user update 12345 --profile-image ./avatar.jpg

  $ twentythree user update 12345 --json
```

_See code: [src/commands/user/update.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/user/update.ts)_
