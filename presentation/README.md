# Presentation Studio demo

A local, file-backed review surface for the current HTML presentation deck. It is intentionally self-contained: no CDN, remote runtime asset, or global installation is required. Presentation motion uses the project-local GSAP dependency.

## Launch locally

From the repository root, start the Bun server:

```sh
bun run dev
```

Open the local `127.0.0.1` URL printed by Bun. The production slide is served at:

```text
/presentation/decks/current/index.html
```

For example, append that path to the printed local origin. The server must remain bound to `127.0.0.1`.

## Production and edit mode

- **Production view:** `/presentation/decks/current/index.html` presents only the slide. It must not load Moveable, editor controls, comments, a toolbar, or reference-overlay assets.
- **Edit mode:** `/presentation/decks/current/index.html?edit=1` enables local review tools. Edit mode may load the editor and the reference overlay dynamically; it must not change source HTML or CSS through the browser.

Use edit mode to inspect stable, semantic layers and make direct geometry adjustments. Geometry is stored against the layer’s `data-layer-id` on the fixed 1600 × 900 canvas. The primary image’s frame and its image content are intentionally separate layers, so a crop adjustment does not lose frame intent.

## Motion Studio — eight-slide browser presentation

Motion is progressive enhancement for the completed eight-slide deck, not a replacement for its static HTML/CSS composition. Each slide has one paused GSAP timeline whose semantic labels describe the reader’s next idea rather than a numeric step: `enter` is followed by the slide-specific premise, evidence, mechanism, comparison, practice, allocation, or rules cue, then mandatory `settled`. Slide 01’s exact order is `enter` → `premise` → `evidence` → `frameworks` → `settled`.

### Local operator URLs

With `bun run dev` running on its default local origin, use the following exact views. Replace `N` with `1` through `8`.

```text
Production:   http://127.0.0.1:3000/presentation/decks/current/index.html#slide-N
Motion Debug: http://127.0.0.1:3000/presentation/decks/current/index.html?motion-debug=1#slide-N
Static:       http://127.0.0.1:3000/presentation/decks/current/index.html?motion=off#slide-N
Edit mode:    http://127.0.0.1:3000/presentation/decks/current/index.html?edit=1#slide-N
```

Motion Debug exposes Play, Pause, Restart, numeric seek, semantic cue buttons, current time, Motion on/off, reduced-motion simulation, and cue-attached feedback. The feedback cue is derived from the timeline’s current label/time. Debug controls and focused inputs are isolated from ordinary deck navigation; use the hash (or explicit slide navigation) to select a slide while debugging. The static URL is the settled baseline: seeking a timeline to `settled` must leave geometry, crop, typography, alignment, visibility, and outer layer bounds identical to that page.

### Static, accessibility, and editor boundaries

- The HTML/CSS deck is visibly settled without motion. `prefers-reduced-motion`, `?motion=off`, debug reduced-motion simulation, missing GSAP or a slide module, and runtime/configuration errors all leave that same static surface visible.
- **Edit mode is isolated:** `/presentation/decks/current/index.html?edit=1#slide-N` does not start a motion runtime or timeline. Moveable selection, geometry/crop persistence, local reference overlay, feedback, and History continue to operate on the outer semantic `data-layer-id` layers.
- **Source split:** `MOTION_DNA.md` records the motion language and cue map; `runtime/motion/` owns the small shared runtime/effects; `decks/current/motion/slide-XX.js` owns one slide’s choreography. Outer `data-layer-id` layers own geometry; exactly one direct inner `.motion-shell[data-motion-target]` owns temporary GSAP transform and opacity.
- Motion may clarify reading order only. It must preserve the controlled/editorial/precise design language, static layout, image frame/crop, and local-only asset policy. MP4/export, plugins, CDN or other external runtimes, timers/loops, and a second feedback queue are out of scope.

### Motion review flow

1. Start from the Motion Debug URL for the target slide. Pause and seek each semantic cue; use `?motion=off#slide-N` as the settled comparison. Check the sequence before changing timing.
2. Use `/animate-slide 01` only after the target slide’s static composition is approved. It keeps motion source in the local timeline/module split.
3. Use `/review-motion 01` to apply pending feedback with a `cueId`. It reviews the actual debug surface and writes resolved motion feedback to the existing append-only `presentation/review/feedback.jsonl`.
4. Motion feedback stays on the existing same-origin `POST /api/feedback` path with `{slide, layerId, cueId, type: "comment", note}`. The panel clears the note only after a successful response and reports a failed save; do not create another queue.

## Feedback and source-commit flow

1. In edit mode, leave a structured comment or point feedback item. Direct drag/resize changes are persisted immediately as local review overrides in `review/overrides.json`.
2. Feedback is appended to `review/feedback.jsonl`; source files are never changed by a browser request.
3. Resolved feedback is hidden by default. Use **History** to inspect it as dim markers; use **Dismiss** on an obsolete pending comment to append a `rejected` resolution without deleting its record.
4. Run the workspace `review-slide` command when a reviewer is ready to turn pending feedback into deliberate source changes. It applies only pending, relevant items; direct geometry takes priority over inferred layout.
5. Once a source change incorporates an override, the review command clears only that applied override and records the feedback as handled in the append-only review history. Unrelated overrides and historic feedback remain intact.
Use `design-slide` for a deliberate reconstruction or extension, `animate-slide` for motion after static approval, and `review-slide` / `review-motion` to apply feedback. The commands read project-local skills under `.omp/skills/`; `.agents/skills/` and `.claude/commands/` link to the same workspace content for OMP discovery.

## Scope

This is a local, single-deck studio. Review state is local JSON/JSONL, feedback is append-only, and there is no browser source-writing endpoint. It is not a multi-user collaboration service, a general deck editor, remote asset pipeline, or MP4 exporter. Its purpose is a controlled loop: static presentation, human geometry/comments, deliberate source review, GSAP motion, and browser QA.