export const motionTargets = ["action-title", "action-image", "action-list"];

export function createMotion(_slide, { effects, gsap, target }) {
  const title = target("action-title");
  const image = target("action-image");
  const rules = target("action-list");
  const timeline = gsap.timeline({
    paused: true,
    defaults: { duration: 0.5, ease: "power3.out" },
  });

  gsap.set(title, { autoAlpha: 0, y: 20 });
  gsap.set(image, { autoAlpha: 0, scale: 0.985 });
  gsap.set(rules, { autoAlpha: 0, y: 16 });

  timeline.addLabel("enter");
  effects.fadeUp(timeline, title, {}, "enter");
  effects.scaleIn(timeline, image, { duration: 0.5 }, "enter");
  timeline.addLabel("rules", ">+=0.12");
  effects.fadeUp(timeline, rules, { duration: 0.5 }, "rules");
  timeline.addLabel("settled");

  return timeline;
}
