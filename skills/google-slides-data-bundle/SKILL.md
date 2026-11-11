---
name: google-slides-data-bundle
description: Prepare and self-check "bundles" for the Google Slides Data Program (Google/Dialectica/Human Edge Gemini slide-generation data contribution). Use when the user mentions "slide bundle", "golden deck", "Google Slides data program", "NotebookLM audit", "STYLE_TEMPLATE", "SOURCE_FILE", donating decks to Google/Gemini, or preparing Drive folders for a data-donation submission call. Covers building the golden deck via Gemini or via a local PPTX toolchain (Anthropic `pptx` skill / html2pptx, `pptx-from-layouts`, python-pptx OOXML edits) then converting to Google Slides.
origin: ECC
---

# Google Slides Data Program — Bundle Prep

Helps a company assemble, name, and self-check "bundles" of Google Slides material donated to Google's Gemini slide-generation training program (run with Dialectica & Human Edge). A bundle earns payment only if it clears a quality bar before the submission call — this skill exists to get it there without back-and-forth.

## When to Activate

- user says "build a slide bundle" / "prep a golden deck" / "get this ready for the Slides Data Program"
- organizing a Drive folder of GOLDEN_DECK_ / STYLE_TEMPLATE_ / SOURCE_FILE_ / PROMPT_ files
- writing or scoring the "prompt" component for a bundle
- running or interpreting a NotebookLM quality audit against bundle files
- building the golden deck locally from a brand template (`pptx` / html2pptx / `pptx-from-layouts` / python-pptx) then converting to Google Slides
- doing the pre-call "final checklist" pass

## What a Bundle Is

Four components, one Google Drive folder, clearly named:

| # | Component | Tag prefix | Notes |
|---|-----------|-----------|-------|
| 1 | Golden File — the finished deck | `GOLDEN_DECK_` | Google Slides format. Real, internal or external, Sales/Marketing/PM/Product Dev. Any size is fine. |
| 2 | Style Reference — visual baseline | `STYLE_TEMPLATE_` | Must also be **Google Slides format** — confirmed by the program team. A past presentation/design template with real slide layouts, not a text doc describing colors and fonts. If none exists, generate one via the Style Template Prompt below (default method) rather than hand-building a file. |
| 3 | Related Source Files — the context | `SOURCE_FILE_` | 2–10 files (docs/sheets/decks) that genuinely informed the deck's content. |
| 4 | Prompt or Description | `PROMPT_` | How you'd ask Gemini to generate the golden file. Must cover 7 elements (below). |

Every filename in the bundle folder must start with its tag prefix.

## Eligibility Gate (check first — reject-and-stop if any fail)

- Company has an active **paid** Google Workspace account.
- Deck category is Sales, Marketing, Project Management, or Product Development.
- Golden file is (or is converted to) **Google Slides** format.
- All content is in **English**.
- Not from legal, medical, education, or another regulated industry.
- Not a near-duplicate of another submitted bundle — content across bundles must be **≥70% unique**.

PII does not need to be scrubbed by the company — Google handles that. Don't spend time on it unless the user asks.

## Step 1 — Assemble the Bundle

1. Create one Drive folder per bundle, clearly named.
2. Rename every file with its tag prefix before uploading anything else.
3. Convert any non-Google file (`.pptx`, `.docx`, `.xlsx`) before it goes in the bundle:
   - Upload to Drive → right-click → Open with → matching Google app.
   - In that app: File → Save as Google Slides/Docs/Sheets.
   - Open the converted copy and check images, fonts, and alignment survived conversion.
   - Delete the original non-Google file from the bundle folder — never leave both versions in the folder.
4. Confirm source file count is between 2 and 10, and scales with deck size (a longer deck needs more backing material). Extra "unrelated but useful" context files are fine but don't count toward the 2–10.

## Step 2 — Quality Bar (deck & files)

Every golden deck should hit these before moving on:

