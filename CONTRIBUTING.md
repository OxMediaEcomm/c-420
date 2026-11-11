# Contributing to Schwiftyy Brain Starter

Thanks for considering a contribution. This is a community starter kit for Claude Code, not a single-maintainer product, so improvements that make it more useful as a *starting point* for other people are the goal (not improvements that make it more specific to any one person's setup).

## Development setup

1. Fork and clone the repo.
2. Run `./setup.sh` against a scratch directory (not your real `~/.claude/`) to sanity-check the install flow still works end to end.
3. Make your change.
4. If you touched a skill, agent, command, rule, or hook, re-run `./setup.sh` once more to confirm the copy step still finds it.

There is no build step and no test suite; this repo is configuration and documentation, not application code. "Testing" a change means actually exercising it in a Claude Code session and confirming the behavior you expect shows up.

## What belongs here vs. what doesn't

- **Good contributions:** fixing a broken path/placeholder, improving a template's clarity, adding a genuinely general-purpose skill/agent/rule, improving `setup.sh` robustness across platforms, fixing docs that are wrong or outdated.
- **Probably not a good fit:** anything tied to one specific client, company, or personal workflow that most users wouldn't recognize or want. Those belong in a user's own fork, not upstream. If in doubt, open an issue first and ask.
- **Never commit:** real credentials, real paths from your own machine, real project names/URLs. Everything in this repo should read as a template (`YOUR_USERNAME`, `example-*`, etc.), not as a snapshot of a real environment.

## Branch and PR workflow

1. Create a branch off `main` named for the change, e.g. `fix/statusline-fallback` or `feat/add-rust-rules`.
2. Keep PRs focused. One logical change per PR is much easier to review than a grab-bag.
3. Write a clear PR description: what changed, why, and how you verified it.
4. Reference any related issue.
5. Expect review feedback. Respond to it rather than force-pushing over it unless asked.

## Code style / content conventions

This repo follows the conventions it documents:

- No em-dashes anywhere (commit messages, docs, skills, everything). Use a comma, colon, parenthesis, semicolon, or a new sentence instead.
- No hardcoded secrets, absolute personal paths, or real credentials in any tracked file. Use the `${VAR}`-style placeholders already established in `.env.example`, `settings.json`, and `CLAUDE.md`.
- Skills follow the existing `SKILL.md` frontmatter + description pattern used throughout `skills/`. See `CUSTOMIZING.md` for the format.
- Keep `CLAUDE.md` itself lean. It's loaded on every session; don't let it sprawl.

## Reporting issues

Use the issue templates under `.github/ISSUE_TEMPLATE/`. Include:

- What you expected vs. what happened
- Whether you installed user-level (`~/.claude/`) or project-level (`.claude/`)
- Your OS/shell (this kit targets both POSIX shells and Git Bash on Windows)
- Any error output from `setup.sh` or the relevant hook/script

## Using Claude Code to contribute

This repo is, itself, a Claude Code config. If you have Claude Code installed, you can open this repo and it will read `CLAUDE.md` automatically for context on structure and conventions. That's a good way to get oriented before making a change, the config describes its own architecture (skills, agents, rules, memory, hooks) in more depth than this file does.

If you add or change a skill/agent/rule, consider asking Claude Code to cross-check it against `CUSTOMIZING.md`'s "Adding your own skills" section before opening a PR.
