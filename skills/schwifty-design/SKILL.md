---
name: schwifty-design
description: Auto-activate the 4-phase design build pipeline (Research → Concept → Build → Polish) whenever the user describes starting, designing, building, mocking up, or scaffolding any website, landing page, microsite, app UI, dashboard, marketing site, component library, design system, or client design project. Trigger on phrases like "let's design", "build a site for", "new website for", "design a landing page", "mock up a UI", "start a design project", "new client project", or any kickoff that describes a visual/frontend product from scratch. Skip when the user is editing an existing component, fixing a bug, refactoring, or doing isolated CSS tweaks — this is for project-scale work, not single-file edits.
---

# /schwifty-design — DIMENSION C-420 DESIGN PIPELINE

A 4-phase design build, each phase a portal jump. Auto-advance through mechanical steps; pause only at real decision points (taste, direction, scope). Default project root: `${CLIENT_PROJECTS_ROOT}\<project-name>` (configure your own path).

## When this skill auto-activates

**Fire it when the user describes:**
- "Let's design a [site / landing page / app / dashboard / microsite]"
- "I want to build a website for [client / product]"
- "New design project — [description]"
- "Mock up a [hero / landing / product page]" at project scope
- Anything that implies starting a frontend product from blank

**Do NOT fire when:**
- They're editing a single existing component
- Bug fix, refactor, or CSS tweak on existing code
- They explicitly say "no pipeline" / "just quick" / "one-off"
- The work is backend, infra, scripts, or non-visual

**On activation:** announce the portal jump in one sentence ("Sounds like a design project — firing /schwifty-design pipeline, portal 1 incoming"), then proceed to Step 0. If the user pushes back, drop the pipeline and continue normally.

---

## Step 0 — Project kickoff (always ask)

Ask the user (use `AskUserQuestion` when there are clear options, plain prompts otherwise):

