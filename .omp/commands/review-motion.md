---
description: Apply pending motion feedback to a local presentation slide while preserving approved layout.
---

Read `.omp/skills/presentation-motion/SKILL.md`, its motion QA and layer-motion references, `presentation/decks/current/DESIGN_DNA.md`, `presentation/decks/current/MOTION_DNA.md`, and `.omp/skills/presentation-design/references/human-editing.md` before acting.

1. Read the requested slide’s choreography, user overrides, and append-only `presentation/review/feedback.jsonl`. Exclude feedback resolved later with `status: applied` or `rejected`. A feedback event with `cueId` is motion feedback; other pending geometry/crop feedback remains static-layout evidence and must not be overwritten.
2. Play the actual slide in `?motion-debug=1` before changing code. Inspect the named cue, target layer, timing, sequence, hierarchy, clipping, and settled state. Do not decide motion quality from source alone.
3. Make the smallest change in `MOTION_DNA.md`, `slide-XX.js`, or a verified repeated common effect. Preserve outer geometry, image crop, static CSS, user overrides, and existing feedback storage.
4. Re-run browser QA: cue seek, Play/Pause/Restart, `settled` parity with `?motion=off`, Edit Mode isolation, reduced motion, and navigation cleanup. For a layer with direct user geometry, also verify overflow, mask/crop, and connector/path alignment where present.
5. For each applied motion comment, append an `applied` resolution event to the existing JSONL feedback history. Do not create a separate motion queue or change unrelated feedback.

Request: $ARGUMENTS
