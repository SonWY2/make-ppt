# Motion QA

Motion QA is evidence from the real browser, not timeline source inspection.

## Per-slide check

At 1600 × 900 production size:

1. Pause the active timeline and seek each meaningful cue.
2. Capture the initial, one or more intermediate, and `settled` frames.
3. Confirm the intended first read appears before secondary evidence.
4. Confirm text remains legible, unclipped, and long enough to read; confirm images, masks, diagrams, and connectors remain aligned.
5. Compare a no-motion static render with `seek("settled")`: position, size, crop, typography, alignment, and visibility must match.
6. Navigate away and back, then confirm one current timeline only.
7. Confirm Edit Mode has no GSAP timeline; direct geometry remains on the outer layer.
8. Confirm reduced motion, `?motion=off`, and a failed GSAP request preserve the static slide.

## FOUC

Load the slide with a cache-bypassing page navigation and inspect the first visible frame. If a completed element flashes before its entrance begins, fix only the observed flash. Do not pre-hide CSS content globally, because the no-JavaScript fallback must remain visible.

## Review order

Correct information sequence, readability, hierarchy, geometry stability, clipping, timing, easing, then decorative polish—in that order.
