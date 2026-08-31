export const motionTargets = [
  "curse-title",
  "curse-symptoms",
  "curse-image",
  "curse-practice",
];

export function createMotion(_slide, { effects, gsap, target }) {
  const title = target("curse-title");
  const symptoms = target("curse-symptoms");
  const [jargon, abstraction, context] = symptoms.querySelectorAll(":scope > article");
  const image = target("curse-image");
  const practice = target("curse-practice");
  const timeline = gsap.timeline({
    paused: true,
    defaults: { duration: 0.5, ease: "power3.out" },
  });

  gsap.set(title, { autoAlpha: 0, y: 20 });
  gsap.set(jargon, { autoAlpha: 0, x: -28 });
  gsap.set(abstraction, { autoAlpha: 0, scale: 0.96 });
  gsap.set(context, { autoAlpha: 0, x: 28 });
  gsap.set(image, { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" });
  gsap.set(practice, { autoAlpha: 0, x: 28 });

  timeline.addLabel("enter");
  effects.fadeUp(timeline, title, {}, "enter");
  timeline.addLabel("symptoms", ">+=0.08");
  effects.revealX(timeline, jargon, { duration: 0.36 }, "symptoms");
  effects.scaleIn(timeline, abstraction, { duration: 0.36 }, "symptoms+=0.12");
  effects.revealX(timeline, context, { duration: 0.36 }, "symptoms+=0.24");
  timeline.addLabel("practice", ">+=0.1");
  effects.wipeIn(timeline, image, { duration: 0.45 }, "practice");
  effects.revealX(timeline, practice, { duration: 0.42 }, "practice+=0.1");
  timeline.addLabel("settled");

  return timeline;
}