1. **Project name** (becomes folder name under `Client Projects\`)
2. **What is this** — one sentence: product, audience, surface (landing page? app? microsite? component lib?)
3. **Any references** — figma URL, screenshots, sites they love, brand assets path
4. **Tech stack** — Next.js / Astro / plain Vite / something else, and styling layer (Tailwind / vanilla CSS / CSS Modules)
5. **Confirm path** — default is `${CLIENT_PROJECTS_ROOT}\<name>` unless they override

Create `${CLIENT_PROJECTS_ROOT}\<name>\` and write a `DESIGN_BRIEF.md` capturing the answers. This is the source of truth for the whole pipeline.

Initialize a task list with 4 entries — one per phase. Mark each `in_progress` when starting, `completed` when its decision-point gate is passed.

---

## Phase 1 — RESEARCH (portal: GitHub + refs)

Goal: don't write a single line of code until we know what already exists.

Run in parallel:
- `gh search repos` + `gh search code` for the product type + style direction
- Context7 lookup for any libraries the user mentioned (Three.js, GSAP, Framer Motion, shadcn, etc.)
- If the user dropped a figma URL → fetch it via the Figma MCP `get_design_context`
- npm/registry check for any utility libs that solve >80% of a likely problem

Produce a `RESEARCH.md` in the project folder with:
- 3-5 reference projects (with what to steal from each)
- Library/framework decisions, locked
- Any adaptable starter / skeleton worth cloning
- One clear "we are NOT going to do X" list (anti-template)

**Decision-point gate:** Show the user the top 3 references + the proposed stack + the "not doing" list. Ask: *"Lock this direction or pivot?"*

Do not advance until user gives a go-signal ("hell yeah", "lock it", "yes", or similar).

---

## Phase 2 — CONCEPT (portal: Claude.ai with Opus)

Goal: nail the visual direction before any real-repo code lands.

Tell the user explicitly:
> "Portal jump — this phase happens in Claude.ai with Opus 4.7. I'll generate the prompt; you paste it into a new Claude.ai conversation, iterate on 2-3 artifact variants there, then bring the winner back to me."

Generate a **concept brief prompt** for them to paste into Claude.ai. It must include:
- The product summary + audience
- The stack decisions from Phase 1
- The anti-template patterns from `~/.claude/rules/web/design-quality.md` (banned defaults, required qualities)
- A request for 2-3 distinct artifact directions with real opinion (e.g. editorial vs neo-brutalist vs bento)
- Explicit ask for design tokens (colors, type scale, spacing scale, motion timings) as CSS custom properties
- Ask Claude.ai to output each direction as a self-contained HTML+CSS artifact

When the user returns with the winning artifact, save it to `concept/winning-artifact.html` in the project folder. Extract:
- Design tokens → `concept/tokens.css`
- Type pairings, palette, motion timings → `concept/system-notes.md`

**Decision-point gate:** Confirm the extracted tokens + system notes match the user's intent before scaffolding. Ask one question max: *"Tokens locked, ready to scaffold?"*

---

## Phase 3 — BUILD (portal: CLI with Sonnet)

Goal: port the concept into the real repo, wired up properly.

Auto-advance through these — no check-ins unless something breaks or a taste call appears:

1. Scaffold the project per the stack chosen in Phase 1 (Next.js init / Astro / Vite — use the right `create-` command)
2. Drop `concept/tokens.css` into the project's styles entry and wire it to `:root`
3. Apply the file organization from `~/.claude/rules/web/coding-style.md` (feature folders, not file-type folders)
4. Build the components from the artifact, one feature folder at a time
5. Wire motion (CSS-first; reach for Framer Motion / GSAP only when justified)
6. Run the verification-loop skill: type check, lint, build
7. Run security-review on any auth/form/webhook code (mandatory per CLAUDE.md hard rules)

Use TDD where it makes sense (utilities, hooks, data transforms). Visual components → visual regression via Playwright screenshots over brittle markup tests.

**Decision-point gate:** Take Playwright screenshots at 320/768/1024/1440 and show the user. Ask: *"Ship this to Polish or kick back for changes?"*

---

## Phase 4 — POLISH (portal: escalate to Opus when needed)

Goal: the difference between "looks fine" and "looks intentional."

Walk the component checklist from `~/.claude/rules/web/design-quality.md`:
- Hover/focus/active states designed?
- Hierarchy through scale contrast?
- Both themes intentional (if dual-theme)?
- Would this look believable in a real product screenshot?

For any component that fails the checklist, escalate the taste call to Opus (tell the user: *"This hero feels generic — I'm pulling Opus in for this one"*) and redo just that surface.

Final pass:
- Core Web Vitals check against budgets in `~/.claude/rules/web/performance.md`
- Accessibility scan (axe or Playwright a11y)
- CSP + security headers if it's a deployable site
- Update `DESIGN_BRIEF.md` with what shipped vs. what was scoped out

**Decision-point gate:** Final screenshots + Lighthouse report. Ask: *"Ship it, or one more polish pass?"*

---

## Cross-phase rules

- **Save state to `memory/last_session.md` after every phase gate** — the design pipeline is the kind of multi-session work that *will* get picked back up later
- **Never advance a phase without the user's go-signal at its gate.** Mechanical sub-steps within a phase auto-run; phase boundaries require approval
- **If the user says "skip to phase N"** — honor it, but note in `DESIGN_BRIEF.md` what was skipped and why
- **Caveman + chaos-protocol stay on** for all communication. Plain mode only for security warnings, error quotes, and commit messages (per CLAUDE.md)
- **Project folder is the source of truth** — `DESIGN_BRIEF.md`, `RESEARCH.md`, `concept/`, `src/`. Don't scatter state across the conversation

## Resuming a project

If the user says "resume schwifty-design <name>" or similar:
1. Read `${CLIENT_PROJECTS_ROOT}\<name>\DESIGN_BRIEF.md`
2. Read the latest phase artifact (RESEARCH.md, concept/*, or src/)
3. Check `memory/last_session.md` for where the gate was last held
4. Summarize in 3 bullets where things stand and what the next gate is
5. Ask for the go-signal to continue
