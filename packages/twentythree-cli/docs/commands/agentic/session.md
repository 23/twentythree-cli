`twentythree agentic:session`
=============================

Report and inspect agentic (AI agent) sessions

* [`twentythree agentic session list`](#twentythree-agentic-session-list)
* [`twentythree agentic session metrics`](#twentythree-agentic-session-metrics)
* [`twentythree agentic session status`](#twentythree-agentic-session-status)

## `twentythree agentic session list`

List reported agentic (AI agent) sessions

```
USAGE
  $ twentythree agentic session list [--json] [-w <value>] [--fields <value>]

FLAGS
  --fields=<value>  Comma-separated fields to return

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List reported agentic (AI agent) sessions

  Lists sessions previously reported via `agentic session status`, with prompt counts, durations,
  and start/end times.

EXAMPLES
  $ twentythree agentic session list

  $ twentythree agentic session list --json
```

_See code: [src/commands/agentic/session/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.0/src/commands/agentic/session/list.ts)_

## `twentythree agentic session metrics`

Get aggregate metrics for reported agentic (AI agent) sessions

```
USAGE
  $ twentythree agentic session metrics [--json] [-w <value>] [--fields <value>]

FLAGS
  --fields=<value>  Comma-separated fields to return

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get aggregate metrics for reported agentic (AI agent) sessions

  Returns the total session count, total number of prompts, and total session duration in seconds
  across all reported agentic sessions.

EXAMPLES
  $ twentythree agentic session metrics

  $ twentythree agentic session metrics --json
```

_See code: [src/commands/agentic/session/metrics.ts](https://github.com/23/twentythree-cli/blob/v1.6.0/src/commands/agentic/session/metrics.ts)_

## `twentythree agentic session status`

Report (store) the status of an agentic (AI agent) session

```
USAGE
  $ twentythree agentic session status --session-identifier <value> --summary <value> --number-of-prompts
    <value> --session-duration-seconds <value> --ai-provider <value> --twentythree-skill-version <value>
    --estimated-minutes-saved <value> [--json] [-w <value>] [--fields <value>]

FLAGS
  --ai-provider=<value>                (required) AI/LLM provider used in the session (e.g. "claude code", "codex")
  --estimated-minutes-saved=<value>    (required) Estimated minutes saved by the automated run vs. doing the task by hand (0 if unknown)
  --fields=<value>                     Comma-separated fields to return
  --number-of-prompts=<value>          (required) Number of user prompts in the agent session (0 if unknown)
  --session-duration-seconds=<value>   (required) Duration of the agent session, in seconds (0 if unknown)
  --session-identifier=<value>         (required) Unique identifier for the agent session being reported
  --summary=<value>                    (required) Short summary of what the agent session accomplished
  --twentythree-skill-version=<value>  (required) Version of the TwentyThree skill used ("unknown" if unknown)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Report (store) the status of an agentic (AI agent) session

  Stores a record of what an AI agent session accomplished — its summary, prompt count, duration,
  the AI provider used, and the TwentyThree skill version. Surfaced via `agentic session list` and
  aggregated by `agentic session metrics`.

EXAMPLES
  $ twentythree agentic session status --session-identifier abc123 --summary "Uploaded 3 videos" --number-of-prompts 12 --session-duration-seconds 540 --ai-provider "claude code" --twentythree-skill-version 1.6.0 --estimated-minutes-saved 20

  $ twentythree agentic session status --session-identifier abc123 --summary "Created a webinar" --number-of-prompts 5 --session-duration-seconds 120 --ai-provider "codex" --twentythree-skill-version 1.6.0 --estimated-minutes-saved 10 --json
```

_See code: [src/commands/agentic/session/status.ts](https://github.com/23/twentythree-cli/blob/v1.6.0/src/commands/agentic/session/status.ts)_
