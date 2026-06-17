`twentythree comment`
=====================

Add a comment to an object

* [`twentythree comment add`](#twentythree-comment-add)
* [`twentythree comment clone [ID]`](#twentythree-comment-clone-id)
* [`twentythree comment delete ID`](#twentythree-comment-delete-id)
* [`twentythree comment list`](#twentythree-comment-list)
* [`twentythree comment promote ID`](#twentythree-comment-promote-id)
* [`twentythree comment reaction add ID`](#twentythree-comment-reaction-add-id)
* [`twentythree comment reaction list`](#twentythree-comment-reaction-list)
* [`twentythree comment reaction remove ID`](#twentythree-comment-reaction-remove-id)
* [`twentythree comment set-order`](#twentythree-comment-set-order)
* [`twentythree comment update ID`](#twentythree-comment-update-id)

## `twentythree comment add`

Add a comment to an object

```
USAGE
  $ twentythree comment add --object-id <value> --object-type <value> [--json] [-w <value>] [--content <value>]
    [--name <value>] [--email <value>] [--url <value>] [--comment-type <value>] [--reply-to <value>] [--comment-time
    <value>] [--object-token <value>]

FLAGS
  --comment-time=<value>  Timestamp for the comment
  --comment-type=<value>  Comment type (comment, question, chat)
  --content=<value>       Comment text content
  --email=<value>         Author email for the comment
  --name=<value>          Author name for the comment
  --object-id=<value>     (required) Object ID to comment on
  --object-token=<value>  Object token for the target object
  --object-type=<value>   (required) Object type (photo, album, live)
  --reply-to=<value>      Comment ID to reply to
  --url=<value>           URL associated with the comment

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Add a comment to an object

EXAMPLES
  $ twentythree comment add --object-id 123 --object-type photo --content "Great video!"

  $ twentythree comment add --object-id 456 --object-type live --content "Question?" --comment-type question
```

_See code: [src/commands/comment/add.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/comment/add.ts)_

## `twentythree comment clone [ID]`

Clone an existing comment

```
USAGE
  $ twentythree comment clone [ID] [--json] [-w <value>] [--clone-type <value>]

ARGUMENTS
  [ID]  Comment ID to clone

FLAGS
  --clone-type=<value>  Type for the cloned comment (chat, question, comment)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Clone an existing comment

EXAMPLES
  $ twentythree comment clone 789

  $ twentythree comment clone 789 --clone-type question
```

_See code: [src/commands/comment/clone.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/comment/clone.ts)_

## `twentythree comment delete ID`

Delete a comment

```
USAGE
  $ twentythree comment delete ID [--json] [-w <value>]

ARGUMENTS
  ID  Comment ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete a comment

EXAMPLES
  $ twentythree comment delete 789

  $ twentythree comment delete 789 --json
```

_See code: [src/commands/comment/delete.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/comment/delete.ts)_

## `twentythree comment list`

List comments in the active workspace

```
USAGE
  $ twentythree comment list [--json] [-w <value>] [--object-id <value>] [--object-type <value>] [--comment-type
    <value>] [--search <value>] [--order <value>] [--include-reactions] [--include-replies] [--promoted]

FLAGS
  --comment-type=<value>  Filter by comment type (comment, question, chat)
  --include-reactions     Include reactions on each comment
  --include-replies       Include reply-to comments
  --object-id=<value>     Filter by object ID
  --object-type=<value>   Filter by object type (photo, album)
  --order=<value>         Sort order for results
  --promoted              Filter to promoted comments only
  --search=<value>        Search comments by content

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List comments in the active workspace

EXAMPLES
  $ twentythree comment list

  $ twentythree comment list --object-id 123 --object-type photo

  $ twentythree comment list --json
```

_See code: [src/commands/comment/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/comment/list.ts)_

## `twentythree comment promote ID`

Promote or toggle promoted status of a comment

```
USAGE
  $ twentythree comment promote ID [--json] [-w <value>] [--promoted]

ARGUMENTS
  ID  Comment ID

FLAGS
  --[no-]promoted  Set promoted status (omit to toggle)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Promote or toggle promoted status of a comment

EXAMPLES
  $ twentythree comment promote 789

  $ twentythree comment promote 789 --promoted

  $ twentythree comment promote 789 --no-promoted
```

_See code: [src/commands/comment/promote.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/comment/promote.ts)_

## `twentythree comment reaction add ID`

Add a reaction to a comment

```
USAGE
  $ twentythree comment reaction add ID --reaction <value> --object-id <value> --object-token <value> [--json] [-w
    <value>] [--object-type <value>] [--uuid <value>]

ARGUMENTS
  ID  Comment ID

FLAGS
  --object-id=<value>     (required) Object ID the comment belongs to
  --object-token=<value>  (required) Object token for the target object
  --object-type=<value>   Object type (live, photo, album)
  --reaction=<value>      (required) Reaction emoji to add
  --uuid=<value>          UUID identifier

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Add a reaction to a comment

EXAMPLES
  $ twentythree comment reaction add 789 --object-id 123 --object-token abc --reaction "👍"

  $ twentythree comment reaction add 789 --object-id 123 --object-token abc --reaction "❤️" --object-type photo
```

_See code: [src/commands/comment/reaction/add.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/comment/reaction/add.ts)_

## `twentythree comment reaction list`

List reactions on comments for an object

```
USAGE
  $ twentythree comment reaction list --object-id <value> --object-token <value> [--json] [-w <value>] [--object-type
    <value>] [--uuid <value>]

FLAGS
  --object-id=<value>     (required) Object ID to list reactions for
  --object-token=<value>  (required) Object token for the target object
  --object-type=<value>   Object type (live, photo, album)
  --uuid=<value>          UUID identifier

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List reactions on comments for an object

EXAMPLES
  $ twentythree comment reaction list --object-id 123 --object-token abc

  $ twentythree comment reaction list --object-id 123 --object-token abc --object-type photo
```

_See code: [src/commands/comment/reaction/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/comment/reaction/list.ts)_

## `twentythree comment reaction remove ID`

Remove a reaction from a comment

```
USAGE
  $ twentythree comment reaction remove ID --reaction <value> --object-id <value> --object-token <value> [--json] [-w
    <value>] [--object-type <value>] [--uuid <value>]

ARGUMENTS
  ID  Comment ID

FLAGS
  --object-id=<value>     (required) Object ID the comment belongs to
  --object-token=<value>  (required) Object token for the target object
  --object-type=<value>   Object type (live, photo, album)
  --reaction=<value>      (required) Reaction emoji to remove
  --uuid=<value>          UUID identifier

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Remove a reaction from a comment

EXAMPLES
  $ twentythree comment reaction remove 789 --object-id 123 --object-token abc --reaction "👍"

  $ twentythree comment reaction remove 789 --object-id 123 --object-token abc --reaction "❤️" --object-type photo
```

_See code: [src/commands/comment/reaction/remove.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/comment/reaction/remove.ts)_

## `twentythree comment set-order`

Set display order of comments on an object

```
USAGE
  $ twentythree comment set-order --object-id <value> --order <value> [--json] [-w <value>] [--comment-type <value>]

FLAGS
  --comment-type=<value>  Comment type to reorder (default: question)
  --object-id=<value>     (required) Object ID whose comments are being reordered
  --order=<value>         (required) Comma-separated list of comment IDs in desired display order

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Set display order of comments on an object

EXAMPLES
  $ twentythree comment set-order --object-id 123 --order "789,456,123"

  $ twentythree comment set-order --object-id 123 --order "789,456" --comment-type question
```

_See code: [src/commands/comment/set-order.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/comment/set-order.ts)_

## `twentythree comment update ID`

Update a comment's status

```
USAGE
  $ twentythree comment update ID --object-id <value> [--json] [-w <value>] [--status <value>]

ARGUMENTS
  ID  Comment ID

FLAGS
  --object-id=<value>  (required) Object ID the comment belongs to
  --status=<value>     Comment status (answered, dismissed, or empty to clear)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update a comment's status

EXAMPLES
  $ twentythree comment update 789 --object-id 123 --status answered

  $ twentythree comment update 789 --object-id 123 --status dismissed
```

_See code: [src/commands/comment/update.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/comment/update.ts)_
