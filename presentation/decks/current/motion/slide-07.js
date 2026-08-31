export const motionTargets = [
  "ai-title",
  "ai-metrics",
  "ai-pipeline",
  "ai-image",
  "ai-human",
];

export function createMotion(_slide, { effects, gsap, target }) {
  const title = target("ai-title");
  const metrics = target("ai-metrics");
  const pipeline = target("ai-pipeline");
  const image = target("ai-image");
  const human = target("ai-human");
  const allocations = pipeline.querySelectorAll(".allocation span");
  const timeline = gsap.timeline({
    paused: true,
    defaults: { duration: 0.5, ease: "power3.out" },
  });

  gsap.set(title, { autoAlpha: 0, y: 20 });
  gsap.set(metrics, { autoAlpha: 0, scale: 0.96 });
  gsap.set(pipeline, { autoAlpha: 0, x: 24 });
  gsap.set(allocations, { scaleX: 0, transformOrigin: "left center" });
  gsap.set(image, { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" });
  gsap.set(human, { autoAlpha: 0, scaleX: 0, transformOrigin: "left center" });

  timeline.addLabel("enter");
  effects.fadeUp(timeline, title, {}, "enter");
  timeline.addLabel("evidence", ">+=0.08");
  effects.scaleIn(timeline, metrics, { duration: 0.46 }, "evidence");
  timeline.addLabel("allocation", ">+=0.08");
  effects.revealX(timeline, pipeline, { duration: 0.4 }, "allocation");
  timeline.to(allocations, { scaleX: 1, duration: 0.34, stagger: 0.08, ease: "power2.out" }, "allocation+=0.18");
  effects.wipeIn(timeline, image, { duration: 0.54 }, "allocation+=0.08");
  timeline.addLabel("human", ">+=0.1");
  timeline.to(human, { autoAlpha: 1, scaleX: 1, duration: 0.42 }, "human");
  timeline.addLabel("settled");

  return timeline;
}
