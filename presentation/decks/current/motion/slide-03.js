export const motionTargets = [
  "curse-title",
  "curse-symptoms",
  "curse-image",
  "curse-practice",
];

export function createMotion(_slide, { effects, gsap, target }) {
  const title = target("curse-title");
  const symptoms = target("curse-symptoms");
  const symptomCards = symptoms.querySelectorAll(":scope > article");
  const image = target("curse-image");
  const practice = target("curse-practice");
  const timeline = gsap.timeline({
    paused: true,
    defaults: { duration: 0.5, ease: "power3.out" },
  });

  gsap.set(title, { autoAlpha: 0, y: 20 });
  gsap.set(symptomCards, { autoAlpha: 0, y: 14 });
  gsap.set(image, { autoAlpha: 0, scale: 0.985 });
  gsap.set(practice, { autoAlpha: 0, y: 16 });

  timeline.addLabel("enter");
  effects.fadeUp(timeline, title, {}, "enter");
  timeline.addLabel("symptoms", ">+=0.08");
  effects.fadeUp(timeline, symptomCards, { duration: 0.4, stagger: 0.08 }, "symptoms");
  timeline.addLabel("practice", ">+=0.1");
  effects.scaleIn(timeline, image, { duration: 0.45 }, "practice");
  effects.fadeUp(timeline, practice, { duration: 0.42 }, ">+=0.08");
  timeline.addLabel("settled");

  return timeline;
}
