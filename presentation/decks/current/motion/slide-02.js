export const motionTargets = [
  "complexity-title",
  "complexity-stat",
  "complexity-image",
  "complexity-mechanism",
  "complexity-result",
];

export function createMotion(_slide, { effects, gsap, target }) {
  const title = target("complexity-title");
  const stat = target("complexity-stat");
  const image = target("complexity-image");
  const mechanism = target("complexity-mechanism");
  const result = target("complexity-result");
  const comparisons = [...result.querySelectorAll(":scope > div")];
  const takeaway = result.querySelector(":scope > .takeaway");
  const timeline = gsap.timeline({
    paused: true,
    defaults: { duration: 0.5, ease: "power3.out" },
  });

  gsap.set(title, { autoAlpha: 0, y: 20 });
  gsap.set(stat, { autoAlpha: 0, scale: 0.94 });
  gsap.set(image, { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" });
  gsap.set(mechanism, { autoAlpha: 0, x: 28 });
  gsap.set(comparisons, { autoAlpha: 0, scaleX: 0, transformOrigin: "left center" });
  gsap.set(takeaway, { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" });

  timeline.addLabel("enter");
  effects.fadeUp(timeline, title, {}, "enter");
  timeline.addLabel("evidence", ">+=0.08");
  effects.scaleIn(timeline, stat, { duration: 0.44 }, "evidence");
  effects.wipeIn(timeline, image, { duration: 0.5 }, "evidence+=0.12");
  timeline.addLabel("mechanism", ">+=0.08");
  effects.revealX(timeline, mechanism, {}, "mechanism");
  timeline.addLabel("result", ">+=0.08");
  timeline.to(comparisons, { autoAlpha: 1, scaleX: 1, duration: 0.36, stagger: 0.1 }, "result");
  effects.wipeIn(timeline, takeaway, { duration: 0.36 }, "result+=0.2");
  timeline.addLabel("settled");

  return timeline;
}
