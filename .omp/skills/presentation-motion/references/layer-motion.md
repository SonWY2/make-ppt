# Layer motion and lifecycle

## Geometry isolation

```html
<section class="layer" data-layer-id="title-main" style="--x:…; --y:…; --w:…; --h:…;">
  <div class="motion-shell" data-motion-target="title-main">…</div>
</section>
```

The outer layer remains the stable Moveable target. GSAP may change only the inner motion shell’s transform and opacity. For an image, keep the outer `image-frame` clipping and its inner image crop properties intact; animate a motion shell around the image instead.

## Target validation

Before creating a timeline, search only inside the active slide. Each requested target must have:

- one matching `data-layer-id`;
- no duplicate layer ID in that slide;
- one direct `.motion-shell[data-motion-target]` with the same ID.

A missing or duplicate target is a configuration error. Surface a `[motion]` warning and preserve the static slide; do not silently select a positional DOM node.

## Lifecycle

A slide runtime creates one paused GSAP timeline in a scoped `gsap.context`. Before mounting a new active slide, kill the prior timeline and revert the prior context. This prevents transforms and timelines accumulating during live reload or navigation.

Edit Mode has no motion runtime. User move, resize, and crop edits update the outer layer only, so the nested shell automatically inherits the new geometry. After a geometry review, verify target presence, overflow/mask behavior, connector/path alignment where used, and `settled` parity.
