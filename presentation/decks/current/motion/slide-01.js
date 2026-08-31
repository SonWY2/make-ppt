export const motionTargets = ["cover-title", "cover-summary", "cover-image", "cover-frameworks"];

export function createMotion(_slide, { effects, gsap, target }) {
  const title = target("cover-title");
  const summary = target("cover-summary");
  const image = target("cover-image");
  const frameworks = target("cover-frameworks");
  const frameworkRows = [...frameworks.querySelectorAll(":scope > article")];
  const timeline = gsap.timeline({
    paused: true,
    defaults: { duration: 0.5, ease: "power3.out" },
  });

  gsap.set(title, { autoAlpha: 0, y: 20 });
  gsap.set(summary, { autoAlpha: 0, x: -24 });
  gsap.set(image, { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" });
  gsap.set(frameworkRows, { autoAlpha: 0, x: -20 });

  timeline.addLabel("enter");
  effects.fadeUp(timeline, title, {}, "enter");
  timeline.addLabel("premise", ">+=0.06");
  effects.revealX(timeline, summary, { duration: 0.42 }, "premise");
  timeline.addLabel("evidence", ">+=0.06");
  effects.wipeIn(timeline, image, { duration: 0.55 }, "evidence");
  timeline.addLabel("frameworks", ">+=0.06");
  timeline.to(frameworkRows, { autoAlpha: 1, x: 0, duration: 0.34, stagger: 0.1 }, "frameworks");
  timeline.addLabel("settled");

  return timeline;
}
