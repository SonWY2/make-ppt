# Visual QA

Visual QA is evidence collected from actual browser renders and browser resource inspection, not source inspection or aesthetic hunch. For every changed slide, render the production surface at exactly **1600 × 900**, inspect that render at presentation scale, and inspect the production browser’s loaded resources. Use a reference overlay only in edit mode; it can support reconstruction comparison but cannot replace independent inspection.

## Per-slide evidence

Record findings against the slide identity and what is visible in its actual 1600 × 900 production render.

1. Confirm the intended headline, image, or diagram is the first read rather than a decorative treatment.
2. Confirm text is legible at presentation distance, unclipped, and governed by a deliberate baseline/alignment system; confirm image crops are intentional and undistorted.
3. Confirm margins, major edges, gaps, contrast, z-order, whitespace, and connector semantics adhere to the established Design DNA rather than convenient pixel values.
4. For a multi-view diagram, confirm every view answers a distinct reader question and its paired, stacked, nested, or bridged relationship is visible. Labels, boundaries, and connectors must make comparison, dependency, containment, or handoff legible without narration.
5. Identify repeated structures as intentional evidence of comparison, a stable boundary, a repeated step, or deck furniture. Flag repetition that obscures the message, but do not demand variation for its own sake.
6. Confirm production isolation from the actual browser resource list as well as the rendered surface: no edit overlay, editor/studio assets or controls, comments or feedback UI, reference loading, Moveable, review/feedback resource, API dependency, or remote-runtime asset.

## Edit-mode navigation evidence

For every changed slide in a multi-slide deck, use the visible edit-mode previous and next controls to navigate to each available neighboring slide and back. Record the actual state observed after each switch:

1. The current-slide indicator identifies the slide now shown.
2. The target slide’s editable layers are present and correspond to that slide.
3. Its persisted geometry and image crop—including pan and zoom where applicable—are restored.
4. Its pending feedback and History state are restored without exposing another slide’s records.
5. Its local reference state is correct: the applicable local reference is available only in edit mode, or its intentional absence is preserved.

At a deck boundary, verify the available direction and the boundary state of the unavailable direction. A one-slide deck has no neighboring-slide switch to perform; still inspect its indicator, layers, geometry/crop, feedback/History, and local reference state in edit mode.

## Ordered deck-level review

After individual slides pass, inspect the rendered deck in its published order rather than as an unordered gallery.

1. Follow the narrative slide by slide and verify that each transition, reading path, and change in density serves the next message.
2. Compare visible anchors, typography roles, color roles, spacing rhythm, surfaces, connectors, image treatment, and deck furniture with the Design DNA. Distinguish deliberate recurring structure from accidental templating.
3. Revisit every multi-view slide in sequence: its internal relationship must remain understandable in the context established by earlier slides, and intentional repetition must not hide a changed relationship.
4. Confirm the complete production sequence remains isolated from edit-only/reference facilities, then resolve findings and re-inspect the affected actual renders.

Do not use visual quotas, fixed visual or diagram counts, forced novelty, or pixel-diff scores as acceptance criteria. Judge the visible evidence against the message, the Design DNA, and the ordered narrative.
