export function fadeUp(timeline, target, options = {}, position) {
  return timeline.to(target, { autoAlpha: 1, y: 0, ...options }, position);
}

export function scaleIn(timeline, target, options = {}, position) {
  return timeline.to(target, { autoAlpha: 1, scale: 1, ...options }, position);
}
