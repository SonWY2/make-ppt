# Visual QA

Render the actual slide at presentation scale and inspect it, not just source. Check canvas bounds, crop, overflow, contrast, legibility, hierarchy, alignment, whitespace, and whether the slide still reads at a glance. Compare reconstructions against the reference with the overlay only in edit mode.

Render the real production slide without edit mode. Confirm that it has no overlay, editor assets, controls, feedback UI, or remote dependencies.

## Fast visual QA

At 1600 × 900, verify all of the following:

- The first read is the intended headline or visual, not a decorative treatment.
- Text is legible at presentation distance, has no accidental clipping, and follows a deliberate baseline/alignment system.
- Images are intentionally cropped inside their frames; frames do not distort image content.
- Major edges, margins, and gaps align to the Design DNA rather than convenient pixel values.
- Contrast, z-order, and whitespace make the reading path unambiguous.
- Production and edit views differ only by authorized editing aids.
