# Motion principles

## Space versus time

Static slide geometry is approved before motion. `data-layer-id` geometry shells own canvas placement, size, crop, and user edits. Nested motion shells own temporary transform and opacity. Motion must return to the CSS-defined settled state.

## Intent before effect

For each animated group, name:

1. the audience takeaway;
2. the reading order or relationship that benefits from time;
3. the semantic cue at which the group appears;
4. the smallest transform/opacity change that communicates it.

If no information order or relationship improves, leave the group still.

## Pace and choreography

Use one motion personality per deck. Favor readable 0.4–0.7 second entrances with a decelerating ease for editorial presentation material. Start the primary reading element first. Reveal supporting text or evidence only after it can be read. Use stagger only for a real sequence, not merely because elements repeat.

A presentation is not a silent autoplay video. Build semantic timeline labels, then let the presenter or motion debug seek to them. The required `settled` label is the canonical completed state; exits, if needed, come after it.

## Reduced motion

Reduced motion does not mean a degraded layout. It means no entrance transforms, no delayed opacity, and immediate settled HTML/CSS. The same rule applies when GSAP cannot load or runtime initialization fails.
