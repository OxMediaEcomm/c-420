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

Unused skills are not free. Claude only loads a skill's full body when it's relevant, but every skill's **description** loads into every session so Claude knows the skill exists. Across the ~200 skills shipped here that's roughly 14,000 tokens of context spent before you type anything, and a long list also makes it harder for Claude to pick the right skill.

The library is already trimmed to a web/full-stack/AI core (industry-specific and JVM/mobile/PHP/Perl/.NET skills were dropped). Prune further for your stack: if you never touch Go, Rust, or C++, remove those skill folders and the matching `rules/` entries. Trimming to the 30 to 60 skills you actually use is a reasonable target. The `agent-sort` and `skill-stocktake` skills can help you decide.

## Adding your own skills

1. Use `skills/writing-skills` (or the `skill-creator` capability if you have it) as a guide for the SKILL.md format.
2. Give it a clear `description` in the frontmatter, that's what Claude matches against to decide when to load it. Be specific about trigger phrases.
3. Drop it in `skills/<your-skill-name>/SKILL.md`.
4. Optionally add a row to `CLAUDE.md`'s skill table and auto-trigger table so it's documented, not strictly required for it to work, but it helps you (and anyone else reading the config) remember it exists.

## The memory architecture

Three separate stores, each for a different kind of thing:

1. **Vocabulary triggers** (`memory/learned-triggers.md`) - hand-curated "phrase -> skill/action" mappings. Starts empty. When you catch yourself using a shortcut phrase Claude didn't recognize, add a row here.
2. **Project/user/feedback/reference memory** - Claude Code's auto-memory. Facts about you, your projects, and your preferences that persist across sessions. By default Claude Code keys this per working directory, so a session started in `~/Projects/app` would not see what a session in `~` saved. C-420 sets `autoMemoryDirectory` in `settings.json` to `<install>/memory`, so every session, in every folder, reads and writes one store (the same folder as `last_session.md` and `learned-triggers.md`).
3. **Behavioral instincts** (`skills/continuous-learning-v2`, if installed) - auto-populated from observed tool-use patterns, not something you write by hand.

Don't conflate them. A one-off fact about a project goes in store 2, a reusable shortcut phrase goes in store 1.

## Turning on the optional persona

By default, Claude speaks in a plain, neutral voice. If you want the example persona in `persona-pack/` and `skills/chaos-protocol/`:

- Turn it on for a single session by just asking ("turn on chaos mode").
- Make it the default by adding a line to `CLAUDE.md`'s "Communication Protocol" section saying so (the way the original always-on version did, see `skills/chaos-protocol/SKILL.md` for the full persona definition to copy from).

Or skip it entirely and write your own, the file is a template, not a requirement.

## Hooks and settings

`settings.json` wires up the statusline and a couple of hooks (`hooks/context-guard.mjs` for context-usage warnings, `hooks/session-end.sh` for session-end snapshotting). Hook paths are written as `__C420_HOME__` in the repo and replaced with your real install path by `setup.sh`. Non-secret settings (memory path, context window size, statusline identity) live in the `env` block of `settings.json`, which Claude Code loads into every session and hook. Claude Code never reads a `.env` file, so don't put anything there and expect it to work.

If you run a 1M-context model, set `C420_CONTEXT_WINDOW` to `1000000` in that `env` block, or the context guard will warn far too early.

## Studio: Opus designs, Sonnet builds

`skills/c420-studio` plus three agents split a build by what each model is best at:

| Agent | Model | Job |
|---|---|---|
| `ultron` | Opus | Design decisions: direction, palette (with contrast numbers), type, imagery, layout, motion. Writes `DESIGN_SPEC.md`. |
| `jarvis` | Sonnet | Implements the spec frontend to backend, runs build and tests, never makes taste calls (reports "spec gaps" instead). |
| `stress-tester` | Opus | Tries to break the result against the spec: breakpoints, accessibility, hostile input, performance, security smells. Writes `qa/STRESS_REPORT.md`. |

Say "studio mode" or "build me a site". The `model:` field in each agent file pins its model, so this works whether your main session is Opus or Sonnet. Running the main session on Opus and letting Sonnet subagents do the volume is the cheapest way to get Opus-level taste.

## Multiple accounts

If you run more than one Claude Code account (separate `CLAUDE_CONFIG_DIR`s), don't copy skills between them: copies drift. `scripts/link-accounts.mjs` makes every extra account run off this one install:

```bash
# Windows (Git Bash): separate account dirs with ;
export C420_ACCOUNTS="C:/Users/you/.claude-work;C:/Users/you/.claude-personal"
# macOS/Linux: separate with :
export C420_ACCOUNTS="$HOME/.claude-work:$HOME/.claude-personal"

node ~/.claude/scripts/link-accounts.mjs --dry                            # preview
node ~/.claude/scripts/link-accounts.mjs --share-sessions --share-memory  # apply
```

- Skills (one link per skill) and `agents/` point back to the main install. Edit skills there only.
- `--share-memory` sets `autoMemoryDirectory` in each account to the same memory folder: one brain, every account.
- `--share-sessions` gives all accounts one peer registry, so a session on one account can `ListAgents` / `SendMessage` a session on another (for example an Opus account handing build jobs to a Sonnet account, see `c420-studio`).
- Anything it would replace is moved to `<account>/replaced-<date>/`, never deleted. It is idempotent: add it as a `SessionStart` hook in each account's `settings.json` (with `--quiet`) to keep new skills flowing automatically.

## Working away from your computer

Your PC does the work; you just need a way in. Options, from least to most setup:

1. **Remote Control (built in).** In a project folder run `claude remote-control --name "My PC"`, then open the Claude mobile app or claude.ai/code and pick the session. Keep the computer awake. Claude's `PushNotification` tool reaches your phone while connected, so long tasks can ping you when they finish or need a decision.
2. **Chat bridge (Telegram, Discord, Slack).** A small always-on script receives your message, runs `claude -p "<message>" --continue` in a project folder, and posts the reply back. True "text it from anywhere" with any chat app; you own the bot token and must lock it to your own user ID.
3. **SMS (Twilio).** Same bridge idea over real text messages. Costs per message and needs a public webhook (a tunnel such as Cloudflare Tunnel).
4. **SSH / remote desktop.** Tailscale plus SSH (or any remote desktop app) to reach your actual terminal. Full control, most manual.
5. **Cloud sessions.** claude.ai/code cloud sessions or scheduled routines run without your PC at all, against a GitHub repo.

Whatever you pick: never expose an unauthenticated endpoint that runs `claude`, and keep secrets out of chat transcripts.


## MCP servers

The two wrapper scripts under `mcp-servers/` (`21st-magic-wrapper.cmd`, `supabase-mcp-wrapper.cmd`) are examples of the pattern this config expects: read secrets from environment variables, never hardcode them. If you add your own MCP server wrappers, follow the same pattern.
