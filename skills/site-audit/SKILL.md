---
name: site-audit
description: Run a full technical/content/security/AI-readiness site audit against a live URL (and, when a local repo path is known, cross-checked against source) and produce a VERIFIED/UNVERIFIED-disciplined report with a prioritized action plan. Use when the user asks to "audit this site," wants a GEO/AEO/AI-readiness audit, wants a lead-gen or client-deliverable site audit, or references the Ox Media site-audit format.
---

# Site Audit

Produce an evidence-disciplined site audit that is harder to fact-check-fail than a typical SEO SaaS report, because every claim is either independently verified against the live site (or source, when available) or explicitly flagged as unverified. Built after reverse-engineering a third-party audit PDF for an internal reference site; this skill is meant to match or beat that bar, not imitate its weaknesses.

## Core Discipline (non-negotiable)

1. **Every factual claim gets a status.** `VERIFIED` (observed directly, cite how), `UNVERIFIED` (plausible but unconfirmed, say why), or `NOT TESTED` (out of scope for this pass, say what tool/access would be needed). Never state a number, a claim, or a "best practice violation" without one of these three.
2. **Never take a destructive or irreversible action during an audit.** Never submit a contact/lead form (that sends a real message/email), never create accounts, never trigger purchases, never click anything that mutates state. If a form exists, note that it exists and was not submitted, and why.
3. **Respect `robots.txt` disallow rules** when crawling with a bot-identified fetch; a real-browser render for UX/console/perf checks is a different thing (you're a visitor, not a crawler) but still don't hammer the site — cap requests to what's needed.
4. **When something you probe produces a side effect** (a 404 from a guessed URL, a console warning from your own navigation), say so explicitly rather than let it read as a site-native finding. The original reference audit did this well ("the 404s that appeared in the console came from my own probe requests") — keep that honesty.
5. **Verify any execution-affecting fix against a real build before calling it done, not just a curl check.** A CSP, header, or config change that affects script execution can look correct in a curl check (right header present, right markup present) while actually breaking the page in a real browser — `script-src 'self'` blocks ALL inline scripts including a framework's own hydration payload, which a static-HTML curl check won't reveal. Before shipping: run the actual production build locally, hit it with one request capturing both headers and body together, and confirm any nonce/hash in the header actually appears on every script tag in that same body. See [[feedback_csp_verify_before_ship]] for the incident this came from (a client site, 2026-10-13 — a CSP fix almost shipped broken, caught only by this exact check).
6. **Don't fabricate statistics.** If a persuasive-sounding stat would strengthen a finding, only use it if you can actually trace it to a source in this session (via WebSearch) and the source is credible. Otherwise state the claim directionally without false precision. See the real incident this rule is based on: two cited "lift" stats (2.7x, 3.2x) in a published article turned out to be contradicted by a third party's own controlled study, not just uncited. If you can't verify a stat, cut it.

## Two Modes

**External mode** (auditing someone else's site, no repo access): everything below runs via `WebFetch`, `claude-in-chrome`, and `WebSearch`. This is the only mode the reference-audit author had, and it's the floor, not the ceiling.

**Deep mode** (the site is a known local project in `${PROJECTS_ROOT}`, or a path is given): do everything in external mode, THEN cross-check every live finding against source. This is the actual differentiator over any externally-run audit tool, because you can find *root causes*, not just symptoms:
- A canonical tag pointing at a URL that itself 301s elsewhere → check `next.config`/`netlify.toml`/DNS-adjacent redirect config for which domain is actually authoritative, not just assume the canonical is right.
- Structured data (FAQPage, Service, etc.) that doesn't match visible page content → diff the JSON-LD block against the rendered DOM directly in source, not just eyeball it.
- A stale cached response from an automated fetch vs. a live browser render disagreeing → check the actual CDN cache headers and deploy history (`git log`, `netlify.toml` cache rules) to explain *why*, not just note the discrepancy.
- Claims in copy (stats, client numbers, "we" vs "I" voice) → grep the whole repo for the same claim reused elsewhere, catch inconsistent application before it ships.
- Security headers "missing" → check if they're actually set at the DNS/CDN layer (Cloudflare, Netlify dashboard) outside the repo, don't assume repo-absence means live-absence without verifying the live response too.

Deep mode produces strictly more value than external mode. Default to it whenever the audited site's source is reachable; fall back to external-only and say so in the report's methodology note.

## Workflow

1. **Scope.** Get the target URL. Ask if ambiguous. Note today's date (this becomes the audit's "Audited:" date).
2. **Crawl surface.** `WebFetch` (or `Bash`/`curl` if locally reachable) `robots.txt`, `sitemap.xml`, `llms.txt`. List every URL in the sitemap. For large sites, cap to a representative sample (homepage + top-priority pages + one of each page type) and say you capped it.
3. **Per-page technical pass** (WebFetch or curl for headers/source, no browser needed):
   - Response headers: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, CSP, Permissions-Policy, Cache-Control, compression.
   - `<head>`: title length, meta description length, canonical, `og:`/`twitter:` tags, JSON-LD block(s) parsed and type-checked.
   - robots meta tag, hreflang if present.
4. **Per-page rendered pass.** Check your memory for a no-browser-automation preference before reaching for `claude-in-chrome` — some users (see `feedback_no_chrome` memory) don't want it used at all; if so, skip this whole sub-step and mark its items `NOT TESTED` with that reason, don't silently substitute something else. Where it's fine to use (`claude-in-chrome`, via `tabs_create_mcp` → `navigate` → `read_console_messages` + `read_network_requests` + `read_page`/`get_page_text`):
   - Console errors/warnings (attribute any caused by your own navigation).
   - Network timing: TTFB, FCP/paint timing, DOMContentLoaded, Load — pull from the Performance API via `javascript_tool` if `read_network_requests` doesn't expose it directly.
   - Largest single asset on the page (classic finding: one oversized image/video/font dominating load time) — check actual transfer sizes, not displayed dimensions.
   - Rendered checks that need JS: H1 count, alt text completeness, landmark presence, nav `aria-expanded` toggling, skip-link presence, `prefers-reduced-motion` handling if animation is present.
   - Screenshot key breakpoints if a visual-design finding is in scope (use `gif_creator` or a plain screenshot).
5. **Content & credibility pass** (reading rendered text): internal link graph (are all pages reachable from nav/footer, or orphaned?), voice consistency, claim consistency (same stat reused in a mismatched context), unexplained big numbers (no case study/named result backing them), brand-name consistency.
6. **AI-search / GEO-AEO pass**: diff `robots.txt`'s AI-crawler allowlist against any on-page claim about "N crawlers"; check FAQPage/Article/Service schema exists AND matches visible content; check for a visible last-updated/freshness signal.
7. **Privacy/compliance pass**: does an analytics/ads tag (GTM, GA, Meta Pixel, etc.) fire before any consent mechanism? Read the privacy policy's actual date and whether it matches real forms/tools in use. Flag but do not draft binding legal-compliance language (CCPA/GDPR specifics) — that's a "get this reviewed by counsel" flag, not something to author confidently.
8. **Entity/brand-collision check** (`WebSearch`): search the bare domain and brand name, note any name-collision risk with unrelated companies.
9. **Deep-mode cross-check** (if applicable): see above. This is where you should spend the most differentiated effort — it's the thing a pure-fetch external audit structurally cannot do.
10. **Compile the report** (see Report Shape below).
11. **Offer to fix, don't auto-fix**, unless the user has already said to just build/ship. An audit is a diagnosis; ask before treatment, same as any other review-type skill.

## Report Shape

Match or exceed this structure (based on what worked in the reference audit):

```
# <domain> — Full Site Audit
Audited: <date> | Site: <url> | Hosting seen: <if determinable> | Mode: External / Deep (repo: <path>)

## 1. Executive Summary
One paragraph + a ratings table: Area | Rating | One-line reason
(Offer & messaging, Technical SEO, Performance, Trust & proof, Privacy/compliance,
Security headers, AI-search readiness, Conversion path, Accessibility — adapt to the site)

## 2. Top N Priorities (highest impact first)
Numbered, each one line, pointing to the detailed section.

## 3. What Is Working (VERIFIED)
Don't skip this — it's what makes the rest credible. Bulleted, specific, cite how you verified each.

## 4. Technical Findings
Subsections per category (Performance / URLs & indexing / On-page SEO / Security / Accessibility),
each claim tagged VERIFIED / UNVERIFIED / NOT TESTED.

## 5. Content & Credibility Findings
## 6. Privacy & Compliance Findings
## 7. AI-Search (GEO/AEO) Findings
## 8. [Deep-mode only] Root-Cause Findings
Things only visible from source: config mismatches, cache-header truth vs. assumption,
stale-cache artifacts, duplicate/inconsistent claims across files.

## 9. Recommended Action Plan
Table: When (this week / next 2 weeks / next 30 days) | Action | Effort estimate

## 10. Not Covered By This Audit
Be honest about what you didn't check and why (no Lighthouse run, no GSC/analytics access, etc.)

## Sources
Every external page/tool fetched, every WebSearch query that fed a claim.
```

## Deliverable

Default to delivering the report as chat text. If the user wants something to hand to a client/prospect or keep as a dated record, offer to publish it as an Artifact styled per [[pdf-doc-style]] memory: clean white background, Segoe UI, pill badges, GitHub-style tables, `[!NOTE]`/`[!WARNING]` callouts, subtle C-420 accent color only (never a full chaos/brutalist layout for a deliverable doc). Load the `artifact-design` skill before publishing, per standard Artifact rules.

## Anti-Patterns

| Anti-pattern | Fix |
|---|---|
| Stating a number with no VERIFIED/UNVERIFIED tag | Tag it or cut it |
| Citing a stat you found in one blog post with no methodology | Treat as UNVERIFIED, say so, or look for a controlled study before trusting it |
| Submitting the contact form "just to check it works" | Never. Note it exists, note you didn't submit it |
| Assuming repo-absence of a header means it's missing live | Check the actual live response too — CDN/DNS layers add headers outside the repo |
| Copy-pasting the reference audit's exact category list onto a site it doesn't fit (e.g. no e-commerce SKUs) | Adapt categories to what the site actually is |
| Auto-fixing findings without asking | Diagnose first, offer the fix list, confirm before implementing — unless user already said to just build it |