- **Fully populated** — no blank templates, `TODO`, `TBC`, or unpopulated boilerplate anywhere.
- **Clean conversion** — if it came from Office, images/alignment/fonts must be inspected and fixed, not just "probably fine."
- **Generalist accessibility** — a non-specialist evaluator can follow the main structure/message.
- **Visual consistency** — one typography system, consistent alignment, margins, and color palette across every slide.
- **Scannability** — no walls of text; each slide's core message should land in ~5 seconds.
- **Narrative arc** — maps to a recognizable business archetype:
  - Pitch Deck: Problem → Solution → Ask
  - Status Update: Progress → Wins → Blockers → Action Items
  - (or an equivalent recognizable arc for the deck's purpose)
- **Balanced visual design** — real mix of graphics, diagrams, data viz, and text; not a monotonous bullet-list deck.
- **70% uniqueness** across the company's submitted bundles.

If the user is building/editing the actual slides (not just auditing), pull in `frontend-design`/`refactoring-ui`/`design-system` mental models for hierarchy, spacing, and palette — the same "no generic template" bar applies to slides as to web UI.

### Slide Design Quality Bar — read this before building or generating any deck

A deck can be factually accurate, correctly sourced, and pass every mechanical checklist item below and still fail because it looks generic. Generic is its own failure mode, separate from correctness — check for it explicitly.

**Banned patterns (the "templated" trap):**
- The same card shape, same corner radius, same shadow, same spacing repeated on every slide of a single deck
- One accent color used decoratively on everything (every heading, every number, every icon) with no semantic differentiation
- Applying one fixed layout "profile" mechanically to every slide in a deck — this can create variety *across* a batch of decks while producing monotony *within* each individual deck, which still reads as templated
- Icons that are crude geometric primitives (circle+line "magnifier," rectangle+lines "document") used as the default rather than a fallback when nothing better is available
- Uniform slide rhythm: title top-left, body centered, same margins, same two font sizes, slide after slide, with no scale contrast anywhere in the deck

**Required qualities — hit several per deck, and vary which ones show up slide to slide:**
1. Real scale contrast between hero numbers/headlines and supporting text
2. Deliberate rhythm — some slides dense, some spacious, matching the actual weight of their content
3. Depth or layering — overlap, background shapes, asymmetric composition, not everything centered in its own box
4. Typography with real character (weight and size contrast) even within one approved font family
5. Color used semantically (one meaning per color role), not the same accent color reused for every kind of emphasis
6. At least one slide per deck that breaks the grid the rest of the deck uses — a full-bleed number, an asymmetric or diagonal composition, an editorial moment
7. Real data visualization treated as a first-class design element, not a bullet list with numbers in it

**What went wrong the first time this was tried (for calibration):** a batch of 19 decks was generated via a custom renderer using 5 fixed layout "profiles" (Card-Grid, Timeline, Icon-Matrix, Document, Table), one profile per deck. This produced decks that were accurately sourced and correctly varied across the batch, and which passed every item on the mechanical checklist — but still read as generic, because each deck applied its one assigned profile uniformly to every slide inside it: same rounded-rectangle cards, one accent color doing every job, and crude autoshape icons standing in for real iconography. **Cross-deck structural variety does not substitute for within-deck compositional variety.** When building or generating decks:
- Vary layout slide-to-slide *within* a single deck, not only deck-to-deck across a batch
- Reference `frontend-design` / `refactoring-ui` / `top-design` for actual visual-direction thinking before writing render code — don't default straight to card/badge/timeline primitives
- If quality plateaus with a custom code-based renderer, prefer routing generation through Gemini directly — it demonstrated real depth in practice (logo/imagery integration, varied icon treatments, badge pills, asymmetric text/image compositions) that a fixed-primitive renderer struggled to match. Code-based generation guarantees factual uniqueness; it does not by itself guarantee design quality.

### When producing multiple bundles from one company (batches of 5+)

Topic uniqueness alone is not enough — **content, style, and layout structure must all vary across bundles**, or the decks read as duplicates to an AI evaluator even when the words differ (same skeleton, different topic = still a duplicate pattern). This applies even though every deck should stay within the company's real brand colors/fonts — vary the *structural approach*, not the brand identity.

Maintain a small rotation of distinct **visual/structural profiles** and assign a different one to each bundle (never reuse the same profile back-to-back):
- **Card-Grid Forward** — numbered card grids as the primary device, minimal timeline/icon use
- **Timeline/Process Forward** — a horizontal timeline or sequential-step rail as the central visual device
- **Icon-Matrix Forward** — icon-grouped sections instead of plain numbered cards
- **Document/Report Forward** — denser structured paragraphs with numbered headers instead of decorative cards (still must pass the 5-second scannability rule — use short paragraphs and clear headers, not walls of text)
- **Comparison/Table Forward** — tables or side-by-side comparison blocks as the central device

Bake the assigned profile directly into that bundle's `PROMPT_` (its own Format/style line), not just the shared style reference — otherwise Gemini defaults to whatever it generated last time. Match narrative arc to deck type as an additional differentiator: Pitch decks use Problem→Solution→Ask, status updates use Progress→Wins→Blockers→Action Items, roadmap/planning decks use Current State→Opportunity→Plan→Milestones, etc. — don't run the same arc across every deck in a batch.

## Step 2b — Generating STYLE_TEMPLATE via Gemini (default method when no past deck exists)

Don't hand-build a style-reference file. Instead, generate a real prompt describing the company's actual brand tokens (colors with hex codes, heading/body fonts, card/surface treatment, pricing-callout pattern, layout variety) and have the user paste it into Gemini (see generation notes below) to produce a short 6-8 slide reference deck. This keeps the file in genuine Slides format from the start instead of needing conversion.

### Template

```
Create a short 6-8 slide "Brand & Visual System" reference deck for [Company Name] in Google Slides. This is a style reference, not a pitch — it should visually demonstrate the brand's real design system so it can be used as a layout/branding baseline for other decks.

Structure:
Slide 1: Title — "[Company Name] Brand & Visual System — Reference Deck"
Slide 2: Color Palette — show each brand color as a labeled swatch block with its hex code: [list colors + hex codes]
Slide 3: Typography — one column for the heading font, one for the body font, each showing the font name large and a one-line description of where it's used: [heading font] / [body font]
Slide 4: Surface Treatment — 3 example cards side by side showing the card style (background, border, corner radius) with a numbered badge (01/02/03), a title, and placeholder body copy
Slide 5: Data/Pricing Callout Pattern — 2 example cards showing how a number or price is visually emphasized vs. supporting text
Slide 6: Layout Variety Reference — a grid of labeled boxes naming the different layout patterns available (e.g. Title+Body, Card Grid, Icon Grid, Timeline, Comparison, Centered CTA)

Style: dark/light background of [background color], body text in [text color], accent color [accent color] used for labels, numbers, and emphasis, headings in [heading font], body in [body font]. Keep every slide visually consistent with each other — this deck's whole purpose is to demonstrate consistency.
```

Pull the bracketed values from the company's real, live brand source (site CSS/design tokens, an existing style guide) — never invent colors or fonts that aren't actually in use.

## Step 2c — Building the Golden Deck locally (PPTX toolchain)

Gemini generation (see Step 3) stays the **default** for design depth. Reach for the local PPTX toolchain instead when:

- The company has a **real, well-designed brand template** (`.potx` / `.pptx`) — profile it and fill its actual slide-master placeholders instead of re-describing the brand to Gemini in prose.
- You need **reproducible, surgical edits** to an existing deck (fix one chart, swap a table, restyle one section) without regenerating the whole thing.
- Gemini keeps returning monotone / templated output and you need tighter per-slide layout control.
- You're producing a **batch** (5+) and want each deck's assigned structural profile enforced mechanically, not left to Gemini's memory.

Whatever path builds the deck, the golden file **and** the style template must still end up in **Google Slides format** — see Step 1.3 for the PPTX → Slides conversion and the mandatory post-conversion image/font/alignment check.

### Toolchains

Install whichever fits the job:

- **`pptx` (Anthropic skill)** — `/plugin install pptx@anthropic-skills`. Three workflows:
  - *html2pptx* — author each slide as HTML, convert with the `html2pptx` library. Ships with a content-informed design pass (palette selection, geometric patterns, typography, background treatments; 17 reference palettes) and thumbnail-grid validation. Best for from-scratch decks with **no** brand template.
  - *Template workflow* — `thumbnail.py` to grid the template visually, map the outline to specific template slides, `rearrange.py` to duplicate/reorder, `inventory.py` to pull every text shape + properties, generate replacement copy, `replace.py` to apply it while preserving formatting.
  - *OOXML edit* — `unpack.py` → edit slide XML → `validate.py` → `pack.py` for precise changes to an existing `.pptx`. Use `markitdown` to extract text/notes from a source deck.
- **`pptx-from-layouts`** — github.com/tristan-mcinnis/pptx-from-layouts-skill. Placeholder-driven, three steps:
  1. `python profile.py <brand-template>.pptx --generate-config` → `layout-catalog.md` describing the template's real slide-master layouts.
  2. Author the outline as markdown, tagging each slide with a visual type / `[HINT: layout_name]` — `hero-statement`, `process-N-phase`, `comparison-N`, `cards-N`, `table`, `timeline-horizontal`, `quote-hero`, etc. Typography markers: `{blue}`, `{bold}`, `{question}`.
  3. `python generate.py outline.md -o GOLDEN_DECK_<name>.pptx --template <brand-template>.pptx` — maps content into the template's **actual placeholders**, not text overlaid on a background image.
  - `python edit.py deck.pptx --inventory` for surgical edits to a finished deck.
  - Requires Python 3.10+, `python-pptx`, `pydantic`.

### Using the toolchain to beat the "templated deck" failure mode

The visual-type hints in `pptx-from-layouts` are the direct antidote to the Step 2 "one fixed profile on every slide" trap: **assign a different visual type to consecutive slides** so the deck's rhythm genuinely varies — e.g. `hero-statement` → `cards-3` → `timeline-horizontal` → `comparison-2` → full-bleed number → `table` — instead of `cards-N` slide after slide. Still hit several of the seven "required qualities" per deck, and vary which ones show up slide to slide. Run the same slide-to-slide-variety check on html2pptx output before moving on.

### Visual validation

After building — and **again** after the PPTX → Google Slides conversion — generate a **thumbnail grid** (`thumbnail.py`, or the profiler's render) and scan for: text cutoff / overflow, shape overlap, misaligned or reflowed placeholders, low-contrast text, and every-slide-looks-identical monotony. Fix anything caught before the deck goes near NotebookLM. This is now part of the Step 5 one-minute check, not optional.

## Step 3 — Write the Prompt Component

The prompt must read like an actual instruction to Gemini to generate this exact deck, covering all seven elements:

1. **Scope / topic** — what it's about.
2. **Audience** — who it's for.
3. **Length** — slide count / rough length.
4. **Structure** — section- or slide-by-slide breakdown.
5. **Source references** — name the source files and which section each feeds.
6. **Format / style** — text-vs-visual balance, data viz use, tone, branding.
7. **Purpose / objective** — the ask or goal.

### Template

```
I need to present to [audience] about [topic] — a roughly [N]-slide deck to [purpose/ask].
Keep it [style guidance: balanced text/visual, data-viz heavy, brand-styled, etc.].
Structure it as:

Slide 1: [Title / section]
Slides X–Y: [content] based on [source file name]
Slides X–Y: [content] based on [source file name(s)]
Slides X–Y: [content] based on [source file name]
```

If no source files are known yet, note that NotebookLM (Step 4) can suggest prompt content once files are uploaded — don't block on a perfect prompt draft.

### Generating the Golden Deck via Gemini — use the standalone app, not the Slides side panel

The Gemini side panel inside Google Slides ("Help me create") is unreliable for a full multi-slide deck — it commonly truncates to 2-4 slides instead of generating the full structure, and gets stuck asking to "confirm the presentation is accessible" with no way to unstick it besides reloading the tab. Default to **gemini.google.com** (the standalone app) instead: it reliably follows a full slide-by-slide structure and writes directly into a new Google Slides file.

Workflow:
1. Attach the `SOURCE_FILE_` docs + `STYLE_TEMPLATE_` deck to the Gemini chat (as files, not typed in).
2. Paste the `PROMPT_` text as the actual chat message (never attach the prompt as a file — Gemini treats attachments as reference material to read, not instructions to execute).
3. If it stalls or under-generates on the first pass, force it explicitly: *"Create exactly N slides. Do not summarize or condense — one slide per section."* Batching the request (e.g. 4 slides at a time, "continue" for the next batch) is more reliable than asking for all N slides in one message.
4. If the Slides side panel is the only option available and it gets stuck, the fix is usually: reload the Slides tab, reopen the panel, resend — not troubleshooting within the stuck session.

## Step 4 — NotebookLM Self-Check

Run this before the submission call. Required for a company's first bundles; recommended for all.

1. Create a new NotebookLM notebook.
2. Upload the whole bundle folder (Golden Deck, Style Template, source files, prompt draft) — upload directly from the Drive folder for compatibility, and keep the tag prefixes intact so NotebookLM can tell the Golden Deck from the Style Template from source files.
3. Paste one of the two audit prompts below into the notebook chat.
4. Fix every FAIL, then re-run the same audit prompt until it passes.
5. Save the final passing output as a doc **inside the same Drive folder** — this gets reviewed together on the submission call.

### Audit Prompt — Option 1 (recommended, needs an uploaded instructions doc)

Requires the company's own `EVALUATION_INSTRUCTIONS` doc uploaded to the notebook first. Then paste:

```
Read the file EVALUATION_INSTRUCTIONS and run the audit on the other files based exactly on those instructions
```

### Audit Prompt — Option 2 (shorter, no extra upload needed)

```
Audit the uploaded files against these strict quality standards:

1. Source Relevance Audit (Step-by-Step)
For EACH uploaded Related Source File, you must output a [PASS/FAIL] label and a brief justification answering: Does this source actually contain the knowledge or data used in the Golden Deck?

2. File & Narrative Quality
- Placeholders: Scan the Golden Deck for `TODO`, `TBC`, or blanks.
- Narrative: Does the Golden Deck follow a standard business arc (e.g., Pitch, Update)?
- Monotony: Are slides monotonous walls of text?

3. Donor Prompt Audit (If present)
Score the prompt on these 4 requirements [MET / NOT MET]:
- Audience: Is the target clear?
- Scope: Is the goal/topic clear?
- Structure: Is there a slide-by-slide flow?
- Referencing: Does it state which sources to use for which section?

OUTPUT FORMAT REQUIRED:
Status: [PASS / FAIL / INCOMPLETE]
Source Relevance: [Per-File Audit results]
Prompt Audit: [4 Requirements scorecard]
Action Plan: [Exact fixes needed]
```

No prompt draft yet? NotebookLM will still grade the slides/files and suggest prompt content based on what's uploaded — run the audit anyway.

## Step 5 — Visual "One-Minute" Check

NotebookLM checks content, not visual polish. Look at the golden deck yourself and answer:

1. **Clean and consistent?** Same look throughout (fonts, colors, spacing, margins)? If converted from PowerPoint/other, did anything break (shifted images, broken fonts, misaligned text)?
2. **Scannable?** Point of each slide graspable in <5 seconds without reading a wall of text?
3. **Varied and purposeful?** Layout fits what each slide shows, rather than every slide looking identical?
4. **Charts/tables clean?** Easy to read, no clutter (skip if the deck has none).
5. **"Beautiful"?** Modern, professionally formatted, intentional color/font use — not dated or messy?
6. **Placeholders survived conversion?** If built or edited via a PPTX toolchain: did the PPTX → Google Slides conversion keep every layout, or did placeholders reflow / shapes shift? Re-grid the thumbnails post-conversion and compare against the pre-conversion grid.

Any "no" here is a fix-it item even if NotebookLM passed the deck.

## Final Checklist (run before the submission call)

**Components & structure**
- [ ] All four components present (golden file, style reference, 2–10 source files, prompt)
- [ ] Source file count is 2–10 and matches deck size
- [ ] Everything is in one Drive folder, every filename tag-prefixed correctly

**Eligibility**
- [ ] Deck is Sales / Marketing / PM / Product Development
- [ ] Golden file is Google Slides format
- [ ] All content in English
- [ ] Not legal / medical / education / other regulated industry
- [ ] ≥70% unique vs. the company's other bundles

**Quality**
- [ ] No blanks, TODO, or TBC anywhere in the deck
- [ ] Passes the quality bar (consistent, scannable, clear narrative, balanced & varied)
- [ ] Prompt covers all 7 elements
- [ ] NotebookLM self-check has been run and its passing output saved in the Drive folder
- [ ] Visual one-minute check (6 questions) done on the golden file
- [ ] If built/edited via a PPTX toolchain: thumbnail grid checked pre- **and** post- PPTX → Slides conversion, no placeholder reflow

## On the Submission Call

Not an audit — a guided walkthrough with the Google/Dialectica/Human Edge team:
1. Review the saved NotebookLM self-check output together, confirm flagged items were fixed.
2. Quick visual pass (the 5 questions above).
3. Guided upload to Google's platform — confirm all four components, correctly labeled.
4. Fill in the **File Purpose** box: start with the deck type (Sales/Marketing/PM/Product Development), then a brief description of what it's about.

Payment is issued within 60 days of a bundle being confirmed accepted.

## Anti-Patterns to Avoid

- Uploading both the original Office file and its Google-format conversion into the same bundle folder (delete the original).
- Submitting `STYLE_TEMPLATE_` as a Doc/text description of the brand system instead of an actual Slides file — the program team requires it in Slides format like the Golden Deck.
- Writing a prompt that only covers scope/topic and skips audience, structure, or source references.
- Treating "passes NotebookLM" as done without running the manual visual check — NotebookLM cannot see layout quality.
- Padding source files past what the deck actually draws on, just to hit a number — each source must genuinely inform the deck.
- Submitting near-duplicate decks across bundles from the same company (fails the 70% uniqueness bar).
- Applying one fixed layout profile uniformly to every slide in a deck — passes the mechanical checklist while still reading as generic/templated. See "Slide Design Quality Bar" above.
- Treating "different topic" or "different profile than the last deck" as sufficient design variety — real variety has to show up slide-to-slide inside each individual deck, not just deck-to-deck across a batch.
- Shipping a deck straight out of html2pptx / `pptx-from-layouts` without the PPTX → Google Slides conversion **and** the post-conversion thumbnail re-check — the bundle requires genuine Slides format, and conversion can silently reflow placeholders.
- Using `pptx-from-layouts` but tagging every slide with the same visual type / `[HINT]` — that just reproduces the fixed-profile monotony the toolchain exists to prevent.
- Building locally when the company has no real brand template and no past deck — with nothing to profile, Gemini generation (Step 3) usually gives more design depth than from-scratch html2pptx.
