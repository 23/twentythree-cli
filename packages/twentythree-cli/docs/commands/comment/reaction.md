`twentythree comment:reaction`
==============================

Add a reaction to a comment

* [`twentythree comment reaction add ID`](#twentythree-comment-reaction-add-id)
* [`twentythree comment reaction list`](#twentythree-comment-reaction-list)
* [`twentythree comment reaction remove ID`](#twentythree-comment-reaction-remove-id)

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
