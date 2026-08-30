---
name: presentation-design
description: Design, reconstruct, extend, and review local HTML presentation slides with a deliberate visual system and a production-safe review workflow.
---

# Presentation design

Use this skill before changing a slide or turning review feedback into source changes. Work only in the project paths named by the command or request.

## Non-negotiable decision order

1. User's direct visual edits: committed geometry, resize, crop, and alignment.
2. The supplied reference image.
3. Extracted Design DNA.
4. Presentation-specific composition rules.
5. Curated external design heuristics.
6. The model's aesthetic preference.

Never reverse this order. Explicit factual content and production safety constrain every decision, but they do not authorize the model to override a direct visual edit or the reference.

## Choose a mode

- **RECONSTRUCT**: use the supplied reference as evidence. Reproduce its composition, scale relationships, crop, type hierarchy, alignment, color blocks, and intentional whitespace. Do not “improve” it into a different design.
- **EXTEND**: inspect existing deck slides and extract their Design DNA before adding a slide. Continue that system rather than borrowing a new visual genre.

## Workflow boundaries

A reference overlay is an edit-time comparison aid only. It may be dynamically loaded in edit mode, never embedded or loaded by the production slide. Production must not load reference assets, Moveable, editor UI, toolbar, comments, or controls. Keep all assets local and use the project’s specified paths.

## Reference library

Read the reference that applies to the work before implementation or review:

- [`references/design-principles.md`](references/design-principles.md) — Design DNA and layer-ownership rules.
- [`references/reference-analysis.md`](references/reference-analysis.md) — RECONSTRUCT and EXTEND inspection.
- [`references/anti-slop.md`](references/anti-slop.md) — constraints against generic decoration.
- [`references/slide-archetypes.md`](references/slide-archetypes.md) — message-led composition choices.
- [`references/visual-qa.md`](references/visual-qa.md) — rendered-slide and production checks.
- [`references/human-editing.md`](references/human-editing.md) — feedback, overrides, and source-review handling.
- [`references/SOURCES.md`](references/SOURCES.md) — provenance and terms.