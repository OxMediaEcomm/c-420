# C-420

A complete, working Claude Code "brain" you can clone and make your own: a CLAUDE.md config, a 3-store memory architecture, dozens of agents, and a full library of skills covering engineering, design, research, and business workflows.

The goal isn't to hand you a finished product, it's to hand you a running start. Clone it, point it at your own projects, delete what you don't need, and grow it as you go, the same way this one grew out of real client work over months of actual use.

## What's in here

- **`CLAUDE.md`** - the top-level config: hard rules, memory architecture, skill index, auto-trigger table. This is the file you'll edit the most.
- **`skills/`** - the full skill library. Each skill is a self-contained `SKILL.md` that Claude Code auto-triggers based on context (what you're doing, what you ask for).
- **`agents/`** - specialized subagent definitions (code reviewers, build-error resolvers, security reviewers, planners, and more) that Claude can delegate to.
- **`commands/`** - slash commands.
- **`rules/`** - language and domain-specific coding standards (common rules + per-language overrides).
- **`hooks/`** - automation that fires on tool use or session end (context-usage guard, session-end snapshotting).
- **`mcp-servers/`** - wrapper scripts for a couple of MCP servers that read credentials from environment variables.
- **`memory/learned-triggers.md`** - a starter template for the vocabulary-trigger store (starts empty, fills in as you work).
- **`persona-pack/`** - an optional, off-by-default example persona (sci-fi chaotic energy, Rick & Morty-style) showing how to build your own voice on top of this config.

## Getting started

1. Clone this repo somewhere, or copy its contents into `~/.claude/` (user-level, applies everywhere) or `.claude/` inside a specific project (project-level, applies there only).
2. Copy `.env.example` to `.env` (or just export the variables in your shell profile) and fill in your own paths. See that file for what each one is for.
3. Open `CLAUDE.md` and replace the example "Project Locations" table with your own projects, or delete it.
4. Read **`CUSTOMIZING.md`** for how the whole system fits together, and what to do first.

## Why "start basic and grow it"

Most of what's valuable in a config like this isn't the skill count, it's the parts that are actually yours: the rules you've learned the hard way, the shortcuts your own vocabulary maps to, the persona (if any) you actually want talking to you every day. This repo ships with the full library so you have everything available on day one, but the intent is that your `CLAUDE.md`, your `memory/`, and your own added skills are where this becomes *your* brain instead of a copy of someone else's.

## License

MIT. See `LICENSE`.
