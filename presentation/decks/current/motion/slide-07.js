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
  const timeline = gsap.timeline({
    paused: true,
    defaults: { duration: 0.5, ease: "power3.out" },
  });

  gsap.set(title, { autoAlpha: 0, y: 20 });
  gsap.set(metrics, { autoAlpha: 0, y: 16 });
  gsap.set(pipeline, { autoAlpha: 0, y: 16 });
  gsap.set(image, { autoAlpha: 0, scale: 0.985 });
  gsap.set(human, { autoAlpha: 0, y: 12 });

  timeline.addLabel("enter");
  effects.fadeUp(timeline, title, {}, "enter");
  timeline.addLabel("evidence", ">+=0.08");
  effects.fadeUp(timeline, metrics, { duration: 0.46 }, "evidence");
  timeline.addLabel("allocation", ">+=0.08");
  effects.fadeUp(timeline, pipeline, { duration: 0.46 }, "allocation");
  effects.scaleIn(timeline, image, { duration: 0.54 }, "allocation+=0.08");
  timeline.addLabel("human", ">+=0.1");
  effects.fadeUp(timeline, human, { duration: 0.42 }, "human");
  timeline.addLabel("settled");

  return timeline;
}
