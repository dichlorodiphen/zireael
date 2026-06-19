import { defineCommand } from "citty";

type ShellType = "bash" | "zsh" | "fish";

interface CommandInfo {
	name: string;
	description: string;
	flags: Array<{
		name: string;
		short?: string;
		description: string;
		type: "boolean" | "string";
	}>;
	subcommands?: Record<string, CommandInfo>;
}

const COMMANDS: Record<string, CommandInfo> = {
	add: {
		name: "add",
		description: "Create a new task",
		flags: [
			{
				name: "today",
				short: "t",
				description: "Schedule task for today",
				type: "boolean",
			},
			{
				name: "tomorrow",
				description: "Schedule task for tomorrow",
				type: "boolean",
			},
			{
				name: "date",
				short: "d",
				description: "Natural language date (e.g., 'next friday', 'in 3 days')",
				type: "string",
			},
			{
				name: "project",
				short: "p",
				description: "Assign to project/label by name",
				type: "string",
			},
		],
	},
	do: {
		name: "do",
		description: "Mark tasks as complete",
		flags: [],
	},
	create: {
		name: "create",
		description: "Create Akiflow tasks, task slots, or calendar events",
		flags: [],
		subcommands: {
			task: {
				name: "task",
				description: "Create an Akiflow task",
				flags: [],
			},
			slot: {
				name: "slot",
				description: "Create an Akiflow task slot",
				flags: [],
			},
			event: {
				name: "event",
				description: "Create a timed Google calendar event through Akiflow",
				flags: [],
			},
		},
	},
	convert: {
		name: "convert",
		description: "Convert between Akiflow surfaces",
		flags: [],
		subcommands: {
			tasks: {
				name: "tasks",
				description: "Convert Akiflow tasks to another surface",
				flags: [],
			},
			slots: {
				name: "slots",
				description: "Convert Akiflow slots to another surface",
				flags: [],
			},
			events: {
				name: "events",
				description: "Convert Akiflow events to another surface",
				flags: [],
			},
		},
	},
	ls: {
		name: "ls",
		description: "List tasks",
		flags: [
			{
				name: "inbox",
				description: "Show tasks without date",
				type: "boolean",
			},
			{
				name: "all",
				description: "Show all tasks",
				type: "boolean",
			},
			{
				name: "done",
				description: "Show only completed tasks",
				type: "boolean",
			},
			{
				name: "project",
				description: "Filter by project name",
				type: "string",
			},
			{
				name: "json",
				description: "Output as JSON",
				type: "boolean",
			},
			{
				name: "plain",
				description: "Plain text output without colors",
				type: "boolean",
			},
		],
	},
	task: {
		name: "task",
		description: "Task management commands",
		flags: [],
		subcommands: {
			edit: {
				name: "edit",
				description: "Edit a task",
				flags: [],
			},
			move: {
				name: "move",
				description: "Move task to a different project",
				flags: [],
			},
			plan: {
				name: "plan",
				description: "Schedule task for a specific date",
				flags: [],
			},
			snooze: {
				name: "snooze",
				description: "Snooze task by duration",
				flags: [],
			},
			delete: {
				name: "delete",
				description: "Delete a task",
				flags: [],
			},
		},
	},
	project: {
		name: "project",
		description: "Project management commands",
		flags: [],
		subcommands: {
			ls: {
				name: "ls",
				description: "List projects",
				flags: [],
			},
			create: {
				name: "create",
				description: "Create a new project",
				flags: [],
			},
			color: {
				name: "color",
				description: "Set project color",
				flags: [],
			},
		},
	},
	hello: {
		name: "hello",
		description: "Say hello",
		flags: [],
	},
	completion: {
		name: "completion",
		description: "Generate shell completion scripts",
		flags: [],
	},
};

