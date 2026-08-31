export const motionTargets = ["action-title", "action-image", "action-list"];
export const manualAdvance = true;

export function createMotion(_slide, { effects, gsap, target }) {
  const title = target("action-title");
  const image = target("action-image");
  const rules = target("action-list");
  const principles = [...rules.querySelectorAll("article")];
  const timeline = gsap.timeline({
    paused: true,
    defaults: { duration: 0.5, ease: "power3.out" },
  });

  gsap.set(title, { autoAlpha: 0, y: 20 });
  gsap.set(image, { autoAlpha: 0, scale: 0.985 });
  gsap.set(principles, { autoAlpha: 0, y: 14 });

  timeline.addLabel("enter");
  effects.fadeUp(timeline, title, {}, "enter");
  effects.scaleIn(timeline, image, { duration: 0.5 }, "enter");
  timeline.addLabel("principles", ">+=0.12");
  timeline.addPause("principles");

  const cues = [
    "cognitive-load",
    "curse-awareness",
    "classic-style",
    "verb-energy",
    "human-review",
  ];
  principles.forEach((principle, index) => {
    timeline.to(principle, { autoAlpha: 1, y: 0, duration: 0.38 });
    timeline.addLabel(cues[index]);
    if (index < principles.length - 1) timeline.addPause(cues[index]);
  });
  timeline.addLabel("settled");

  return timeline;
}
