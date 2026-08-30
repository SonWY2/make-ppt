---
description: Apply pending local presentation review feedback to source while preserving approved geometry.
---

Read `.omp/skills/presentation-design/SKILL.md`, `.omp/skills/presentation-design/references/design-principles.md`, `.omp/skills/presentation-design/references/human-editing.md`, and `.omp/skills/presentation-design/references/visual-qa.md` before acting. Work only with project paths: `presentation/decks/current/index.html`, `presentation/review/overrides.json`, and `presentation/review/feedback.jsonl`.

1. Read the source slide, persisted overrides, and append-only feedback log. Build an actionable set by excluding original events named in later `resolution` events with `status: "applied"` or `"rejected"`. Treat geometry/crop history as actionable only when its final `after` matches the current override for its layer. Identify only remaining feedback relevant to the requested slide/layer.
2. For each pending item, make the smallest source change that satisfies the note while retaining the fixed 1600 × 900 canvas, stable semantic `data-layer-id` values, and the established Design DNA. A direct geometry override is user-approved geometry: preserve it rather than reflowing or approximating it.
3. Apply no unrelated cleanup, redesign, or speculative feedback. Never change source through the browser API; source review is the point at which source files are committed deliberately.
4. After a source change incorporates a specific direct override, clear only that applied override from `presentation/review/overrides.json`. Never erase other layers’ overrides.
5. Update feedback status conceptually in the append-only `presentation/review/feedback.jsonl` record: retain the original event and append a resolution/applied record using the project’s established review schema. Do not mutate or discard historic feedback. Mark only feedback actually applied as handled.
6. Visually inspect the production slide at `presentation/decks/current/index.html` (without `?edit=1`) and edit mode at `presentation/decks/current/index.html?edit=1`. Confirm production contains no reference asset, Moveable, editor UI, toolbar, comments, or controls.

Report the applied feedback IDs/layers, source changes, cleared override keys, and QA result.

Request: $ARGUMENTS