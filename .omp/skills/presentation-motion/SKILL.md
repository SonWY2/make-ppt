---
name: presentation-motion
description: Design, implement, review, and verify GSAP motion for an approved local HTML presentation without changing its static layout.
---

# Presentation motion

`presentation-design` owns space. This skill owns time. HTML/CSS remain the settled static source of truth; GSAP timelines add progressive enhancement only. Work only below `presentation/` and `.omp/` in this workspace.

## Required reading

Before an animation or motion review, read:

- `presentation/decks/current/DESIGN_DNA.md`
- `presentation/decks/current/MOTION_DNA.md` (create it before a first motion change)
- `.omp/skills/presentation-motion/references/motion-principles.md`
- `.omp/skills/presentation-motion/references/motion-anti-slop.md`
- `.omp/skills/presentation-motion/references/layer-motion.md`
- `.omp/skills/presentation-motion/references/motion-qa.md`
- `.omp/skills/gsap-core/SKILL.md`
- `.omp/skills/gsap-timeline/SKILL.md`
- `.omp/skills/motion-design/SKILL.md` only as art-direction reference

Read the existing static source, applicable user overrides, and unresolved feedback before changing a slide. User geometry and explicit user motion always win.

## Decision order

1. Direct user request.
2. Actual motion reference, if supplied.
3. Direct user geometry or motion edit.
4. `DESIGN_DNA.md`.
5. `MOTION_DNA.md`.
6. These presentation-motion references.
7. Local GSAP and motion-design reference skills.
8. Model preference.

Do not infer animation from a static PPT reference. In RECONSTRUCT mode, static visual QA and human editing happen before motion.

## Implementation contract

- Keep the fixed 1600 × 900 canvas, `data-layer-id`, Moveable behavior, crop behavior, feedback queue, user overrides, edit overlay, and static visual QA intact.
- A movable/resizable `data-layer-id` shell owns position and size. Its direct `.motion-shell[data-motion-target="same-layer-id"]` child owns GSAP transforms and opacity. Never animate `left`, `top`, `width`, `height`, or crop properties for presentation motion.
- Target lookup is slide-scoped. Validate that every requested layer exists once and has exactly one direct motion shell. Emit a `[motion]` warning and leave the static slide intact on configuration failure.
- Keep shared helpers in `presentation/runtime/motion/effects.js` only when multiple slide choreographies use them. Put slide-specific sequence in `presentation/decks/current/motion/slide-XX.js`.
- One slide uses one paused GSAP master timeline. Use labels with content meaning such as `enter`, `premise`, `mechanism`, `result`, and required `settled`; never use `step1` labels. `timeline.seek("settled")` must visually equal the HTML/CSS static slide.
- Do not use CSS animation delays, `setTimeout`, random timers, ScrollTrigger, or a plugin without a demonstrated need.
- The runtime must clean up the previous timeline/context before a slide change or remount. Edit Mode (`?edit=1`) must not initialize motion.
- `prefers-reduced-motion`, `?motion=off`, a GSAP load failure, and motion runtime errors must retain a visible static settled slide.

## Motion design

Start from the message and reading order. Move an element only when it makes hierarchy, sequence, causality, comparison, or handoff easier to understand. Stillness is valid. Prefer block → line → word → character granularity. Animate diagrams in their causal order, not as decorative entrances.

Avoid generic fade-up cascades, bounce, elastic overshoot, loops, floating, glows, blur, parallax, arbitrary zoom, and character effects unless an actual motion reference and the Motion DNA justify them.

## Browser QA

Use the actual production URL at exactly 1600 × 900. In `?motion-debug=1`, pause, seek semantic cues, and capture frames. Compare the static production render with `settled` for position, size, crop, typography, alignment, and visibility. Verify playback, pause, restart, seek, cue navigation, cleanup after slide navigation, Edit Mode isolation, reduced motion, `?motion=off`, and a missing-GSAP fallback. Review information sequence before timing or polish.
