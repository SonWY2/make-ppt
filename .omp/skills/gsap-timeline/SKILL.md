---
name: gsap-timeline
description: Local reference notes for semantic GSAP timelines in the Presentation Motion Studio.
---

# GSAP timeline — local reference

This skill is reference material for `presentation-motion`; it does not define the slide narrative.

- Create one paused GSAP master timeline for each animated slide: `gsap.timeline({ paused: true, defaults: { duration, ease } })`.
- Use `addLabel` with semantic cue names such as `enter`, `premise`, `mechanism`, `result`, and mandatory `settled`. Avoid positional names such as `step1`.
- Use the timeline position parameter to describe time: labels, `label+=0.1`, `<`, and `>` are preferred over CSS delays or timers.
- Expose `play`, `pause`, `restart`, and `seek` through the runtime. Motion debug seeks labels; production may use semantic presentation cues later.
- The `settled` label is the canonical completed visual state. Place exits after it; do not assume `progress(1)` is the static layout.
- On navigation or remount, kill the old timeline and revert its scoped context before creating another.

Source: `greensock/gsap-skills`, `skills/gsap-timeline/SKILL.md` (MIT), rewritten for this workspace.
