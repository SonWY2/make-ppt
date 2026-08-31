---
name: gsap-core
description: Local reference notes for vanilla GSAP core animation in the Presentation Motion Studio.
---

# GSAP core — local reference

This skill is reference material for `presentation-motion`; it does not make deck-level design decisions.

- Use project-local GSAP served as `/vendor/gsap.min.js`. It exposes `window.gsap` to the browser runtime.
- Use `gsap.to`, `gsap.from`, and `gsap.fromTo` for DOM/SVG properties. Keep a returned timeline or tween only when it needs playback control.
- Prefer `x`, `y`, `scale`, `rotation`, and `autoAlpha` over raw `transform`, layout properties, or opacity-only hidden click targets. Do not animate `left`, `top`, `width`, `height`, or image crop in presentation motion.
- `from` and `fromTo` can apply a start state immediately. For a static-first presentation, use `immediateRender: false` when the initial state must not alter the no-motion surface until playback or seeking begins.
- Use documented eases. Editorial entrances normally decelerate with `power3.out`; bounce and elastic need explicit art-direction evidence.
- Respect `prefers-reduced-motion`: skip the timeline and retain the static settled state.
- Scope animation targets to the active slide and its nested motion shells. Use `gsap.context` so a remount can revert temporary inline animation styles.

Source: `greensock/gsap-skills`, `skills/gsap-core/SKILL.md` (MIT), rewritten for this workspace.
