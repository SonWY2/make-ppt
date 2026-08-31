export const motionTargets = ["syntax-title", "syntax-image", "syntax-corrections"];

export function createMotion(_slide, { effects, gsap, target }) {
  const title = target("syntax-title");
  const image = target("syntax-image");
  const corrections = target("syntax-corrections");
  const correctionRows = [...corrections.children].filter((child) => child.matches("article"));
  const timeline = gsap.timeline({
    paused: true,
    defaults: { duration: 0.5, ease: "power3.out" },
  });

  gsap.set(title, { autoAlpha: 0, y: 20 });
  gsap.set(image, { autoAlpha: 0, scale: 0.985 });
  gsap.set(correctionRows, { autoAlpha: 0, y: 16 });

  timeline.addLabel("enter");
  effects.fadeUp(timeline, title, {}, "enter");
  timeline.addLabel("context", ">+=0.1");
  effects.scaleIn(timeline, image, { duration: 0.5 }, "context");
  timeline.addLabel("corrections", ">+=0.14");
  effects.fadeUp(
    timeline,
    correctionRows,
    { duration: 0.42, stagger: 0.1 },
    "corrections",
  );
  timeline.addLabel("settled");

  return timeline;
}
