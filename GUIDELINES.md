# Comini Numeracy Interactive Explainers — Build & Evaluation Guide

Read this before building any new concept interactive in this folder. It captures what we learned building the first one (Stage 2, equal groups & arrays multiplication) across several rounds of feedback. After building a new interactive, a sub-agent should evaluate it against the checklist near the bottom before it's considered done.

## What these are

- Step-by-step, narrated, play/pause-able visualizations of **how** a single numeracy concept works, for one benchmark from the Comini numeracy sequence (2-13 years).
- Audience, in priority order: **educators** (understand it themselves, then demo it live on a tablet), **parents** (same needs, less pedagogical vocabulary to lean on), **kids** (almost always with an adult driving, rarely self-directed).
- **Not intrinsically motivating by design.** No points, streaks, mascots, or reward loops. Someone already wants to explore the concept (a class, a real question like pricing a babysitting rate) before they open this. The tool's only job is to expose the *process* a kid — or ChatGPT — would otherwise skip straight past to get an answer.

## Before you build

1. **Scope to exactly one benchmark.** A stage/age band (e.g. "Stage 2 multiplication") usually covers several distinct benchmarks (times-table fluency, multiply by 10 via place value, commutative property, distributive property, equal groups & arrays, ...). Confirm which one with the user before building — picking wrong burns a whole build-and-review cycle.
2. **Design language:** currently we keep the long-division piece's original system (Fraunces + Manrope + JetBrains Mono, warm paper texture, cream/ink palette) for every new interactive. The Comini Curriculum Resource Hub screenshot style was requested once but explicitly deferred, not adopted. Don't switch without asking again.
   - **Alternate template:** the addition series (`stage2-addition-2digit-no-regrouping`, `stage3-addition-3digit-regrouping`) uses a different, app-shell-style layout instead of this file's marketing-page anatomy — see `APP-SHELL-LAYOUT.md` in this folder. It's a per-series choice, not the new default: ask the user which template a new piece should use rather than assuming either one.
3. If pulling the benchmark's exact wording from the Google Sheet numeracy sequence via WebFetch, note that it's a lossy/summarized read of a huge multi-tab sheet (small-model summarization). Treat it as directionally useful, not authoritative, and flag that to the user.

## Structural template to reuse

Page anatomy (from the long-division / Stage 2 multiplication pieces):
- Header: eyebrow row ("An interactive math helper" + a stage/age pill), Fraunces headline with one italic accent word, italic tagline.
- Input card: numeric inputs + operator symbol between them, Visualize + Play-all buttons, a preset row of common examples.
- "Working answer" card: a persistent equation display with a `?` placeholder until the designated reveal step (see below).
- Legend row explaining visual conventions (colors/shapes used).
- Workspace card: the actual visualization, swapped per step.
- Narration box: one sentence per step, using `K()` (bold keyword) and `Q()` (mono chip) span helpers.
- Controls row: Previous / Next / Restart + step counter, plus keyboard arrows and space-to-play.
- Footer: "How to read this" 3-item grid, then the standard Comini branding block (logo, links) — copy this verbatim.

JS conventions:
- One `generateSteps(...)` function that returns an array of plain step-snapshot objects (a `snap()` helper with defaults, spread per step). Keep all pedagogical logic here, not scattered through render functions.
- `renderStep()` dispatches to view-specific renderers based on a `step.view` field, and independently sets the narration text and the top answer-card text from step flags.
- Reuse the base color tokens (`--ink`, `--paper`, `--card`, `--line`, etc.) and add 2-3 concept-specific tokens (e.g. `--group`/`--item`/`--row` for the multiplication piece) rather than inventing a new palette from scratch.

## Pedagogical sequencing principles (hard-won, from 3 rounds of reordering)

