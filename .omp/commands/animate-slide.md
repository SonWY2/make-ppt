---
description: Add or revise GSAP motion for one approved local presentation slide.
---

Read `.omp/skills/presentation-motion/SKILL.md`, every referenced presentation-motion document, `presentation/decks/current/DESIGN_DNA.md`, and `presentation/decks/current/MOTION_DNA.md` before acting. Also read `.omp/skills/presentation-design/references/human-editing.md` when user overrides or feedback exist.

Work only in this workspace. The static deck is `presentation/decks/current/index.html`; per-slide choreography is `presentation/decks/current/motion/slide-XX.js`; common effects are `presentation/runtime/motion/effects.js`; the runtime is `presentation/runtime/motion/runtime.js`; review state remains `presentation/review/overrides.json` and `presentation/review/feedback.jsonl`.

1. Confirm the requested static slide is approved enough to animate. Do not alter its composition, canvas, CSS settled design, `data-layer-id`, Moveable behavior, crop, user overrides, reference overlay, or feedback queue.
2. Read pending feedback and current overrides. Direct user geometry and explicit motion notes win. Create or update `MOTION_DNA.md` from user intent, Design DNA, slide purpose, content structure, and the local motion references; never invent original animation from a static reference image.
3. Give only needed stable layers a direct nested `.motion-shell[data-motion-target="same-layer-id"]`. Keep geometry on the outer layer and animate transforms/opacity only on the inner shell.
4. Validate target existence, uniqueness, and shell presence. Write a paused GSAP master timeline with semantic labels and required `settled`; put slide-specific sequence in `slide-XX.js`. Use shared helpers only for a real repeat.
5. Open `presentation/decks/current/index.html?motion-debug=1#slide-N` at 1600 × 900. Verify Play, Pause, Restart, seek, each cue, and `settled`. Compare `settled` against `presentation/decks/current/index.html?motion=off#slide-N`. Check `?edit=1#slide-N`, reduced motion, and navigation away/back.
6. Remove unhelpful motion. The animation must clarify a reading order or relationship, not decorate an already-complete static slide.

Request: $ARGUMENTS
