# Customizing your brain

This repo is a starting point, not a fixed product. Here's how the pieces fit together and how to make it yours.

## The four surfaces

| Surface | What it's for | When to touch it |
|---|---|---|
| `CLAUDE.md` | Always-loaded config: hard rules, memory architecture, skill index, auto-trigger table | Whenever you add/remove a skill, change a hard rule, or want a new auto-trigger phrase |
| `skills/<name>/SKILL.md` | A self-contained capability Claude auto-triggers based on context | Add a new one when you keep explaining the same workflow; edit an existing one when it's wrong or outdated for your stack |
| `agents/<name>.md` | A subagent definition Claude can delegate a task to | Add one when you want a dedicated reviewer/resolver persona for a recurring task type |
| `rules/` | Coding standards (common + per-language) | Edit to match your team's actual conventions, don't just inherit someone else's defaults |

## Pruning vs. keeping everything

You don't have to remove skills you're not using, Claude only loads a skill's full content when its description matches what you're doing, so an unused skill just sits there at near-zero cost. If you want a leaner footprint anyway (fewer options to scroll through, smaller `skills/` directory), delete what's clearly off-stack for you, e.g. if you never touch Go, Rust, or Swift, remove those skill folders and the matching `rules/` entries.

## Adding your own skills

1. Use `skills/writing-skills` (or the `skill-creator` capability if you have it) as a guide for the SKILL.md format.
2. Give it a clear `description` in the frontmatter, that's what Claude matches against to decide when to load it. Be specific about trigger phrases.
3. Drop it in `skills/<your-skill-name>/SKILL.md`.
4. Optionally add a row to `CLAUDE.md`'s skill table and auto-trigger table so it's documented, not strictly required for it to work, but it helps you (and anyone else reading the config) remember it exists.

## The memory architecture

Three separate stores, each for a different kind of thing:

1. **Vocabulary triggers** (`memory/learned-triggers.md`) - hand-curated "phrase -> skill/action" mappings. Starts empty. When you catch yourself using a shortcut phrase Claude didn't recognize, add a row here.
2. **Project/user/feedback/reference memory** - the auto-memory system, if your Claude Code setup has one. Facts about you, your projects, and your preferences that should persist across sessions. Not included in this repo (it's managed by the harness and lives outside version control), see `CLAUDE.md`'s Memory Architecture section for the pattern.
3. **Behavioral instincts** (`skills/continuous-learning-v2`, if installed) - auto-populated from observed tool-use patterns, not something you write by hand.

Don't conflate them. A one-off fact about a project goes in store 2, a reusable shortcut phrase goes in store 1.

## Turning on the optional persona

By default, Claude speaks in a plain, neutral voice. If you want the example persona in `persona-pack/` and `skills/chaos-protocol/`:

- Turn it on for a single session by just asking ("turn on chaos mode").
- Make it the default by adding a line to `CLAUDE.md`'s "Communication Protocol" section saying so (the way the original always-on version did, see `skills/chaos-protocol/SKILL.md` for the full persona definition to copy from).

Or skip it entirely and write your own, the file is a template, not a requirement.

## Hooks and settings

`settings.json` wires up the statusline and a couple of hooks (`hooks/context-guard.mjs` for context-usage warnings, `hooks/session-end.sh` for session-end snapshotting). Both hook scripts read their file paths from environment variables with safe fallbacks, if you move things around, update `.env.example` and your own `.env` to match, don't hardcode a new absolute path back in.

## MCP servers

The two wrapper scripts under `mcp-servers/` (`21st-magic-wrapper.cmd`, `supabase-mcp-wrapper.cmd`) are examples of the pattern this config expects: read secrets from environment variables, never hardcode them. If you add your own MCP server wrappers, follow the same pattern.
