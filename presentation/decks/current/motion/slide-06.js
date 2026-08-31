export const motionTargets = [
  "voice-title",
  "passive-principle",
  "concrete-image",
  "concrete-principle",
];

export function createMotion(_slide, { effects, gsap, target }) {
  const title = target("voice-title");
  const passivePrinciple = target("passive-principle");
  const concreteImage = target("concrete-image");
  const concretePrinciple = target("concrete-principle");
  const timeline = gsap.timeline({
    paused: true,
    defaults: { duration: 0.5, ease: "power3.out" },
  });

  gsap.set(title, { autoAlpha: 0, y: 18 });
  gsap.set(passivePrinciple, { autoAlpha: 0, y: 16 });
  gsap.set(concreteImage, { autoAlpha: 0, scale: 0.985 });
  gsap.set(concretePrinciple, { autoAlpha: 0, y: 14 });

  timeline.addLabel("enter");
  effects.fadeUp(timeline, title, {}, "enter");
  timeline.addLabel("passive", ">+=0.06");
  effects.fadeUp(timeline, passivePrinciple, { duration: 0.48 }, "passive");
  timeline.addLabel("concrete", ">+=0.08");
  effects.scaleIn(timeline, concreteImage, { duration: 0.5 }, "concrete");
  effects.fadeUp(timeline, concretePrinciple, { duration: 0.42 }, "concrete+=0.14");
  timeline.addLabel("settled");

  return timeline;
}