- **The reveal must come from the operation being taught, not from a representation change.** Our first draft revealed the total while switching to the array view, which felt like the answer appeared incidentally. Final order: show the concrete objects → do the actual operation that answers "how many" (repeated addition) → introduce the shortcut notation for that operation (multiplication) → introduce alternate representations of the same fact (array) last, framed as "another way to see this."
- **Don't leak the answer before its designated step.** The top "Working answer" card should show only `groups × perGroup = ?` until the specific step whose job is to reveal it — never a progressively-filling partial sum during earlier build-up steps.
- **Separate scratch work from the answer.** Move intermediate/working totals into an in-workspace callout (mirrors the long-division piece's bucket-header callout), not the top answer card. The top card stays binary: unrevealed vs revealed.
- **Match instruction verbs to what's actually happening at that step.** Steps that just show/build objects use neutral language ("Here's the second group of 4"), not the verb for an operation that hasn't happened yet ("Add the second group..."). Only the step that performs an operation gets that operation's verb.
- **Don't smuggle in adjacent concepts.** We initially added skip-counting narration as reinforcement during group building; it was explicitly asked to be removed because it wasn't the benchmark being taught. Stay tight to the one scoped concept.
- **Every reveal-worthy step needs consistent visual reinforcement.** A missing callout on one step (while sibling steps have one) reads as a bug, not a deliberate choice — check every step that reveals or restates the answer has one.
- **Stagger equation reveals token by token**, not as a single jump-cut. CSS: base rule `opacity: 0`, `animation: fadeIn .35s ease forwards`, per-token `animation-delay` in ~150-200ms increments. Keep total sequence duration comfortably under the play-mode step interval (2400ms here) even at max input values.

## Copy rules

- **No em dashes, anywhere** (headline, tagline, footer, narration strings, placeholders) — rephrase with periods or commas instead. This is a hard style rule, checked every round.
- En dashes are a different, legitimate character for numeric ranges (e.g. "Ages 6–7") — don't touch those.
- Honor user-provided wording closely when they give it verbatim; adapt only for internal consistency (e.g. matching the casing/style already used for the same term elsewhere in the piece).
- Narration needs to be precise enough to double as the educator's own refresher, not just child-friendly copy.

## Verification checklist (run every time; a sub-agent should check every box against a fresh interactive)

- [ ] Full step trace done via `javascript_tool`: click Next through every step, capture `{step, narration, answer, callout, view}` at each, and confirm it matches the intended sequence and wording — don't eyeball it, read the actual DOM state.
- [ ] Answer-card placeholder (`?`) holds through every step until the one designated reveal step; revealed value is correct from then on.
- [ ] Every step meant to reveal or restate the answer has its callout/visual reinforcement present — none silently missing.
- [ ] Instruction language matches the operation happening at that exact step (no premature operation verbs; no leftover concept language the user asked removed).
- [ ] Grep for em dashes (`—`) returns nothing; any remaining en dashes are legitimate numeric ranges.
- [ ] Mobile check: resize to 375px width, drive the interactive to its worst-case inputs (max values on all fields), step through everything, confirm zero horizontal overflow at any step.
- [ ] Console is clean (`read_console_messages`) after load.
- [ ] Both presets and manual input validation (out-of-range values) are exercised.
- [ ] If deployed, re-run the trace against the **live URL**, not just the local file — a publish "success" log is not proof the live page matches.

## Tooling notes

- The Browser pane's `computer` screenshot action can time out if the pane isn't actually displayed. Prefer `read_page` / `get_page_text` / `javascript_tool` DOM inspection for verification instead of screenshots.
- Wrap every `javascript_tool` script in an IIFE (`(function(){ ... })()`). Top-level `const`/`let` persists across separate calls in the same tab and a rerun will throw "already declared."
- Navigating a tab from a remote origin to a local `file://` URL can silently open a **new** tab instead of reusing the old one. Re-check `tabs_context` after navigating to confirm which `tabId` actually has the page you expect.
- here.now: the `claimToken` for an anonymous site is only returned on its **first** publish — save it. A later `state.json` can lose it silently (empty `claim_url` in the publish result), causing "Unauthorized. Provide claimToken" on the next redeploy; pass `--claim-token` explicitly if that happens.
- File layout: one folder per interactive, with `index.html` at that folder's root (not a flat `.html` file) — required for here.now to serve it as a real page instead of a raw-file auto-viewer, and matches how the other MFEs in this repo are structured.
- Redeploy to the same slug after every change (standing instruction), then verify the change on the **live** URL via a DOM trace, not just the publish command's exit output.

## Open decisions carried forward

- Hub-style redesign (matching the Curriculum Resource Hub screenshot) is deferred, not abandoned. Revisit only if asked.
- Hosting destination (standalone here.now links vs. embedded in Facilitator Guides) is undecided.
