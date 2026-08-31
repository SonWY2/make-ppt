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

## Motion Studio

- **Motion debug:** `/presentation/decks/current/index.html?motion-debug=1#slide-1` exposes Play, Pause, Restart, cue seek, current time, Motion on/off, reduced-motion simulation, and feedback saved to the existing queue.
- **Static fallback:** append `?motion=off` to see the HTML/CSS settled state. Edit Mode never initializes the motion runtime.
- **Source split:** `MOTION_DNA.md` records deck motion language; `runtime/motion/` owns the small shared runtime/effects; `decks/current/motion/slide-XX.js` owns the slide choreography. Outer `data-layer-id` layers own geometry; inner `.motion-shell` elements own temporary GSAP transform and opacity.
- **Review:** use `animate-slide 01` after static approval, then use `review-motion 01` for unresolved feedback carrying a `cueId`. Motion feedback remains in `review/feedback.jsonl`; no second queue is created.

The initial demo animates slide 01 only. Other slides remain static until they have a message-led choreography and matching motion shells.

## Feedback and source-commit flow

1. In edit mode, leave a structured comment or point feedback item. Direct drag/resize changes are persisted immediately as local review overrides in `review/overrides.json`.
2. Feedback is appended to `review/feedback.jsonl`; source files are never changed by a browser request.
3. Resolved feedback is hidden by default. Use **History** to inspect it as dim markers; use **Dismiss** on an obsolete pending comment to append a `rejected` resolution without deleting its record.
4. Run the workspace `review-slide` command when a reviewer is ready to turn pending feedback into deliberate source changes. It applies only pending, relevant items; direct geometry takes priority over inferred layout.
5. Once a source change incorporates an override, the review command clears only that applied override and records the feedback as handled in the append-only review history. Unrelated overrides and historic feedback remain intact.
Use `design-slide` for a deliberate reconstruction or extension, `animate-slide` for motion after static approval, and `review-slide` / `review-motion` to apply feedback. The commands read project-local skills under `.omp/skills/`; `.agents/skills/` and `.claude/commands/` link to the same workspace content for OMP discovery.

## Scope

This is a local, single-deck studio. Review state is local JSON/JSONL, feedback is append-only, and there is no browser source-writing endpoint. It is not a multi-user collaboration service, a general deck editor, remote asset pipeline, or MP4 exporter. Its purpose is a controlled loop: static presentation, human geometry/comments, deliberate source review, GSAP motion, and browser QA.