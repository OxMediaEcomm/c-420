---
name: statusline-setup
description: Configures the Claude Code statusLine setting in ~/.claude/settings.json. Converts shell PS1 configs or custom instructions into a statusLine command. Reads shell config files, converts PS1 escape sequences, writes a shell script to ~/.claude/, and updates settings.json. Use this skill for any status line changes, PS1 imports, or statusline customization requests.
triggers:
  - "setup statusline"
  - "configure statusline"
  - "status line"
  - "statusline"
  - "PS1"
  - "import my PS1"
  - "convert PS1"
  - "change my status line"
  - "update status line"
---

# STATUSLINE-SETUP SKILL

This skill installs and configures the Claude Code `statusLine` command in `~/.claude/settings.json`.

---

## What This Skill Does

1. Reads shell config files (`~/.zshrc`, `~/.bashrc`, `~/.bash_profile`, `~/.profile`) to extract PS1
2. Converts PS1 escape sequences to shell commands
3. Preserves ANSI color codes (uses `printf` for color output)
4. Strips trailing `$` or `>` prompt characters
5. Writes a script to `~/.claude/statusline-command.sh`
6. Updates `~/.claude/settings.json` with the `statusLine` command

---

## PS1 Escape Sequence Conversion Table

| PS1 Escape | Shell Command |
|-----------|--------------|
| `\u` | `$(whoami)` |
| `\h` | `$(hostname -s)` |
| `\H` | `$(hostname)` |
| `\w` | `$(pwd)` |
| `\W` | `$(basename "$(pwd)")` |
| `\$` | `$` |
| `\n` | `\n` |
| `\t` | `$(date +%H:%M:%S)` |
| `\d` | `$(date "+%a %b %d")` |
| `\@` | `$(date +%I:%M%p)` |
| `\#` | `#` |
| `\!` | `!` |

---

## statusLine JSON Input

The command receives this JSON via stdin:

```
{
  "session_id": "string",
  "session_name": "string",
  "transcript_path": "string",
  "cwd": "string",
  "model": { "id": "string", "display_name": "string" },
  "workspace": {
    "current_dir": "string",
    "project_dir": "string",
    "added_dirs": ["string"],
    "git_worktree": "string"
  },
  "version": "string",
  "output_style": { "name": "string" },
  "context_window": {
    "total_input_tokens": number,
    "total_output_tokens": number,
    "context_window_size": number,
    "current_usage": { ... } | null,
    "used_percentage": number | null,
    "remaining_percentage": number | null
  },
  "effort": { "level": "low|medium|high|xhigh|max" },
  "thinking": { "enabled": boolean },
  "rate_limits": {
    "five_hour": { "used_percentage": number, "resets_at": number },
    "seven_day": { "used_percentage": number, "resets_at": number }
  },
  "vim": { "mode": "INSERT|NORMAL|VISUAL|VISUAL LINE" },
  "agent": { "name": "string", "type": "string" },
  "worktree": {
    "name": "string", "path": "string", "branch": "string",
    "original_cwd": "string", "original_branch": "string"
  }
}
```

---

## Script Rules

- Use `printf` when ANSI color codes are present
- Do NOT remove colors, status line renders in terminal with dimmed colors
- Remove trailing `$` or `>` characters from PS1-derived output
- If git commands are included, use `-c core.hooksPath=/dev/null` or `--no-optional-locks` to skip locks
- Store JSON input in a variable: `input=$(cat)`

---

## Settings Update Rules

- Read `~/.claude/settings.json` first
- If it is a symlink, update the target file
- Preserve all existing settings, only add/update the `statusLine` key
- Output format:

```json
{
  "statusLine": {
    "type": "command",
    "command": "bash ~/.claude/statusline-command.sh"
  }
}
```

---

## After Setup

Always inform the user:
- The script path created (absolute path)
- What the status line will display
- That they can ask Claude to make further changes to the status line
- That this `statusline-setup` skill should be used for any future status line modifications
