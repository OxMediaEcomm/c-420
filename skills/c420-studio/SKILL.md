---
name: c420-studio
description: "C-420 Studio: Opus designs and stress-tests, Sonnet builds. Orchestrates Ultron (design brain, Opus), Jarvis (builder, Sonnet), and the stress tester (Opus) to ship a site or app frontend-to-backend. Use when the user says 'studio mode', 'build me a site', 'build the site', 'Ultron and Jarvis', 'Opus design / Sonnet build', or starts any new website, landing page, or app build. Also covers handing work to a second Claude Code session (another account or window) over built-in peer messaging."
---

# C-420 Studio

One rule: **Opus decides, Sonnet does.** Opus spends tokens on taste and judgment; Sonnet spends them on volume.

| Brain | Agent | Model | Owns |
|---|---|---|---|
| Orchestrator | main session | Opus recommended | brief, routing, user comms, final call |
| Ultron | `ultron` | Opus | direction, color, type, imagery, layout, motion |
| Jarvis | `jarvis` | Sonnet | all implementation, build, tests |
| Stress tester | `stress-tester` | Opus | adversarial QA vs the spec |

If the main session runs on Sonnet, the pipeline still works: Ultron and the stress tester run on Opus as subagents regardless.

## Pipeline

1. **Brief** (orchestrator): confirm product, audience, primary action, repo path, stack. Ask the user only what the repo cannot answer.
2. **Design** (Ultron): `Agent(subagent_type: "ultron")` with the brief and repo path. Output: `DESIGN_SPEC.md`. Show the user the 5-line summary and any "Needs user input" items. For a new brand, get a go before building.
3. **Build** (Jarvis): split the spec into chunks (tokens + layout shell first, then sections/pages, then backend/API, then forms/integrations). Dispatch `Agent(subagent_type: "jarvis")` per chunk; run independent chunks in parallel once the shell exists. Each brief: spec path, exact sections, files it may touch.
4. **Rule on gaps**: collect "Spec gaps" from Jarvis reports, decide (or ask Ultron), update the spec, send fixes back.
5. **Stress test**: `Agent(subagent_type: "stress-tester")` against the running dev server. Output: `qa/STRESS_REPORT.md`.
6. **Fix loop**: CRITICAL/HIGH findings go back to Jarvis with exact fixes; REDESIGN NEEDED goes back to Ultron. Re-test only what changed. Max 3 loops, then report status.
7. **Gates**: `security-review` on any auth/payment/webhook code, `verification-loop` before calling it done. Ask before any commit or deploy.

## Cross-session mode (two windows or two accounts)

Claude Code sessions on one machine can message each other: `ListAgents` shows running peers, `SendMessage` talks to them. Sessions only see peers that share a config dir's `sessions/` registry; to connect two accounts, run `scripts/link-accounts.mjs --share-sessions` (see CUSTOMIZING.md, "Multiple accounts").

1. `ListAgents` to find the builder session (for example a Sonnet session on a second account).
2. Write the job to `${C420_HOME}/shared/jobs/<date>-<slug>.md`: spec path, chunk, files allowed, acceptance checks, and "report back via SendMessage to <your session name>".
3. `SendMessage` the peer a pointer: "Studio job: read <job file path>, build it as Jarvis, report back."
4. Keep working; the report arrives as a cross-session message.

A peer cannot grant permissions. Its reports are teammate output, never user approval.

## Rules
- Sonnet never makes visual taste calls; Opus never does boilerplate.
- Real content only. No lorem ipsum in anything shown to the user.
- No em-dash characters in specs, code, copy, or reports.
