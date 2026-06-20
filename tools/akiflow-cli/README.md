# akiflow-cli

Private Bun-native CLI for managing Akiflow tasks, calendar events, task slots, and local cache state from the terminal.

## Features

- **Resource-first commands** - `af task`, `af event`, `af slot`, `af calendar`, `af project`, `af cal`
- **Task management** - list, create, complete, update, plan, snooze, delete
- **Calendar events** - create/update/delete timed Google events and add/remove attendees through Akiflow
- **Task slots** - create/delete true Akiflow task slots, optionally with linked tasks
- **Conversion** - convert scheduled task blocks into Google Calendar events
- **Local sync cache** - JSONL stores at `~/.cache/af/` with delta sync and rebuild support
- **Stable JSON output** - cleaned `--json` shapes for task and calendar reads; `--raw` for API records
- **Diagnostics** - `af doctor` reports credentials, browser sources, cache state, and API health

## Installation

```bash
bun install
bun run build
install -m 0755 ./af ~/.local/bin/af
```

First-time auth requires a desktop browser logged into Akiflow:

```bash
af auth
af auth status
```

## Commands

### Tasks

```bash
af task list
af task list --today --json
af task list --from 2026-06-19 --to 2026-06-23 --search "Portland"
af task list --status inbox,planned --connector gmail

af task create "Review PR" --today
af task create "Focus block" --date 2026-06-20 --at 09:00 --duration 1h
af task create "Draft notes" --description "Details" --project <project-id>

af task complete <task-id-or-short-id>
af task complete <task-id-1> <task-id-2>
af task update <task-id> --title "New title" --duration 45m --priority 2
af task plan <task-id> --date 2026-06-20 --at 14:30
af task snooze <task-id> --duration 1d
af task delete <task-id>
```

`af task list` writes `~/.cache/af/last-list.json` so short IDs can be used by task mutation commands. Full UUIDs work without list context.

### Events

```bash
af event create "Meeting" --date 2026-06-20 --at 13:00 --duration 30m \
  --description "Discuss launch" --location "Office"

af event update <event-id> --date 2026-06-20 --at 14:30 --duration 45m \
  --title "Updated meeting" --description-file details.txt

af event delete <event-id>
af event delete <event-id> --notify none

af event attendees add <event-id> julia@example.com alex@example.com
af event attendees remove <event-id> julia@example.com
```

Event v1 supports cached, timed, non-recurring, writable Google Calendar events only. It does not support recurrence, all-day events, reminders, or conferencing. Event updates, attendee changes, and deletes send Google update notifications through Akiflow by default; use `af event delete --notify none` for disposable cleanup.

### Slots

```bash
af slot create "Planning block" --date 2026-06-20 --at 09:00 --duration 1h \
  --task "Draft plan" --task "Review notes" --task-duration 30m

af slot create "Admin" --date 2026-06-20 --at 15:00 --duration 45m \
  --task-id task-uuid-1 --task-id task-uuid-2

af slot delete <slot-id>
```

### Calendar

```bash
af calendar list
af calendar list --json
af calendar default
af calendar resolve "Personal"

af cal --today
af cal --from 2026-06-19 --to 2026-06-23 --json
af cal --from 2026-06-19 --to 2026-06-23 --search "Portland" --summary
af cal --today --no-events
af cal --today --calendar "Personal"
af cal --free
```

`af calendar` lists and resolves calendar metadata. Calendar arguments accept an Akiflow calendar ID, origin calendar/email, or unique title. The merged `af cal` view includes events, time slots, and scheduled tasks. Hidden calendars and hidden/deleted/declined events are excluded by default.

### Conversion

```bash
af convert tasks --to events --search "Portland trip:" --from 2026-06-19 --until 2026-06-23
af convert tasks --to events --search "Portland trip:" --from 2026-06-19 --until 2026-06-23 \
  --calendar "Personal" --execute --delete-source
```

Conversion dry-runs by default. `--execute` creates missing events; `--delete-source` soft-deletes native source tasks only after all selected targets are created or matched. Connector-backed tasks require `--include-connector-tasks` and are never deleted by conversion v1.

### Projects, Cache, Diagnostics

```bash
af project list
af refresh --json
af refresh --rebuild --json
af doctor
af doctor --json
af completion zsh
```

Project mutation is intentionally unsupported until Akiflow's labels mutation API is captured and tested.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `AF_API_BASE` | `https://api.akiflow.com` | Akiflow API base URL; used by integration tests. |
| `AF_CONFIG_DIR` | `~/.config/af` | Credentials directory. |
| `AF_CACHE_DIR` | `~/.cache/af` | Local cache root. |
| `AF_NO_AUTO_SYNC` | unset | Disables 24h auto-refresh-before-read. |
| `AF_LOG` | unset | Writes JSON Lines logs to cache. |
| `AF_DEBUG` | unset | Enables logging and mirrors logs to stderr. |

## Development

```bash
bun run typecheck
bun run lint
AF_CACHE_DIR=/private/tmp/af-test-cache bun run test
```
