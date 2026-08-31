# Design principles

## Design DNA process

Start by naming the mode. An explicit user choice controls; otherwise reproduce a supplied slide in **RECONSTRUCT**, and create a new topic or slide in **EXTEND**. A supplied reference by itself does not select a mode.

Record the deck’s **DNA invariants** before implementation: canvas; anchor and margin logic; typography roles; color roles; spacing rhythm; surface, line, and connector semantics; image treatment; deck furniture; semantic layer ownership; and local production safety. These are system rules, not a mandate to repeat a prior slide’s layout or visual count.

Then record the **controlled variables** for the individual slide: message-led reading path, layout, visual count, diagram topology, density, and silhouette. Vary them deliberately to clarify the message. Multiple diagrams are valid only when each answers a distinct reader question and their relationship is explicit. Do not require a hero visual, fixed columns, low density, or novelty quotas.

In **RECONSTRUCT**, derive both invariants and slide geometry from the supplied reference’s measurable evidence. In **EXTEND**, derive invariants from the existing deck and its Design DNA, supplementing them with a supplied reference’s visual-language evidence—typography, color, spacing, surface, line, connector, image-treatment, and deck-furniture roles—where useful; then choose the controlled variables for the new message. A reference’s scene graph—its placement, coordinates, grouping, and visual count—is forbidden input for an EXTEND layout; preserve visual language without copying that composition.

Use a fixed **1600 × 900** coordinate canvas. Give every editable visual element a stable, semantic `data-layer-id`; do not derive IDs from position, text, or array order. A primary image uses an outer `image-frame` layer and an inner `img`, so crop and frame geometry remain independently understandable. Keep reference assets, editor UI, feedback, and remote runtime assets out of production; local reference material is edit-only.
