export const motionTargets = [
  "classic-title",
  "classic-image",
  "classic-avoid",
  "classic-adopt",
];

export function createMotion(_slide, { effects, gsap, target }) {
  const title = target("classic-title");
  const image = target("classic-image");
  const avoid = target("classic-avoid");
  const adopt = target("classic-adopt");
  const timeline = gsap.timeline({
    paused: true,
    defaults: { duration: 0.5, ease: "power3.out" },
  });

  gsap.set(title, { autoAlpha: 0, y: 20 });
  gsap.set(image, { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" });
  gsap.set(avoid, { autoAlpha: 0, x: -32 });
  gsap.set(adopt, { autoAlpha: 0, x: 32 });

  timeline.addLabel("enter");
  effects.fadeUp(timeline, title, {}, "enter");
  timeline.addLabel("window", ">+=0.06");
  effects.wipeIn(timeline, image, { duration: 0.55 }, "window");
  timeline.addLabel("stop", ">+=0.08");
  effects.revealX(timeline, avoid, { duration: 0.46 }, "stop");
  timeline.addLabel("adopt", ">+=0.08");
  effects.revealX(timeline, adopt, { duration: 0.46 }, "adopt");
  timeline.addLabel("settled");

  return timeline;
}
