`twentythree webinar:mail`
==========================

Add an email to a webinar

* [`twentythree webinar mail add [ID]`](#twentythree-webinar-mail-add-id)
* [`twentythree webinar mail list [ID]`](#twentythree-webinar-mail-list-id)
* [`twentythree webinar mail preview ID`](#twentythree-webinar-mail-preview-id)
* [`twentythree webinar mail remove ID`](#twentythree-webinar-mail-remove-id)
* [`twentythree webinar mail send ID`](#twentythree-webinar-mail-send-id)
* [`twentythree webinar mail test ID`](#twentythree-webinar-mail-test-id)
* [`twentythree webinar mail update ID`](#twentythree-webinar-mail-update-id)

## `twentythree webinar mail add [ID]`

Add an email to a webinar

```
USAGE
  $ twentythree webinar mail add [ID] [--json] [-w <value>] [--series-id <value>] [--subject <value>] [--message
    <value>]

ARGUMENTS
  [ID]  Webinar ID (omit when using --series-id)

FLAGS
  --message=<value>    Email message body
  --series-id=<value>  Series ID — add mail to a series instead of a webinar
  --subject=<value>    Email subject

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Add an email to a webinar

EXAMPLES
  $ twentythree webinar mail add 12345 --subject "Reminder" --message "Join us tomorrow!"

  $ twentythree webinar mail add --series-id 67890 --subject "Reminder"

  $ twentythree webinar mail add 12345 --subject "Reminder" --message "Join us!" --json
```

_See code: [src/commands/webinar/mail/add.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/webinar/mail/add.ts)_

## `twentythree webinar mail list [ID]`

List emails for a webinar

```
USAGE
  $ twentythree webinar mail list [ID] [--json] [-w <value>] [--series-id <value>] [--mail-id <value>]
    [--include-metrics] [--fields <value>]

ARGUMENTS
  [ID]  Webinar ID (omit when using --series-id)

FLAGS
  --fields=<value>     Comma-separated list of fields to return in the API response
  --include-metrics    Include metrics on mail performance in the response
  --mail-id=<value>    Return a specific mail by its ID
  --series-id=<value>  Series ID — list mails for a series instead of a webinar

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List emails for a webinar

EXAMPLES
  $ twentythree webinar mail list 12345

  $ twentythree webinar mail list --series-id 67890

  $ twentythree webinar mail list 12345 --json

  $ twentythree webinar mail list 12345 --include-metrics --json
```

_See code: [src/commands/webinar/mail/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/webinar/mail/list.ts)_

## `twentythree webinar mail preview ID`

Preview a webinar email as raw HTML

```
USAGE
  $ twentythree webinar mail preview ID [--json] [-w <value>] [--webinar-id <value> | --series-id <value>]

ARGUMENTS
  ID  Mail ID

FLAGS
  --series-id=<value>   Series ID (mutually exclusive with --webinar-id)
  --webinar-id=<value>  Webinar ID (mutually exclusive with --series-id)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Preview a webinar email as raw HTML

EXAMPLES
  $ twentythree webinar mail preview 555 --webinar-id 12345

  $ twentythree webinar mail preview 555 --series-id 67890 > preview.html

  $ twentythree webinar mail preview 555 --webinar-id 12345 --json
```

_See code: [src/commands/webinar/mail/preview.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/webinar/mail/preview.ts)_

## `twentythree webinar mail remove ID`

Remove an email from a webinar

```
USAGE
  $ twentythree webinar mail remove ID [--json] [-w <value>] [--webinar-id <value> | --series-id <value>]

ARGUMENTS
  ID  Mail ID

FLAGS
  --series-id=<value>   Series ID (mutually exclusive with --webinar-id)
  --webinar-id=<value>  Webinar ID (mutually exclusive with --series-id)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Remove an email from a webinar

EXAMPLES
  $ twentythree webinar mail remove 555 --webinar-id 12345

  $ twentythree webinar mail remove 555 --series-id 67890 --json
```

_See code: [src/commands/webinar/mail/remove.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/webinar/mail/remove.ts)_

## `twentythree webinar mail send ID`

Send a webinar email

```
USAGE
  $ twentythree webinar mail send ID [--json] [-w <value>] [--webinar-id <value> | --series-id <value>]

ARGUMENTS
  ID  Mail ID

FLAGS
  --series-id=<value>   Series ID (mutually exclusive with --webinar-id)
  --webinar-id=<value>  Webinar ID (mutually exclusive with --series-id)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Send a webinar email

EXAMPLES
  $ twentythree webinar mail send 555 --webinar-id 12345

  $ twentythree webinar mail send 555 --series-id 67890 --json
```

_See code: [src/commands/webinar/mail/send.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/webinar/mail/send.ts)_

## `twentythree webinar mail test ID`

Send a test email

```
USAGE
  $ twentythree webinar mail test ID [--json] [-w <value>] [--webinar-id <value> | --series-id <value>] [--email
    <value>]

ARGUMENTS
  ID  Mail ID

FLAGS
  --email=<value>       Recipient email for test
  --series-id=<value>   Series ID (mutually exclusive with --webinar-id)
  --webinar-id=<value>  Webinar ID (mutually exclusive with --series-id)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Send a test email

EXAMPLES
  $ twentythree webinar mail test 555 --webinar-id 12345 --email me@example.com

  $ twentythree webinar mail test 555 --series-id 67890

  $ twentythree webinar mail test 555 --webinar-id 12345 --email me@example.com --json
```

_See code: [src/commands/webinar/mail/test.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/webinar/mail/test.ts)_

## `twentythree webinar mail update ID`

Update a webinar email

```
USAGE
  $ twentythree webinar mail update ID [--json] [-w <value>] [--webinar-id <value> | --series-id <value>] [--subject
    <value>] [--message <value>]

ARGUMENTS
  ID  Mail ID

FLAGS
  --message=<value>     Email message body
  --series-id=<value>   Series ID (mutually exclusive with --webinar-id)
  --subject=<value>     Email subject
  --webinar-id=<value>  Webinar ID (mutually exclusive with --series-id)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update a webinar email

EXAMPLES
  $ twentythree webinar mail update 555 --webinar-id 12345 --subject "Updated Subject"

  $ twentythree webinar mail update 555 --series-id 67890 --message "New content"

  $ twentythree webinar mail update 555 --webinar-id 12345 --subject "Updated" --json
```

_See code: [src/commands/webinar/mail/update.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/webinar/mail/update.ts)_
