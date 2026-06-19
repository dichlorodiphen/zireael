# Akiflow CLI Commands Reference

## Task Management

### af ls

List all tasks with optional filters.

```bash
af ls --label "work" --status "active"
```

### af add

Add a new task with natural language date parsing.

```bash
af add "Buy groceries" --date "tomorrow" --duration "1h"
```

### af create

Create explicit Akiflow record types.

```bash
af create task "Review PR" --date 2026-06-20 --description "Check release notes"
af create slot "Planning block" --date 2026-06-20 --at 09:00 --duration 1h --task "Draft" --task "Review"
af create event "Meeting" --date 2026-06-20 --at 13:00 --duration 30m --description "Discuss launch" --location "Office"
af create event "Rental pickup" --date 2026-06-20 --at 23:55 --duration 45m --description-file rental-details.txt
```

`af create event` v1 creates timed, non-recurring Google Calendar events through Akiflow. Attendees, recurrence, conferencing, reminders, all-day events, updates, and deletes are not supported.

### af convert

Convert between Akiflow record surfaces. V1 supports only timed Akiflow tasks to Google Calendar events.

```bash
af convert tasks --to events --search "Portland trip:" --from 2026-06-19 --until 2026-06-23
af convert tasks --to events --search "Portland trip:" --from 2026-06-19 --until 2026-06-23 --execute --delete-source
```

The command dry-runs by default. Mutations require `--execute`; source cleanup also requires `--delete-source`. Use `--until` or `--range-to` for the date-range end because `--to` is the target surface.

### af do

Mark a task as complete.

```bash
af do <task-id>
```

### af task

Manage task properties.

```bash
af task edit <task-id> --title "New title"
af task move <task-id> --project "Work"
af task plan <task-id> --date "2026-02-15"
af task snooze <task-id> --duration "2h"
af task delete <task-id>
```

## Project Management

### af project

Manage projects.

```bash
af project ls
af project create "New Project"
af project delete "Project Name"
```

## Calendar & Time Blocking

### af cal

View calendar with tasks.

```bash
af cal --month "2026-02"
af cal --from 2026-06-19 --to 2026-06-23 --search "Portland trip:" --summary
```

### af block

Create time blocks.

```bash
af block 2h "Focus Time"
```

## Authentication

### af auth

Authenticate with Akiflow.

```bash
af auth
```

## Shell Completion

### af completion

Generate shell completion scripts.

```bash
af completion bash > ~/.bashrc
af completion zsh > ~/.zshrc
af completion fish > ~/.config/fish/completions/af.fish
```
