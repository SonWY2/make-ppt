---
description: Design or reconstruct a local presentation slide using the presentation-design skill.
---

Read `.omp/skills/presentation-design/SKILL.md` and the applicable final references before acting: `.omp/skills/presentation-design/references/design-principles.md`, `.omp/skills/presentation-design/references/reference-analysis.md`, `.omp/skills/presentation-design/references/anti-slop.md`, `.omp/skills/presentation-design/references/slide-archetypes.md`, `.omp/skills/presentation-design/references/visual-qa.md`, and `.omp/skills/presentation-design/references/human-editing.md`.

Use only project-local presentation paths: the production slide is `presentation/decks/current/index.html`; static assets belong below `presentation/`; review state is `presentation/review/overrides.json` and `presentation/review/feedback.jsonl`; the deck analysis lives in `presentation/decks/current/DESIGN_DNA.md`. Interpret the request as **RECONSTRUCT** when it supplies a reference, otherwise as **EXTEND** unless it says otherwise.

1. Inspect the requested slide and, for EXTEND, enough existing deck material to extract its Design DNA. For RECONSTRUCT, inventory the reference’s anchors, proportion, crop, type hierarchy, color roles, and whitespace. Create or update `presentation/decks/current/DESIGN_DNA.md` before writing slide HTML.
2. Implement the slide on the fixed 1600 × 900 canvas with stable semantic `data-layer-id` values. Keep a primary image’s outer `image-frame` separate from its inner `img`.
3. Honor pending structured feedback and direct geometry in `presentation/review/overrides.json`; user geometry outranks inferred layout. Do not invent a second visual system or decorative filler.
4. Keep editor-only/reference-overlay behavior behind edit mode. Production at `presentation/decks/current/index.html` must not load reference assets, Moveable, toolbar/editor UI, comments, or controls.
5. Render and visually inspect both `presentation/decks/current/index.html?edit=1` and the production URL. Report the mode, Design DNA decisions, files changed, and visual QA result.

Request: $ARGUMENTS