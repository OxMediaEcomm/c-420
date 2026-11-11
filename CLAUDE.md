# Schwiftyy Brain Starter — Claude Code Config

**Default Model: Sonnet** — Always start sessions on Sonnet 5. Never launch with or default to Opus. User switches manually if needed.

**No em-dashes, ever.** Not in chat replies, not in blog/article drafts, not in commit messages, not in code or docs. This has slipped specifically in long-form content writing (articles, blog posts) despite the rule already existing below. Treat long-form prose as the highest-risk spot for this, and proofread for "—" before sending. Use a comma, colon, parenthesis, semicolon, or a new sentence instead.

@memory/learned-triggers.md

---

## Project Locations

**Canonical root: `${PROJECTS_ROOT}` (e.g. `C:\Users\YOUR_USERNAME\Projects\`)** — all websites live here. Never hunt.
Full index with paths, URLs, GitHub remotes: memory `project_workspace.md` (always loaded via MEMORY.md).

| Project | Path | Live |
|---------|------|------|
| Example Client Site A | `Projects\example-client-a` | example-a.com |
| Example Client Site B | `Projects\example-client-b` | example-b.com |
| Example Marketing Site | `Projects\example-marketing-site` | Netlify |
| Example Tool Site | `Projects\example-tool-site` | example-tool.com |
| Example Product | `Projects\example-product` | Phase 3 pending |
| Mission Control | `${PROJECTS_ROOT}\mission-control` | port 3737 |

Replace this table with your own projects, or delete it if you don't need a fixed index.

**Config vault:** `${CLAUDE_CONFIG_DIR}` (e.g. `C:\Users\YOUR_USERNAME\.claude\`) — root `.claude` may be a symlink to this vault. Active memory store = `${CLAUDE_MEMORY_STORE}` only (configure your own name). Retire old stores you no longer use.

---

## Communication Protocol (optional persona pack)

By default this config uses a plain, neutral assistant voice. An optional example persona ships in `skills/chaos-protocol/` (sci-fi chaotic energy, Rick & Morty-style framing of technical concepts) to show how to build your own — it is **off by default**.

**To enable it:** say "turn on chaos mode" (or add a line here making it always-on, the way the example persona's own SKILL.md describes).
**To disable again:** "normal mode" / "drop the chaos".

Whatever persona you run, keep this rule: **persona never applies to security warnings, destructive-operation confirmations, quoted error messages, code blocks, or commit messages.** Those stay plain and clear regardless of voice.

---

## Skills

Skills live in `${CLAUDE_CONFIG_DIR}\skills\`. They auto-trigger based on context — no slash commands needed.

### Always-On
| Skill | What It Does |
|-------|-------------|
| `caveman` | ~75% token reduction, stays active until "stop caveman" |
| `continuous-learning-v2` | Always-on — observes tool-use via PreToolUse/PostToolUse hooks, builds project-scoped instincts |

### Optional Persona Pack
| Skill | What It Does |
|-------|-------------|
| `chaos-protocol` | **Off by default.** Example persona — sci-fi chaotic energy, Rick & Morty-style framing. See `skills/chaos-protocol/SKILL.md` for how to enable it, or use it as a template for your own voice. |

### Development & Security
| Skill | What It Does |
|-------|-------------|
| `coding-standards` | Universal TS/JS/React/Node code quality rules |
| `tdd-workflow` | Tests first, 80%+ coverage enforcement |
| `verification-loop` | Build → type check → lint → tests → security → diff pipeline |
| `security-review` | Security checklist for auth, APIs, secrets, input validation |
| `security-scan` | Scan `.claude/` config for vulnerabilities |
| `database-migrations` | Supabase/PostgreSQL migration patterns + RLS |
| `deployment-patterns` | CI/CD, Docker, Railway, Netlify, production readiness |
| `backend-patterns` | Node.js/Express/FastAPI architecture, service layers, caching |
| `api-design` | REST API patterns, pagination, error handling, versioning |
| `system-design` | Distributed system architecture and capacity planning |
| `python-patterns` | Python idioms, async, FastAPI, data structures |
| `python-testing` | pytest, fixtures, coverage, parametrize |
| `blueprint` | Multi-session project planning with adversarial review gate |

### Design & Frontend
| Skill | What It Does |
|-------|-------------|
| `WebDevOn` | Next.js production playbook (design tokens, real-content sourcing, contact-form hardening, the standard admin-panel + prod-seeding + full-copy client CMS pattern, Drizzle/Supabase/Prisma auth patterns, CSS/animation gotcha catalog) — distilled from real client work. Use as a starting point and rename/restock with your own lessons as you build. |
| `frontend-design` | Production-grade web UI with real visual direction |
| `refactoring-ui` | Audit and fix visual hierarchy, spacing, color in web UIs |
| `web-typography` | Font pairing, typographic scale, web font loading |
| `microinteractions` | Button feedback, loading states, interaction polish |
| `design-system` | Generate or audit design systems and style tokens |
| `accessibility` | WCAG 2.2, ARIA, screen reader, keyboard nav |
| `browser-qa` | Visual testing and UI verification via browser automation |
| `seo` | Technical SEO, structured data, Core Web Vitals |
| `site-audit` | Full technical/content/security/AI-readiness site audit with VERIFIED/UNVERIFIED discipline — external mode (fetch/browser only) or deep mode (cross-checked against local repo source). |
| `gsc-indexing-audit` | Multi-domain Google Search Console indexing-blocker sweep: property-type/host mismatch check, reason-code triage, account-wide quota awareness. Built 2026-11-05. |

### Research & Content
| Skill | What It Does |
|-------|-------------|
| `graphify` | Any folder → interactive knowledge graph → HTML + JSON |
| `deep-research` | Multi-source cited research reports |
| `exa-search` | Neural web search via Exa MCP |
| `brand-voice` | Source-derived voice profile for consistent writing |
| `content-engine` | Social posts, threads, cross-platform content systems |
| `article-writing` | Long-form content and blog posts |

### Session Management
| Skill | What It Does |
|-------|-------------|
| `strategic-compact` | Smart context compaction at logical session boundaries |

### Data Contribution
| Skill | What It Does |
|-------|-------------|
| `google-slides-data-bundle` | Prep/self-check "bundles" for the Google Slides Data Program (golden deck + style ref + source files + prompt, NotebookLM audit) |

---

## Auto-Trigger Rules

These fire automatically based on what's being worked on.

### Always On (background)
| Signal | Action |
|--------|--------|
| Everything | `caveman` mode — always active, ~75% token reduction |
| Any new phrasing that maps to a skill | Save to `memory/learned-triggers.md` (vocabulary trigger store, hand-curated index loaded by this CLAUDE.md) |
| Tool-use pattern (correction, repeated workflow, error→fix) | Captured automatically by `continuous-learning-v2` hooks into `~/.claude/homunculus/` instincts — no manual save needed |
| User corrects a skill selection | Log to learned-triggers.md immediately AND adjust in-session |
| End of session where a new pattern was learned | Report what was saved, promote if threshold met |

### Token / Session Management
| Signal | Action |
|--------|--------|
| "stop caveman" | Deactivate `caveman` mode for this session |
| "hell yeah" / "get that shit started" / "let's go" / "yes" | Proceed immediately — skip discussion |
| "hell yeah" / "get that shit started" / "let's go" / "yes" | Proceed immediately — skip discussion |
| "sounds freacking amazing" / "sounds amazing" | Maximum chaos energy, build it |
| Session approaching context limit | Suggest `/compact` via `strategic-compact` |

### Security (mandatory — no exceptions)
| Signal | Skill |
|--------|-------|
| Any auth code (login, signup, session, PKCE, OAuth) | `security-review` |
| Any payment / Stripe / subscription code | `security-review` |
| Any webhook handler | `security-review` |
| "is it secure?" / "security check" / "lock it down" | `security-review` |
| Modifying `.claude/` settings or CLAUDE.md | `security-scan` after changes |

### Development
| Signal | Skill |
|--------|-------|
| New feature being built | `tdd-workflow` — tests first |
| Writing or editing test files | `tdd-workflow` |
| "verify it works" / "does this work?" / "make sure this works" | `verification-loop` |
| After any API endpoint is written | `verification-loop` |
| After any database migration | `verification-loop` |
| Before creating a PR | `verification-loop` |

### Code Quality
| Signal | Skill |
|--------|-------|
| Starting a new project or module | `coding-standards` |
| Code review or refactor | `coding-standards` |

### Codebase Understanding
| Signal | Skill |
|--------|-------|
| "map the codebase" / "knowledge graph" / "map it out" | `graphify` |
| Opening an unfamiliar repo for the first time | `graphify` (recommended) |
| "merge graphs" / "combine graphs" / "diff graph" / "graphify dedup" | `graphify` |

### Design & Frontend
| Signal | Skill |
|--------|-------|
| "WebDevOn" / working in a Next.js marketing/storefront/admin repo | `WebDevOn` |
| "build a site" / "landing page" / "web component" / "HTML page" / writing `.html` or `.css` | `frontend-design` |
| "UI looks off" / "fix the design" / "visual hierarchy" / "spacing" / "color palette" / "looks bad" | `refactoring-ui` |
| "font pairing" / "typography" / "typeface" / "line height" / "web fonts" / "variable fonts" | `web-typography` |
| "microinteraction" / "button feedback" / "loading state" / "toggle design" / "interaction polish" | `microinteractions` |
| "design system" / "visual audit" / "style consistency" / "design tokens" / "component library" | `design-system` |
| "accessibility" / "a11y" / "WCAG" / "screen reader" / "ARIA" / "tab order" | `accessibility` |
| "verify the UI" / "test the page" / "visual regression" / "QA the frontend" | `browser-qa` |
| "SEO" / "meta tags" / "search visibility" / "sitemap" / "structured data" / "Core Web Vitals" | `seo` |
| "audit this site" / "full site audit" / "GEO/AEO audit" / "AI-readiness audit" / "run a site audit on [X]" | `site-audit` |
| "check GSC" / "GSC sweep" / "indexing audit" / "why isn't this page indexed" / "GSC quota" / resuming a prior GSC pass | `gsc-indexing-audit` |

### Architecture & Planning
| Signal | Skill |
|--------|-------|
| "system design" / "scale this" / "high availability" / "distributed" / "capacity planning" | `system-design` |
| "API design" / "REST API" / "API contract" / "API versioning" / "resource naming" | `api-design` |
| "backend architecture" / "service layer" / "repository pattern" / "middleware" / "caching" | `backend-patterns` |
| "plan this out" / "blueprint" / "multi-session" / "roadmap for" / "complex feature" | `blueprint` |
| Writing or editing `.py` files | `python-patterns` (before writing) |
| Writing or editing `test_*.py` / `*_test.py` files | `python-testing` (before writing) |
| "deploy" / "Railway" / "Netlify" / "CI/CD" / "Docker" / "push to prod" | `deployment-patterns` |
| "migration" / "RLS" / "schema change" / "Supabase table" | `database-migrations` + `security-review` |

### Research & Content
| Signal | Skill |
|--------|-------|
| "research" / "deep dive" / "investigate" / "what's the current state of" / "find sources" | `deep-research` |
| "search for" / "look up online" / "find examples" / "latest news on" | `exa-search` |
| "X post" / "tweet" / "LinkedIn post" / "social content" / "thread" / "content calendar" | `content-engine` |
| "write in my voice" / "brand writing" / "content in my tone" / "voice consistency" | `brand-voice` |
| "write an article" / "blog post" / "long-form" / "newsletter" | `article-writing` |

### Data Contribution
| Signal | Skill |
|--------|-------|
| "slide bundle" / "golden deck" / "Slides Data Program" / "NotebookLM audit" / "STYLE_TEMPLATE" / "SOURCE_FILE" / donating decks to Google/Gemini | `google-slides-data-bundle` |

---

## Hard Rules

- Never hardcode secrets — environment variables only (e.g. 21st-dev MCP key lives in `TWENTYFIRST_API_KEY`, read by `~/.claude/mcp-servers/21st-magic-wrapper.cmd`)
- Never skip `security-review` on auth, payment, or webhook code
- Never mark a task complete without running `verification-loop`
- Never commit without asking the user first
- Never force push
- Always use parameterized queries — no raw SQL string concatenation
- No `console.log` or `print()` debug statements in committed code
- Never use em-dashes (—) in any output, code, docs, or artifacts. Use commas, colons, parentheses, semicolons, or a new sentence instead.

---

## Memory Architecture

Three distinct stores. Don't conflate them.

### 1. Vocabulary triggers — `~/.claude/memory/learned-triggers.md`
- Hand-curated table of "phrase → skill/action" mappings (e.g. "hell yeah" → proceed)
- Loaded into every session via `@memory/learned-triggers.md` at the top of this file
- **Write here when:** user invents a new phrasing for a skill, or corrects a skill selection
- Promote to the Auto-Trigger Rules tables once `seen:3` is hit

### 2. Project / user / feedback / reference memory — `${CLAUDE_MEMORY_STORE_PATH}` (e.g. `~/.claude-memory-store/projects/<encoded-cwd>/memory/`)
- The auto-memory system (managed by the harness). Indexed by `MEMORY.md`, individual files per memory
- **Write here when:** you learn something about the user, a project, a workflow preference, or an external reference (Linear board, Grafana dashboard, etc.)
- Always read `last_session.md` first on "pick up", "resume", "where were we"
- This is the SOURCE OF TRUTH for cross-session recall

### 3. Behavioral instincts — `~/.claude/homunculus/` (via `continuous-learning-v2`)
- Auto-populated by PreToolUse / PostToolUse hooks observing every tool call
- Atomic "instincts" with confidence scoring (0.3 tentative → 0.9 near-certain)
- Project-scoped by default (per git remote hash); promoted to global at 2+ projects with ≥0.8 avg confidence
- **Manual writes are rare** — the system learns. Use `/instinct-status`, `/evolve`, `/promote` to inspect and refine
- Observations are scrubbed for secrets before persisting

### Decision rule
- **User said it in chat** (a phrase or preference) → store 1 (vocabulary) or 2 (preferences/facts)
- **Tool behavior pattern** (you grep before edit, you fix this kind of bug this way) → store 3 (instincts, automatic)
- **Project state** (where we left off, what's next) → store 2 only

---

## Session Continuity Protocol

**ALWAYS read `memory/last_session.md` at the start of any session where the user says "pick up", "resume", "where were we", or similar.**

### last_session.md — Rolling Save Rules

`last_session.md` must be updated:

1. **At session end** — whenever significant work was done (the Stop hook fires as a reminder, but Claude must write the content before stopping)
2. **Every ~5% of context burned after 80% usage** — approximated as: after every block of 5+ tool calls once the conversation is long, do a quick `last_session.md` write
3. **Immediately when a compaction warning appears** — save before anything else, the context is about to get chopped
4. **After any major milestone** — feature shipped, blocker resolved, plan changed

### What to write in last_session.md

```
- Updated: <date>
- Project: <name + path>
- Session goal: <what user asked for>
- What we did: bullet list of completed work
- Exactly where we stopped: precise state, not vague
- What to do FIRST next session: top 1-3 actions
- Open questions / blockers: anything waiting on user or external
- Files most recently touched: paths
```

### Context burn awareness

When the conversation has become long (many tool calls, lots of back-and-forth), treat it as 80%+ burned. At that point:
- Update `last_session.md` after every significant action block (5+ tool calls)
- Proactively suggest `/compact` to the user
- Never let a session end without a fresh `last_session.md`
