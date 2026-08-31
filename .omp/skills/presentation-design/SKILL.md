---
name: presentation-design
description: Design, reconstruct, extend, and review local HTML presentation slides with a deliberate visual system and a production-safe review workflow.
---

# Presentation design

Use this skill before changing a slide or turning review feedback into source changes. Work only in the project paths named by the command or request.

## Non-negotiable decision order

1. User's direct visual edits: committed geometry, resize, crop, and alignment.
2. Evidence selected by the mode: the supplied reference's composition in **RECONSTRUCT**; in **EXTEND**, the existing deck and its extracted Design DNA, supplemented by a supplied reference's visual-language evidence only.
3. Explicit factual content and production safety.
4. Presentation-specific composition rules.
5. Curated external design heuristics.
6. The model's aesthetic preference.

Never reverse this order. In **EXTEND**, a supplied reference may inform typography, color, spacing, surface, line, connector, image-treatment, and deck-furniture roles, but never its scene graph, coordinates, grouping, visual count, or copied composition; it cannot override an explicit mode choice or direct visual edit.

## Choose a mode

- An explicit user-selected mode wins. Without one, a requested reproduction of a supplied slide is **RECONSTRUCT**; a new topic or slide is **EXTEND**. Supplying a reference alone never selects a mode.
- **RECONSTRUCT**: the supplied reference is composition evidence. Reproduce its scene graph, scale relationships, crop, type hierarchy, alignment, color blocks, and intentional whitespace. Do not “improve” it into a different design.
- **EXTEND**: the existing deck’s recorded Design DNA is authoritative where it exists; a supplied reference may supplement it with visual-language evidence. Create a message-led composition in that visual language; never copy the reference’s scene graph, arrangement, or visual count. Preserve DNA invariants while deliberately varying the reading path, layout, visual count, diagram topology, density, and silhouette when the message requires it.
- Keep evidence mode-scoped: RECONSTRUCT uses reference measurements and overlays as composition evidence; EXTEND uses the deck and its Design DNA as the composition authority, while a supplied reference may contribute visual-language evidence only.

## Workflow boundaries

A reference overlay is an edit-time comparison aid only. It may be dynamically loaded in edit mode, never embedded or loaded by the production slide. Production must not load reference assets, Moveable, editor UI, toolbar, comments, or controls. Keep all assets local and use the project’s specified paths.

## Multi-slide editing

When a deck has two or more slides, edit mode MUST provide visible previous/next slide controls and a current-slide indicator. A slide change MUST load that target slide's layers, persisted geometry, crop state, feedback, and edit-only reference overlay before accepting edits. Keep arrow keys reserved for layer nudging and crop movement; edit-mode navigation must use controls that do not conflict with direct manipulation. Production keeps its own keyboard and canvas-click navigation, while edit mode exposes only the editor navigation controls.

## Reference library

Read the reference that applies to the work before implementation or review:

- [`references/design-principles.md`](references/design-principles.md) — Design DNA and layer-ownership rules.
- [`references/reference-analysis.md`](references/reference-analysis.md) — RECONSTRUCT and EXTEND inspection.
- [`references/anti-slop.md`](references/anti-slop.md) — constraints against generic decoration.
- [`references/slide-archetypes.md`](references/slide-archetypes.md) — message-led composition choices.
- [`references/visual-qa.md`](references/visual-qa.md) — rendered-slide and production checks.
- [`references/human-editing.md`](references/human-editing.md) — feedback, overrides, and source-review handling.
- [`references/SOURCES.md`](references/SOURCES.md) — provenance and terms.