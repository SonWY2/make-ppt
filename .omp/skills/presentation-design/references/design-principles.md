# Design principles

## Design DNA process

Before implementation, record a compact working inventory: canvas and margins; grid and alignment anchors; type families, sizes, weights, leading, and measure; color roles; shape/radius/border/shadow rules; image treatment and crop; density; transition rhythm; and the repeated components that actually carry meaning. Identify what is invariant versus slide-specific. Implement from these decisions, then compare the rendered result to the inventory.

Use a fixed **1600 × 900** coordinate canvas. Give every editable visual element a stable, semantic `data-layer-id`; do not derive IDs from position, text, or array order. A primary image uses an outer `image-frame` layer and an inner `img`, so crop and frame geometry remain independently understandable.