function generateBashCompletion(): string {
	const commands = Object.keys(COMMANDS).join("|");

	return `#!/bin/bash
# Bash completion for af
# Installation: af completion bash >> ~/.bashrc

_af_completion() {
  local cur prev words cword
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"
  words=("\${COMP_WORDS[@]}")
  cword=$COMP_CWORD

  # Get the main command (first word after 'af')
  local main_cmd=""
  if [[ $cword -gt 1 ]]; then
    main_cmd="\${words[1]}"
  fi

  # Complete main commands
  if [[ $cword -eq 1 ]]; then
    COMPREPLY=($(compgen -W "${commands}" -- "$cur"))
    return 0
  fi

  # Complete subcommands for 'task'
  if [[ "$main_cmd" == "task" && $cword -eq 2 ]]; then
    COMPREPLY=($(compgen -W "edit move plan snooze delete" -- "$cur"))
    return 0
  fi

  # Complete subcommands for 'project'
  if [[ "$main_cmd" == "project" && $cword -eq 2 ]]; then
    COMPREPLY=($(compgen -W "ls create color" -- "$cur"))
    return 0
  fi

  # Complete subcommands for 'create'
  if [[ "$main_cmd" == "create" && $cword -eq 2 ]]; then
    COMPREPLY=($(compgen -W "task slot event" -- "$cur"))
    return 0
  fi

  # Complete subcommands for 'convert'
  if [[ "$main_cmd" == "convert" && $cword -eq 2 ]]; then
    COMPREPLY=($(compgen -W "tasks slots events" -- "$cur"))
    return 0
  fi

  # Complete flags for 'add'
  if [[ "$main_cmd" == "add" ]]; then
    COMPREPLY=($(compgen -W "-t --today --tomorrow -d --date -p --project" -- "$cur"))
    return 0
  fi

  # Complete flags for 'ls'
  if [[ "$main_cmd" == "ls" ]]; then
    COMPREPLY=($(compgen -W "--inbox --all --done --project --json --plain" -- "$cur"))
    return 0
  fi

  # Complete common flags for 'create' subcommands
  if [[ "$main_cmd" == "create" ]]; then
    COMPREPLY=($(compgen -W "--description --description-file -d --date --at --duration --calendar --location --task --task-id --task-duration --json" -- "$cur"))
    return 0
  fi

  # Complete flags for 'convert'
  if [[ "$main_cmd" == "convert" ]]; then
    COMPREPLY=($(compgen -W "--to --execute --delete-source --default-duration --include-connector-tasks --calendar --search --from --until --range-to --date --status --connector --priority --json" -- "$cur"))
    return 0
  fi

  # Complete flags for 'cal'
  if [[ "$main_cmd" == "cal" ]]; then
    COMPREPLY=($(compgen -W "--search --summary --json --raw --today --tomorrow --date --from --to --calendar --connector --no-events --no-tasks --no-slots" -- "$cur"))
    return 0
  fi

  # Complete flags for 'completion'
  if [[ "$main_cmd" == "completion" && $cword -eq 2 ]]; then
    COMPREPLY=($(compgen -W "bash zsh fish" -- "$cur"))
    return 0
  fi

  return 0
}

complete -o bashdefault -o default -o nospace -F _af_completion af
`;
}

function generateZshCompletion(): string {
	return `#compdef af

# Zsh completion for af
# Installation: af completion zsh > ~/.zsh/completions/_af

_af() {
  local -a commands=(
    'add:Create a new task'
    'do:Mark tasks as complete'
    'create:Create Akiflow tasks, task slots, or calendar events'
    'convert:Convert between Akiflow surfaces'
    'ls:List tasks'
    'task:Task management commands'
    'project:Project management commands'
    'hello:Say hello'
    'completion:Generate shell completion scripts'
  )

  local -a task_subcommands=(
    'edit:Edit a task'
    'move:Move task to a different project'
    'plan:Schedule task for a specific date'
    'snooze:Snooze task by duration'
    'delete:Delete a task'
  )

  local -a project_subcommands=(
    'ls:List projects'
    'create:Create a new project'
    'color:Set project color'
  )

  local -a create_subcommands=(
    'task:Create an Akiflow task'
    'slot:Create an Akiflow task slot'
    'event:Create a timed Google calendar event through Akiflow'
  )

  local -a convert_subcommands=(
    'tasks:Convert Akiflow tasks to another surface'
    'slots:Convert Akiflow slots to another surface'
    'events:Convert Akiflow events to another surface'
  )

  local -a add_flags=(
    '-t[Schedule task for today]'
    '--today[Schedule task for today]'
    '--tomorrow[Schedule task for tomorrow]'
    '-d[Natural language date]:date:'
    '--date[Natural language date]:date:'
    '-p[Assign to project]:project:'
    '--project[Assign to project]:project:'
  )

  local -a ls_flags=(
    '--inbox[Show tasks without date]'
    '--all[Show all tasks]'
    '--done[Show only completed tasks]'
    '--project[Filter by project]:project:'
    '--json[Output as JSON]'
    '--plain[Plain text output without colors]'
  )

  local -a completion_shells=(
    'bash:Bash shell completion'
    'zsh:Zsh shell completion'
    'fish:Fish shell completion'
  )

  local -a create_flags=(
    '--description[Description]:description:'
    '--description-file[Read description from file]:path:'
    '-d[Natural language date]:date:'
    '--date[Natural language date]:date:'
    '--at[Local start time]:time:'
    '--duration[Duration]:duration:'
    '--calendar[Calendar id]:calendar:'
    '--location[Location]:location:'
    '--task[Create a task inside the slot]:task:'
    '--task-id[Existing task id to place inside the slot]:task id:'
    '--task-duration[Duration for newly created slot tasks]:duration:'
    '--json[Output JSON]'
  )

  local -a convert_flags=(
    '--to[Target surface]:surface:'
    '--execute[Perform conversion]'
    '--delete-source[Delete source tasks after successful conversion]'
    '--default-duration[Fallback duration]:duration:'
    '--include-connector-tasks[Allow connector-backed task sources]'
    '--calendar[Calendar id]:calendar:'
    '--search[Search tasks]:query:'
    '--from[Start date]:date:'
    '--until[End date]:date:'
    '--range-to[End date]:date:'
    '--date[Single day]:date:'
    '--status[Task status]:status:'
    '--connector[Connector]:connector:'
    '--priority[Priority]:priority:'
    '--json[Output JSON]'
  )

  _arguments -C \\
    '1: :->command' \\
    '*::arg:->args'

  case $state in
    command)
      _describe 'command' commands
      ;;
    args)
      case \${words[2]} in
        add)
          _arguments $add_flags
          ;;
        ls)
          _arguments $ls_flags
          ;;
        task)
          _describe 'subcommand' task_subcommands
          ;;
        project)
          _describe 'subcommand' project_subcommands
          ;;
        create)
          if [[ \${#words} -le 3 ]]; then
            _describe 'subcommand' create_subcommands
          else
            _arguments $create_flags
          fi
          ;;
        convert)
          if [[ \${#words} -le 3 ]]; then
            _describe 'subcommand' convert_subcommands
          else
            _arguments $convert_flags
          fi
          ;;
        completion)
          _describe 'shell' completion_shells
          ;;
      esac
      ;;
  esac
}

_af
`;
}

