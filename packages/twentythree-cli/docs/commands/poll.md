`twentythree poll`
==================

Create a new poll for a webinar

* [`twentythree poll add`](#twentythree-poll-add)
* [`twentythree poll answer ID`](#twentythree-poll-answer-id)
* [`twentythree poll list`](#twentythree-poll-list)
* [`twentythree poll remove ID`](#twentythree-poll-remove-id)
* [`twentythree poll set-options ID`](#twentythree-poll-set-options-id)
* [`twentythree poll update ID`](#twentythree-poll-update-id)

## `twentythree poll add`

Create a new poll for a webinar

```
USAGE
  $ twentythree poll add --object-id <value> [--json] [-w <value>] [--question <value>]

FLAGS
  --object-id=<value>  (required) Object ID (webinar or live object)
  --question=<value>   Poll question

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Create a new poll for a webinar

EXAMPLES
  $ twentythree poll add --object-id 12345 --question "What is your preference?"

  $ twentythree poll add --object-id 12345 --question "How are you?" --json
```

_See code: [src/commands/poll/add.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/poll/add.ts)_

## `twentythree poll answer ID`

Submit a poll answer

```
USAGE
  $ twentythree poll answer ID [--json] [-w <value>] [--object-id <value>] [--object-token <value>] [--option-id
    <value>]

ARGUMENTS
  ID  Poll ID

FLAGS
  --object-id=<value>     Object ID (webinar or live object)
  --object-token=<value>  Object token (auto-looked up if omitted)
  --option-id=<value>     Poll option ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Submit a poll answer

EXAMPLES
  $ twentythree poll answer 99 --object-id 12345 --option-id 3

  $ twentythree poll answer 99 --object-id 12345 --option-id 3 --json
```

_See code: [src/commands/poll/answer.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/poll/answer.ts)_

## `twentythree poll list`

List polls for a webinar

```
USAGE
  $ twentythree poll list --object-id <value> [--json] [-w <value>] [--object-token <value>]

FLAGS
  --object-id=<value>     (required) Object ID (webinar or live object)
  --object-token=<value>  Object token (auto-looked up if omitted)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List polls for a webinar

EXAMPLES
  $ twentythree poll list --object-id 12345

  $ twentythree poll list --object-id 12345 --json
```

_See code: [src/commands/poll/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/poll/list.ts)_

## `twentythree poll remove ID`

Remove a poll

```
USAGE
  $ twentythree poll remove ID [--json] [-w <value>]

ARGUMENTS
  ID  Poll ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Remove a poll

EXAMPLES
  $ twentythree poll remove 99

  $ twentythree poll remove 99 --json
```

_See code: [src/commands/poll/remove.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/poll/remove.ts)_

## `twentythree poll set-options ID`

Set options for a poll

```
USAGE
  $ twentythree poll set-options ID [--json] [-w <value>] [--option <value>...]

ARGUMENTS
  ID  Poll ID

FLAGS
  --option=<value>...  Poll option (repeat for multiple)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Set options for a poll

EXAMPLES
  $ twentythree poll set-options 99 --option "Yes" --option "No" --option "Maybe"

  $ twentythree poll set-options 99 --option "Option A" --option "Option B" --json
```

_See code: [src/commands/poll/set-options.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/poll/set-options.ts)_

## `twentythree poll update ID`

Update a poll

```
USAGE
  $ twentythree poll update ID [--json] [-w <value>] [--question <value>] [--open] [--display-results]

ARGUMENTS
  ID  Poll ID

FLAGS
  --[no-]display-results  Show or hide results
  --[no-]open             Open or close the poll
  --question=<value>      Poll question

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update a poll

EXAMPLES
  $ twentythree poll update 99 --question "Updated question?"

  $ twentythree poll update 99 --open

  $ twentythree poll update 99 --no-display-results

  $ twentythree poll update 99 --question "New?" --open --json
```

_See code: [src/commands/poll/update.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/poll/update.ts)_
