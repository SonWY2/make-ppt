import * as effects from "./effects.js";

const query = new URLSearchParams(window.location.search);
const debugMode = query.get("motion-debug") === "1";
const editMode = query.get("edit") === "1";
const motionDisabled = query.get("motion") === "off";
const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");


function releaseBootGuard() {
  document.documentElement.removeAttribute("data-motion-boot");
}
if (!editMode) {
  initializeMotion();
}

function initializeMotion() {
  if (motionDisabled) {
    releaseBootGuard();
    return;
  }

  const gsap = window.gsap;
  if (!gsap) {
    releaseBootGuard();
    console.warn("[motion] GSAP did not load; static slide remains active.");
    return;
  }

  const state = {
    enabled: true,
    simulatedReducedMotion: false,
    timeline: null,
    context: null,
    slide: null,
    module: null,
    status: "static",
    currentCue: null,
    mountVersion: 0,
  };

  const controller = {
    play() {
      state.timeline?.play();
      renderDebug();
    },
    pause() {
      state.timeline?.pause();
      renderDebug();
    },
    restart() {
      state.timeline?.restart();
      renderDebug();
    },
    seek(position) {
      if (!state.timeline) return;
      state.timeline.pause().seek(position);
      if (typeof position === "string") state.currentCue = position;
      renderDebug();
    },
    setEnabled(enabled) {
      state.enabled = enabled;
      return mountActiveSlide({ autoplay: false });
    },
    setReducedMotion(enabled) {
      state.simulatedReducedMotion = enabled;
      return mountActiveSlide({ autoplay: false });
    },
    cleanup() {
      cleanupMotion();
      state.status = "static";
      renderDebug();
    },
    snapshot() {
      return {
        activeSlide: state.slide?.dataset.slideIndex ?? null,
        duration: state.timeline?.duration() ?? 0,
        enabled: state.enabled,
        labels: cueEntries(),
        mounted: Boolean(state.timeline),
        reducedMotion: prefersReducedMotion(),
        status: state.status,
        time: state.timeline?.time() ?? 0,
      };
    },
  };

  window.__presentationMotion = controller;
  window.addEventListener("presentation:slidechange", (event) => {
    void mountSlide(event.detail.slide, { autoplay: !debugMode });
  });
  reducedMotionMedia.addEventListener("change", () => {
    void mountActiveSlide({ autoplay: false });
  });

  if (debugMode) createDebugPanel();
  void mountActiveSlide({ autoplay: !debugMode });

  function prefersReducedMotion() {
    return state.simulatedReducedMotion || reducedMotionMedia.matches;
  }

  function activeSlide() {
    return document.querySelector(".slide.is-active:not([hidden])");
  }

  async function mountActiveSlide(options) {
    return mountSlide(activeSlide(), options);
  }

  async function mountSlide(slide, { autoplay }) {
    const mountVersion = ++state.mountVersion;
    cleanupMotion();
    state.slide = slide;
    state.module = null;
    state.currentCue = null;

    if (!slide) {
      state.status = "static";
      releaseBootGuard();
      renderDebug();
      return;
    }
    if (!state.enabled) {
      state.status = "disabled";
      releaseBootGuard();
      renderDebug();
      return;
    }
    if (prefersReducedMotion()) {
      state.status = "reduced";
      releaseBootGuard();
      renderDebug();
      return;
    }

    const motionModule = await loadSlideMotion(Number(slide.dataset.slideIndex));
    if (mountVersion !== state.mountVersion || slide !== activeSlide()) return;
    if (!motionModule) {
      state.status = "static";
      releaseBootGuard();
      renderDebug();
      return;
    }

    try {
      const target = createTargetResolver(slide, motionModule.motionTargets);
      let timeline;
      const context = gsap.context(() => {
        timeline = motionModule.createMotion(slide, { effects, gsap, target });
      }, slide);
      if (!timeline || typeof timeline.seek !== "function") {
        context.revert();
        throw new Error(`[motion] slide-${slide.dataset.slideIndex} did not return a GSAP timeline.`);
      }
      if (!Object.hasOwn(timeline.labels, "settled")) {
        context.revert();
        throw new Error(`[motion] slide-${slide.dataset.slideIndex} is missing the required settled cue.`);
      }

      timeline.pause(0);
      timeline.eventCallback("onUpdate", renderDebug);
      state.timeline = timeline;
      state.context = context;
      state.module = motionModule;
      releaseBootGuard();
      state.status = "ready";
      renderDebug();

      if (autoplay) {
        requestAnimationFrame(() => {
          if (mountVersion === state.mountVersion && state.timeline === timeline) timeline.play(0);
        });
      }
    } catch (error) {
      cleanupMotion();
      releaseBootGuard();
      state.status = "error";
      console.warn(error.message);
      renderDebug();
    }
  }

  async function loadSlideMotion(index) {
    const filename = `slide-${String(index).padStart(2, "0")}.js`;
    try {
      return await import(`../../decks/current/motion/${filename}`);
    } catch (error) {
      if (!String(error.message).includes(filename)) {
        console.warn(`[motion] could not load ${filename}; static slide remains active.`);
      }
      return null;
    }
  }

  function createTargetResolver(slide, targetIds = []) {
    const layers = new Map();
    for (const layer of slide.querySelectorAll("[data-layer-id]")) {
      const layerId = layer.dataset.layerId;
      if (layers.has(layerId)) {
        throw new Error(`[motion] duplicate layer ID: slide-${slide.dataset.slideIndex} / ${layerId}`);
      }
      layers.set(layerId, layer);
    }

    for (const layerId of targetIds) {
      const layer = layers.get(layerId);
      if (!layer) {
        throw new Error(`[motion] target not found: slide-${slide.dataset.slideIndex} / ${layerId}`);
      }
      const shells = [...layer.children].filter((child) => child.matches(`.motion-shell[data-motion-target="${layerId}"]`));
      if (shells.length !== 1) {
        throw new Error(`[motion] motion shell must be unique: slide-${slide.dataset.slideIndex} / ${layerId}`);
      }
    }

    return (layerId) => {
      const layer = layers.get(layerId);
      if (!layer) {
        throw new Error(`[motion] target not found: slide-${slide.dataset.slideIndex} / ${layerId}`);
      }
      const shells = [...layer.children].filter((child) => child.matches(`.motion-shell[data-motion-target="${layerId}"]`));
      if (shells.length !== 1) {
        throw new Error(`[motion] motion shell must be unique: slide-${slide.dataset.slideIndex} / ${layerId}`);
      }
      return shells[0];
    };
  }

  function cleanupMotion() {
    state.timeline?.kill();
    state.context?.revert();
    state.timeline = null;
    state.context = null;
  }

  function cueEntries() {
    return Object.entries(state.timeline?.labels ?? {})
      .sort(([, first], [, second]) => first - second)
      .map(([name, time]) => ({ name, time }));
  }

  function createDebugPanel() {
    const panel = document.createElement("aside");
    panel.className = "motion-debug";
    panel.setAttribute("aria-label", "Motion debug");
    panel.innerHTML = `
      <strong>Motion Debug</strong>
      <div class="motion-debug__buttons">
        <button type="button" data-motion-action="play">Play</button>
        <button type="button" data-motion-action="pause">Pause</button>
        <button type="button" data-motion-action="restart">Restart</button>
        <button type="button" data-motion-action="toggle">Motion: on</button>
      </div>
      <label class="motion-debug__range">Seek <input data-motion-seek type="range" min="0" max="0" step="0.01" value="0" /></label>
      <output data-motion-time>0.00 / 0.00</output>
      <div class="motion-debug__cues" data-motion-cues></div>
      <label class="motion-debug__check"><input data-motion-reduced type="checkbox" /> Reduced motion simulation</label>
      <label class="motion-debug__feedback">Feedback
        <select data-motion-layer></select>
        <textarea data-motion-note rows="2" placeholder="현재 cue의 모션 피드백"></textarea>
      </label>
      <button type="button" data-motion-action="feedback">피드백 저장</button>
      <output data-motion-status></output>
    `;
    document.body.append(panel);

    panel.addEventListener("click", (event) => {
      const action = event.target.closest("[data-motion-action]")?.dataset.motionAction;
      if (action === "play") controller.play();
      if (action === "pause") controller.pause();
      if (action === "restart") controller.restart();
      if (action === "toggle") void controller.setEnabled(!state.enabled);
      if (action === "feedback") void saveFeedback(panel);
      const cue = event.target.closest("[data-motion-cue]")?.dataset.motionCue;
      if (cue) controller.seek(cue);
    });
    panel.querySelector("[data-motion-seek]").addEventListener("input", (event) => controller.seek(Number(event.target.value)));
    panel.querySelector("[data-motion-reduced]").addEventListener("change", (event) => {
      void controller.setReducedMotion(event.target.checked);
    });
  }

  async function saveFeedback(panel) {
    const note = panel.querySelector("[data-motion-note]").value.trim();
    const layerId = panel.querySelector("[data-motion-layer]").value;
    const cueId = state.currentCue || cueEntries()[0]?.name;
    if (!note || !layerId || !cueId || !state.slide) return;

    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        slide: Number(state.slide.dataset.slideIndex),
        layerId,
        cueId,
        type: "comment",
        note,
      }),
    });
    const status = panel.querySelector("[data-motion-status]");
    if (!response.ok) {
      status.textContent = "피드백을 저장하지 못했습니다.";
      return;
    }
    panel.querySelector("[data-motion-note]").value = "";
    status.textContent = `${cueId} 피드백을 저장했습니다.`;
  }

  function renderDebug() {
    if (!debugMode) return;
    const panel = document.querySelector(".motion-debug");
    if (!panel) return;

    const duration = state.timeline?.duration() ?? 0;
    const time = state.timeline?.time() ?? 0;
    panel.querySelector("[data-motion-time]").value = `${time.toFixed(2)} / ${duration.toFixed(2)}`;
    const seek = panel.querySelector("[data-motion-seek]");
    seek.max = String(duration);
    seek.value = String(Math.min(time, duration));
    panel.querySelector("[data-motion-reduced]").checked = state.simulatedReducedMotion;
    panel.querySelector("[data-motion-action=toggle]").textContent = `Motion: ${state.enabled ? "on" : "off"}`;

    const cues = panel.querySelector("[data-motion-cues]");
    cues.replaceChildren(...cueEntries().map(({ name }) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.motionCue = name;
      button.textContent = name;
      return button;
    }));

    const layerSelect = panel.querySelector("[data-motion-layer]");
    const selectedLayer = layerSelect.value;
    const targetIds = state.module?.motionTargets ?? [];
    layerSelect.replaceChildren(...targetIds.map((layerId) => {
      const option = document.createElement("option");
      option.value = layerId;
      option.textContent = layerId;
      option.selected = layerId === selectedLayer;
      return option;
    }));
    panel.querySelector("[data-motion-status]").value = state.status;
  }
}