function generateFishCompletion(): string {
	return `# Fish completion for af
# Installation: af completion fish | sudo tee /usr/local/share/fish/vendor_completions.d/af.fish

# Main commands
complete -c af -f -n "__fish_use_subcommand_from_list" -a "add" -d "Create a new task"
complete -c af -f -n "__fish_use_subcommand_from_list" -a "do" -d "Mark tasks as complete"
complete -c af -f -n "__fish_use_subcommand_from_list" -a "create" -d "Create Akiflow tasks, task slots, or calendar events"
complete -c af -f -n "__fish_use_subcommand_from_list" -a "convert" -d "Convert between Akiflow surfaces"
complete -c af -f -n "__fish_use_subcommand_from_list" -a "ls" -d "List tasks"
complete -c af -f -n "__fish_use_subcommand_from_list" -a "task" -d "Task management commands"
complete -c af -f -n "__fish_use_subcommand_from_list" -a "project" -d "Project management commands"
complete -c af -f -n "__fish_use_subcommand_from_list" -a "hello" -d "Say hello"
complete -c af -f -n "__fish_use_subcommand_from_list" -a "completion" -d "Generate shell completion scripts"

# Task subcommands
complete -c af -n "__fish_seen_subcommand_from task" -f -a "edit" -d "Edit a task"
complete -c af -n "__fish_seen_subcommand_from task" -f -a "move" -d "Move task to a different project"
complete -c af -n "__fish_seen_subcommand_from task" -f -a "plan" -d "Schedule task for a specific date"
complete -c af -n "__fish_seen_subcommand_from task" -f -a "snooze" -d "Snooze task by duration"
complete -c af -n "__fish_seen_subcommand_from task" -f -a "delete" -d "Delete a task"

# Project subcommands
complete -c af -n "__fish_seen_subcommand_from project" -f -a "ls" -d "List projects"
complete -c af -n "__fish_seen_subcommand_from project" -f -a "create" -d "Create a new project"
complete -c af -n "__fish_seen_subcommand_from project" -f -a "color" -d "Set project color"

# Create subcommands
complete -c af -n "__fish_seen_subcommand_from create" -f -a "task" -d "Create an Akiflow task"
complete -c af -n "__fish_seen_subcommand_from create" -f -a "slot" -d "Create an Akiflow task slot"
complete -c af -n "__fish_seen_subcommand_from create" -f -a "event" -d "Create a timed Google calendar event through Akiflow"

# Convert subcommands
complete -c af -n "__fish_seen_subcommand_from convert" -f -a "tasks" -d "Convert Akiflow tasks to another surface"
complete -c af -n "__fish_seen_subcommand_from convert" -f -a "slots" -d "Convert Akiflow slots to another surface"
complete -c af -n "__fish_seen_subcommand_from convert" -f -a "events" -d "Convert Akiflow events to another surface"

# Create command flags
complete -c af -n "__fish_seen_subcommand_from create" -l description -d "Description"
complete -c af -n "__fish_seen_subcommand_from create" -l description-file -d "Read description from file"
complete -c af -n "__fish_seen_subcommand_from create" -s d -l date -d "Natural language date"
complete -c af -n "__fish_seen_subcommand_from create" -l at -d "Local start time"
complete -c af -n "__fish_seen_subcommand_from create" -l duration -d "Duration"
complete -c af -n "__fish_seen_subcommand_from create" -l calendar -d "Calendar id"
complete -c af -n "__fish_seen_subcommand_from create" -l location -d "Location"
complete -c af -n "__fish_seen_subcommand_from create" -l task -d "Create a task inside the slot"
complete -c af -n "__fish_seen_subcommand_from create" -l task-id -d "Existing task id to place inside the slot"
complete -c af -n "__fish_seen_subcommand_from create" -l task-duration -d "Duration for newly created slot tasks"
complete -c af -n "__fish_seen_subcommand_from create" -l json -d "Output JSON"

# Convert command flags
complete -c af -n "__fish_seen_subcommand_from convert" -l to -d "Target surface"
complete -c af -n "__fish_seen_subcommand_from convert" -l execute -d "Perform conversion"
complete -c af -n "__fish_seen_subcommand_from convert" -l delete-source -d "Delete source tasks after successful conversion"
complete -c af -n "__fish_seen_subcommand_from convert" -l default-duration -d "Fallback duration"
complete -c af -n "__fish_seen_subcommand_from convert" -l include-connector-tasks -d "Allow connector-backed task sources"
complete -c af -n "__fish_seen_subcommand_from convert" -l calendar -d "Calendar id"
complete -c af -n "__fish_seen_subcommand_from convert" -s s -l search -d "Search tasks"
complete -c af -n "__fish_seen_subcommand_from convert" -l from -d "Start date"
complete -c af -n "__fish_seen_subcommand_from convert" -l until -d "End date"
complete -c af -n "__fish_seen_subcommand_from convert" -l range-to -d "End date"
complete -c af -n "__fish_seen_subcommand_from convert" -l date -d "Single day"
complete -c af -n "__fish_seen_subcommand_from convert" -l status -d "Task status"
complete -c af -n "__fish_seen_subcommand_from convert" -l connector -d "Connector"
complete -c af -n "__fish_seen_subcommand_from convert" -l priority -d "Priority"
complete -c af -n "__fish_seen_subcommand_from convert" -l json -d "Output JSON"

# Add command flags
complete -c af -n "__fish_seen_subcommand_from add" -s t -l today -d "Schedule task for today"
complete -c af -n "__fish_seen_subcommand_from add" -l tomorrow -d "Schedule task for tomorrow"
complete -c af -n "__fish_seen_subcommand_from add" -s d -l date -d "Natural language date (e.g., 'next friday', 'in 3 days')"
complete -c af -n "__fish_seen_subcommand_from add" -s p -l project -d "Assign to project/label by name"

# Ls command flags
complete -c af -n "__fish_seen_subcommand_from ls" -l inbox -d "Show tasks without date"
complete -c af -n "__fish_seen_subcommand_from ls" -l all -d "Show all tasks"
complete -c af -n "__fish_seen_subcommand_from ls" -l done -d "Show only completed tasks"
complete -c af -n "__fish_seen_subcommand_from ls" -l project -d "Filter by project name"
complete -c af -n "__fish_seen_subcommand_from ls" -l json -d "Output as JSON"
complete -c af -n "__fish_seen_subcommand_from ls" -l plain -d "Plain text output without colors"

# Completion command shells
complete -c af -n "__fish_seen_subcommand_from completion" -f -a "bash" -d "Bash shell completion"
complete -c af -n "__fish_seen_subcommand_from completion" -f -a "zsh" -d "Zsh shell completion"
complete -c af -n "__fish_seen_subcommand_from completion" -f -a "fish" -d "Fish shell completion"
`;
}

export const completionCommand = defineCommand({
	meta: {
		name: "completion",
		description: "Generate shell completion scripts",
	},
	args: {
		shell: {
			type: "positional",
			description: "Shell type (bash, zsh, or fish)",
			required: true,
		},
	},
	run: async (context) => {
		const shell = (context.args.shell as string).toLowerCase() as ShellType;

		if (!["bash", "zsh", "fish"].includes(shell)) {
			console.error(
				`Error: Unknown shell "${shell}". Supported shells: bash, zsh, fish`,
			);
			process.exit(1);
		}

		let completionScript: string;

		switch (shell) {
			case "bash":
				completionScript = generateBashCompletion();
				break;
			case "zsh":
				completionScript = generateZshCompletion();
				break;
			case "fish":
				completionScript = generateFishCompletion();
				break;
			default:
				completionScript = generateBashCompletion();
		}

		console.log(completionScript);
	},
});
