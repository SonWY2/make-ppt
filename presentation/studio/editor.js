(() => {
  'use strict';

  const slide = document.querySelector('#slide');
  if (!slide) return;
  const SLIDE_ID = Number(slide.dataset.slideIndex);
  const CANVAS_WIDTH = 1600;
  const CANVAS_HEIGHT = 900;
  const REFERENCE_BY_SLIDE = Object.freeze({
    1: '/references/canva-1/canva-01.jpg',
    2: '/references/canva-1/canva-06.jpg',
    3: '/references/canva-1/canva-03.jpg',
    4: '/references/canva-1/canva-05.jpg',
    5: '/references/canva-1/canva-10.jpg',
    6: '/references/canva-1/canva-04.jpg',
    7: '/references/canva-1/canva-09.jpg',
    8: '/references/canva-1/canva-08.jpg',
  });
  const REFERENCE_URL = REFERENCE_BY_SLIDE[SLIDE_ID];
  const MOVEABLE_URL = '/vendor/moveable.min.js';
  const DEFAULT_CROP = Object.freeze({ x: 0, y: 0, zoom: 1 });
  const SLIDE_COUNT = document.querySelectorAll('.slide[data-slide-index]').length;

  const layers = [...slide.querySelectorAll('[data-layer-id]')];
  const imageLayerIds = new Set(layers.filter((layer) => layer.classList.contains('image-frame')).map((layer) => layer.dataset.layerId));
  const byId = new Map(layers.map((layer) => [layer.dataset.layerId, layer]));
  const defaults = new Map(layers.map((layer) => [layer.dataset.layerId, readGeometry(layer)]));
  const cropDefaults = new Map(layers
    .filter((layer) => imageLayerIds.has(layer.dataset.layerId))
    .map((layer) => [layer.dataset.layerId, readCropDefault(layer)]));
  const crops = new Map([...cropDefaults].map(([layerId, crop]) => [layerId, { ...crop }]));
  const history = [];
  let selected = null;
  let transaction = null;
  let moveable = null;
  let referenceVisible = false;
  let compareVisible = false;
  let commentMode = null;
  let cropMode = false;
  let showCommentHistory = false;

  const ui = createEditorUi();
  loadState();
  loadFeedback();
  loadMoveable();
  enableSourceReload();

  function enableSourceReload() {
    const events = new EventSource('/api/events');
    events.addEventListener('reload', () => window.location.reload());
  }

  function goToSlide(number) {
    const target = Math.max(1, Math.min(SLIDE_COUNT, number));
    if (target === SLIDE_ID) return;
    const url = new URL(window.location.href);
    url.searchParams.set('editSlide', String(target));
    url.hash = `slide-${target}`;
    window.location.assign(url);
  }

  function readGeometry(layer) {
    const style = layer.style;
    return {
      x: numberValue(style.getPropertyValue('--x')),
      y: numberValue(style.getPropertyValue('--y')),
      width: numberValue(style.getPropertyValue('--w')),
      height: numberValue(style.getPropertyValue('--h')),
    };
  }

  function numberValue(value) {
    return Number.parseFloat(value) || 0;
  }

  function readCropDefault(layer) {
    const zoom = Number.parseFloat(layer.style.getPropertyValue('--crop-zoom'));
    return {
      x: DEFAULT_CROP.x,
      y: DEFAULT_CROP.y,
      zoom: Number.isFinite(zoom) ? zoom : DEFAULT_CROP.zoom,
    };
  }

  function canonicalScale() {
    const rect = slide.getBoundingClientRect();
    return rect.width / CANVAS_WIDTH;
  }

  function canonicalRect(layer) {
    const canvasRect = slide.getBoundingClientRect();
    const rect = layer.getBoundingClientRect();
    const scale = canvasRect.width / CANVAS_WIDTH;
    return {
      x: (rect.left - canvasRect.left) / scale,
      y: (rect.top - canvasRect.top) / scale,
      width: rect.width / scale,
      height: rect.height / scale,
    };
  }

  function canonicalPoint(clientX, clientY) {
    const canvasRect = slide.getBoundingClientRect();
    const scale = canvasRect.width / CANVAS_WIDTH;
    return {
      x: (clientX - canvasRect.left) / scale,
      y: (clientY - canvasRect.top) / scale,
    };
  }

  function roundedGeometry(geometry) {
    return Object.fromEntries(Object.entries(geometry).map(([key, value]) => [key, Math.round(value * 100) / 100]));
  }

  function applyGeometry(layer, geometry) {
    const next = roundedGeometry(geometry);
    layer.style.setProperty('--x', `${next.x}px`);
    layer.style.setProperty('--y', `${next.y}px`);
    layer.style.setProperty('--w', `${Math.max(1, next.width)}px`);
    layer.style.setProperty('--h', `${Math.max(1, next.height)}px`);
  }

  function equalGeometry(first, second) {
    return ['x', 'y', 'width', 'height'].every((key) => Math.abs(first[key] - second[key]) < 0.01);
  }

  async function loadState() {
    try {
      const response = await fetch('/api/state');
      if (!response.ok) throw new Error(`State request failed (${response.status})`);
      const payload = await response.json();
      const overrides = payload.overrides?.[String(SLIDE_ID)] || {};
      for (const [layerId, override] of Object.entries(overrides)) {
        const layer = byId.get(layerId);
        const geometry = override?.geometry || override;
        if (layer && validGeometry(geometry)) applyGeometry(layer, geometry);
        if (layer && imageLayerIds.has(layerId) && validCrop(override?.crop)) {
          const savedCrop = roundedCrop(override.crop);
          crops.set(layerId, savedCrop);
          applyCrop(layer, savedCrop, false);
        }
      }
      moveable?.updateRect();
    } catch (error) {
      setStatus('Saved layout is unavailable. Editing remains local until the server reconnects.', true);
    }
  }

  function validGeometry(geometry) {
    return geometry && ['x', 'y', 'width', 'height'].every((key) => Number.isFinite(geometry[key]));
  }

  function roundedCrop(value) {
    return {
      x: Math.round(value.x * 100) / 100,
      y: Math.round(value.y * 100) / 100,
      zoom: Math.round(value.zoom * 100) / 100,
    };
  }

  function validCrop(value) {
    return value && ['x', 'y', 'zoom'].every((key) => Number.isFinite(value[key]))
      && value.zoom >= 1 && value.zoom <= 2.5;
  }

  function equalCrop(first, second) {
    return ['x', 'y', 'zoom'].every((key) => Math.abs(first[key] - second[key]) < 0.01);
  }

  async function loadFeedback() {
    try {
      const response = await fetch('/api/feedback');
      if (!response.ok) throw new Error(`Feedback request failed (${response.status})`);
      const payload = await response.json();
      renderFeedback(Array.isArray(payload.events) ? payload.events : []);
    } catch (error) {
      setStatus('Comments could not be loaded.', true);
    }
  }

  async function loadMoveable() {
    try {
      await loadScript(MOVEABLE_URL);
      if (!window.Moveable) throw new Error('Moveable did not initialize');
      moveable = new window.Moveable(document.body, {
        target: null,
        draggable: true,
        resizable: true,
        snappable: true,
        snapContainer: slide,
        elementGuidelines: layers,
        snapDirections: { top: true, right: true, bottom: true, left: true, center: true, middle: true },
        elementSnapDirections: { top: true, right: true, bottom: true, left: true, center: true, middle: true },
        bounds: { left: 0, top: 0, right: CANVAS_WIDTH, bottom: CANVAS_HEIGHT },
        throttleDrag: 0,
        throttleResize: 0,
      });

      moveable
        .on('click', (event) => selectLayer(event.target.closest('[data-layer-id]')))
        .on('dragStart', () => {
          if (selected) transaction = readGeometry(selected);
        })
        .on('drag', (event) => {
          if (!selected || !transaction) return;
          applyGeometry(selected, {
            ...transaction,
            x: transaction.x + event.beforeTranslate[0],
            y: transaction.y + event.beforeTranslate[1],
          });
        })
        .on('dragEnd', () => commitTransaction())
        .on('resizeStart', () => {
          if (selected) transaction = readGeometry(selected);
        })
        .on('resize', (event) => {
          if (!selected || !transaction) return;
          const translation = event.drag.beforeTranslate;
          applyGeometry(selected, {
            x: transaction.x + translation[0],
            y: transaction.y + translation[1],
            width: event.width,
            height: event.height,
          });
        })
        .on('resizeEnd', () => commitTransaction());
    } catch (error) {
      setStatus('Moveable controls are unavailable. Use keyboard nudging while this page is open.', true);
    }
  }

  function loadScript(source) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = source;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Could not load ${source}`));
      document.head.append(script);
    });
  }

  function selectLayer(layer) {
    if (!layer || !byId.has(layer.dataset.layerId)) return deselect();
    if (selected === layer) return;
    selected?.removeAttribute('data-studio-selected');
    selected = layer;
    selected.setAttribute('data-studio-selected', 'true');
    moveable && (moveable.target = selected);
    cropMode = false;
    updateControls();
    setStatus(`Selected ${selected.dataset.layerId.replace('-', ' ')}.`);
  }

  function deselect() {
    selected?.removeAttribute('data-studio-selected');
    selected = null;
    transaction = null;
    cropMode = false;
    if (moveable) moveable.target = null;
    updateControls();
    setStatus('No layer selected.');
  }

  function commitTransaction() {
    if (!selected || !transaction) return;
    const before = transaction;
    const after = roundedGeometry(canonicalRect(selected));
    applyGeometry(selected, after);
    transaction = null;
    if (equalGeometry(before, after)) return;
    history.push({ layerId: selected.dataset.layerId, before, after });
    persistGeometry(selected.dataset.layerId, before, after);
    setStatus('Layout saved.');
  }

  async function persistGeometry(layerId, before, after) {
    try {
      const response = await fetch('/api/geometry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slide: SLIDE_ID, layerId, type: 'geometry', before, after }),
      });
      if (!response.ok) throw new Error(`Save failed (${response.status})`);
    } catch (error) {
      setStatus('Layout change could not be saved.', true);
    }
  }

  function nudge(event) {
    if (!selected) return;
    const distance = event.shiftKey ? 10 : 1;
    const before = readGeometry(selected);
    const after = { ...before };
    if (event.key === 'ArrowLeft') after.x -= distance;
    if (event.key === 'ArrowRight') after.x += distance;
    if (event.key === 'ArrowUp') after.y -= distance;
    if (event.key === 'ArrowDown') after.y += distance;
    applyGeometry(selected, after);
    moveable?.updateRect();
    history.push({ layerId: selected.dataset.layerId, before, after });
    persistGeometry(selected.dataset.layerId, before, after);
    setStatus('Layout saved.');
  }

  function cropByKeyboard(event) {
    if (!cropMode || !selected || !imageLayerIds.has(selected.dataset.layerId)) return false;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', '_'].includes(event.key)) return false;
    const layerId = selected.dataset.layerId;
    const before = { ...(crops.get(layerId) || cropDefaults.get(layerId) || DEFAULT_CROP) };
    const after = { ...before };
    const distance = event.shiftKey ? 12 : 3;
    if (event.key === 'ArrowLeft') after.x -= distance;
    if (event.key === 'ArrowRight') after.x += distance;
    if (event.key === 'ArrowUp') after.y -= distance;
    if (event.key === 'ArrowDown') after.y += distance;
    if (event.key === '+' || event.key === '=') after.zoom = Math.min(2.5, after.zoom + 0.05);
    if (event.key === '-' || event.key === '_') after.zoom = Math.max(1, after.zoom - 0.05);
    const next = roundedCrop(after);
    crops.set(layerId, next);
    applyCrop(selected, next);
    if (equalCrop(before, next)) return true;
    history.push({ kind: 'crop', layerId, before, after: { ...next } });
    persistCrop(layerId, before, next);
    return true;
  }

  function applyCrop(layer, value, announce = true) {
    const image = layer?.querySelector('img');
    if (!image) return;
    image.style.setProperty('--crop-pan-x', `${value.x}px`);
    image.style.setProperty('--crop-pan-y', `${value.y}px`);
    image.style.setProperty('--crop-zoom', value.zoom.toFixed(2));
    if (announce) setStatus(`Crop ${Math.round(value.zoom * 100)}%. Arrows pan; Shift + arrows pans faster.`);
  }

  async function persistCrop(layerId, before, after) {
    try {
      const response = await fetch('/api/crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slide: SLIDE_ID, layerId, type: 'crop', before, after }),
      });
      if (!response.ok) throw new Error(`Save failed (${response.status})`);
    } catch (error) {
      setStatus('Crop change could not be saved.', true);
    }
  }

  function undo() {
    const change = history.pop();
    if (!change) {
      setStatus('Nothing to undo.');
      return;
    }
    if (change.kind === 'crop') {
      const layer = byId.get(change.layerId);
      if (!layer) return;
      crops.set(change.layerId, { ...change.before });
      applyCrop(layer, change.before, false);
      persistCrop(change.layerId, change.after, change.before);
      setStatus('Last crop change undone.');
      return;
    }
    const layer = byId.get(change.layerId);
    if (!layer) return;
    applyGeometry(layer, change.before);
    moveable?.updateRect();
    persistGeometry(change.layerId, change.after, change.before);
    setStatus('Last layout change undone.');
  }

  async function resetLayout() {
    const resetLayers = selected ? [selected] : layers;
    try {
      await Promise.all(resetLayers.map(async (layer) => {
        const response = await fetch('/api/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slide: SLIDE_ID, layerId: layer.dataset.layerId }),
        });
        if (!response.ok) throw new Error(`Reset failed (${response.status})`);
        applyGeometry(layer, defaults.get(layer.dataset.layerId));
        if (imageLayerIds.has(layer.dataset.layerId)) {
          const defaultCrop = { ...(cropDefaults.get(layer.dataset.layerId) || DEFAULT_CROP) };
          crops.set(layer.dataset.layerId, defaultCrop);
          applyCrop(layer, defaultCrop, false);
        }
      }));
      history.length = 0;
      moveable?.updateRect();
      setStatus(selected ? 'Selected layer reset.' : 'All layers reset.');
    } catch (error) {
      setStatus('Layout reset could not be saved.', true);
    }
  }

  function toggleReference() {
    referenceVisible = !referenceVisible;
    ui.referenceOverlay.hidden = !referenceVisible;
    ui.referenceToggle.setAttribute('aria-pressed', String(referenceVisible));
    setStatus(referenceVisible ? 'Reference overlay shown.' : 'Reference overlay hidden.');
  }

  function toggleCompare() {
    compareVisible = !compareVisible;
    ui.compare.hidden = !compareVisible;
    ui.compareToggle.setAttribute('aria-pressed', String(compareVisible));
    if (compareVisible) refreshCurrentPreview();
  }

  function refreshCurrentPreview() {
    const clone = slide.cloneNode(true);
    clone.removeAttribute('id');
    clone.querySelectorAll('[data-studio-reference], [data-studio-marker-layer]').forEach((node) => node.remove());
    clone.querySelectorAll('[data-studio-selected]').forEach((node) => node.removeAttribute('data-studio-selected'));
    ui.currentPreview.replaceChildren(clone);
  }

  async function addLayerComment() {
    if (!selected) {
      setStatus('Select a layer before adding a layer comment.', true);
      return;
    }
    const note = window.prompt(`Comment on ${selected.dataset.layerId}:`);
    if (!note?.trim()) return;
    const event = {
      slide: SLIDE_ID,
      layerId: selected.dataset.layerId,
      type: 'comment',
      note: note.trim(),
      rect: roundedGeometry(canonicalRect(selected)),
    };
    const saved = await persistFeedback(event);
    if (saved) renderFeedback([saved], true);
  }

  function enterPointCommentMode() {
    commentMode = commentMode === 'point' ? null : 'point';
    ui.pointCommentToggle.setAttribute('aria-pressed', String(commentMode === 'point'));
    slide.classList.toggle('is-commenting', commentMode === 'point');
    setStatus(commentMode === 'point' ? 'Click the canvas to place a comment.' : 'Point comment mode closed.');
  }

  async function addPointComment(event) {
    const note = window.prompt('Comment on this point:');
    if (!note?.trim()) return;
    const point = canonicalPoint(event.clientX, event.clientY);
    const feedback = { slide: SLIDE_ID, layerId: null, type: 'point', note: note.trim(), x: point.x, y: point.y };
    const saved = await persistFeedback(feedback);
    if (saved) renderFeedback([saved], true);
    enterPointCommentMode();
  }

  async function persistFeedback(feedback) {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });
      if (!response.ok) throw new Error(`Feedback save failed (${response.status})`);
      const payload = await response.json();
      setStatus('Comment saved.');
      return payload.event;
    } catch (error) {
      setStatus('Comment could not be saved.', true);
      return false;
    }
  }

  function annotationState(events) {
    const handled = new Set(
      events
        .filter((event) => event.type === 'resolution' && ['applied', 'rejected'].includes(event.status))
        .flatMap((event) => Array.isArray(event.feedbackIds) ? event.feedbackIds : []),
    );
    const annotations = events.filter((event) => Number(event.slide) === SLIDE_ID && ['comment', 'point'].includes(event.type));
    return {
      pending: annotations.filter((event) => !handled.has(event.id)),
      history: annotations.filter((event) => handled.has(event.id)),
    };
  }

  async function dismissFeedback(event) {
    try {
      const response = await fetch('/api/feedback/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackIds: [event.id], status: 'rejected' }),
      });
      if (!response.ok) throw new Error(`Dismiss failed (${response.status})`);
      await loadFeedback();
      setStatus('Comment dismissed. It remains in history.');
    } catch (error) {
      setStatus('Comment could not be dismissed.', true);
    }
  }

  function toggleCommentHistory() {
    showCommentHistory = !showCommentHistory;
    ui.historyToggle.setAttribute('aria-pressed', String(showCommentHistory));
    renderFeedback(ui.events);
    setStatus(showCommentHistory ? 'Comment history shown.' : 'Only active comments shown.');
  }

  function renderFeedback(events, append = false) {
    const allEvents = append ? [...ui.events, ...events] : events;
    ui.events = allEvents;
    ui.markerLayer.replaceChildren();
    ui.commentList.replaceChildren();
    const { pending, history } = annotationState(allEvents);
    const visible = showCommentHistory ? [...pending, ...history] : pending;
    for (const event of visible) {
      const isHistory = history.includes(event);
      if (event.type === 'point' && Number.isFinite(event.x) && Number.isFinite(event.y)) {
        const marker = document.createElement('span');
        marker.className = `studio-marker${isHistory ? ' is-history' : ''}`;
        marker.style.left = `${(event.x / CANVAS_WIDTH) * 100}%`;
        marker.style.top = `${(event.y / CANVAS_HEIGHT) * 100}%`;
        marker.title = event.note;
        marker.setAttribute('aria-label', `Point comment: ${event.note}`);
        ui.markerLayer.append(marker);
      }
      const item = document.createElement('li');
      item.className = `studio-comment${isHistory ? ' is-history' : ''}`;
      const note = document.createElement('span');
      note.textContent = event.layerId ? `${event.layerId}: ${event.note}` : `Canvas point: ${event.note}`;
      item.append(note);
      if (!isHistory) {
        const dismiss = document.createElement('button');
        dismiss.type = 'button';
        dismiss.className = 'studio-comment__dismiss';
        dismiss.textContent = 'Dismiss';
        dismiss.addEventListener('click', () => dismissFeedback(event));
        item.append(dismiss);
      }
      ui.commentList.append(item);
    }
  }

  function updateControls() {
    ui.selectedName.textContent = selected ? selected.dataset.layerId : 'No layer selected';
    ui.layerComment.disabled = !selected;
    ui.cropToggle.disabled = !selected || !imageLayerIds.has(selected.dataset.layerId);
    ui.cropToggle.setAttribute('aria-pressed', String(cropMode));
  }

  function setStatus(message, isError = false) {
    ui.status.textContent = message;
    ui.status.dataset.error = String(isError);
  }

  function createEditorUi() {
    const style = document.createElement('style');
    style.textContent = `
      .studio-toolbar { position: fixed; z-index: 50; top: var(--space-2); left: var(--space-2); width: 292px; padding: var(--space-2); background: var(--ink); color: var(--white-ink); box-shadow: var(--shadow-float); font: 13px/1.35 var(--font-ui); }
      .studio-toolbar__title { margin: 0 0 12px; font: 400 24px/1 var(--font-display); }
      .studio-toolbar__selected { margin: 0 0 12px; color: var(--paper-deep); }
      .studio-toolbar__actions { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-1); }
      .studio-toolbar__slides { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: var(--space-1); margin: 0 0 12px; }
      .studio-toolbar__slides button { text-align: center; }
      .studio-toolbar__slide-count { margin: 0; color: var(--paper-deep); font-size: 11px; font-weight: 700; white-space: nowrap; }
      .studio-toolbar button, .studio-toolbar input { font: inherit; }
      .studio-toolbar button { min-height: var(--space-4); padding: 6px var(--space-1); border: 1px solid var(--moss); border-radius: 0; background: transparent; color: var(--white-ink); cursor: pointer; text-align: left; }
      .studio-toolbar button:hover, .studio-toolbar button[aria-pressed='true'] { background: var(--moss-deep); }
      .studio-toolbar button:focus-visible, .studio-toolbar input:focus-visible { outline: 2px solid var(--apricot); outline-offset: 2px; }
      .studio-toolbar button:disabled { cursor: not-allowed; opacity: .45; }
      .studio-toolbar label { display: grid; gap: 6px; margin-top: 12px; color: var(--paper-deep); }
      .studio-toolbar input { accent-color: var(--apricot); }
      .studio-toolbar__status { min-height: 36px; margin: 12px 0 0; color: var(--paper-deep); }
      .studio-toolbar__status[data-error='true'] { color: var(--apricot); }
      .studio-comments { max-height: 112px; margin: 10px 0 0; padding: var(--space-1) 0 0 18px; overflow: auto; border-top: 1px solid var(--ink-soft); color: var(--paper-deep); }
      .studio-comment { display: flex; gap: 6px; align-items: flex-start; justify-content: space-between; margin-bottom: 5px; }
      .studio-comment.is-history, .studio-marker.is-history { opacity: .32; }
      .studio-comment__dismiss { min-height: 0 !important; padding: 1px 5px !important; border-color: var(--ink-soft) !important; font-size: 11px !important; }
      [data-studio-selected='true'] { outline: 2px solid var(--apricot); outline-offset: 4px; }
      .is-commenting { cursor: crosshair; }
      .studio-reference { position: absolute; z-index: 20; inset: 0; width: 100%; height: 100%; pointer-events: none; object-fit: fill; }
      .studio-marker-layer { position: absolute; z-index: 30; inset: 0; pointer-events: none; }
      .studio-marker { position: absolute; width: var(--space-2); height: var(--space-2); border: 2px solid var(--ink); border-radius: 50%; background: var(--apricot); transform: translate(-50%, -50%); box-shadow: 0 0 0 2px var(--white-ink); }
      .studio-compare { position: fixed; z-index: 45; right: var(--space-2); bottom: var(--space-2); display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; width: min(900px, calc(100vw - 32px)); padding: var(--space-2); background: var(--paper); box-shadow: var(--shadow-float); }
      .studio-compare[hidden] { display: none; }
      .studio-compare__close { position: absolute; top: var(--space-1); right: var(--space-1); width: 28px; height: 28px; border: 0; background: var(--ink); color: var(--white-ink); cursor: pointer; }
      .studio-compare h2 { margin: 0 0 var(--space-1); color: var(--ink-soft); font: 700 12px/1 var(--font-ui); letter-spacing: .08em; text-transform: uppercase; }
      .studio-compare__canvas { position: relative; height: 242px; overflow: hidden; background: var(--paper-deep); }
      .studio-compare__canvas .slide, .studio-compare__reference { position: absolute; top: 0; left: 0; width: 1600px; height: 900px; margin: 0; transform: scale(.268); transform-origin: top left; box-shadow: none; }
      .studio-compare__reference { object-fit: fill; }
      @media (max-width: 760px) { .studio-toolbar { left: var(--space-1); top: var(--space-1); width: 260px; } .studio-compare { grid-template-columns: 1fr; width: 360px; max-width: calc(100vw - var(--space-2)); } .studio-compare__canvas { height: 195px; } }
    `;
    document.head.append(style);

    const toolbar = document.createElement('aside');
    toolbar.className = 'studio-toolbar';
    toolbar.setAttribute('aria-label', 'Presentation editor');
    toolbar.innerHTML = `
      <p class="studio-toolbar__title">Edit slide</p>
      <p class="studio-toolbar__selected"><strong>Layer:</strong> <span data-selected-name>No layer selected</span></p>
      <nav class="studio-toolbar__slides" aria-label="Edit slide navigation">
        <button type="button" data-action="previous-slide"${SLIDE_ID === 1 ? ' disabled' : ''}>이전</button>
        <p class="studio-toolbar__slide-count">${SLIDE_ID} / ${SLIDE_COUNT}</p>
        <button type="button" data-action="next-slide"${SLIDE_ID === SLIDE_COUNT ? ' disabled' : ''}>다음</button>
      </nav>
      <div class="studio-toolbar__actions">
        <button type="button" data-action="undo">Undo</button>
        <button type="button" data-action="reset">Reset</button>
        <button type="button" data-action="layer-comment">Comment layer</button>
        <button type="button" data-action="point-comment" aria-pressed="false">Comment point</button>
        <button type="button" data-action="crop" aria-pressed="false">Crop image</button>
        <button type="button" data-action="reference" aria-pressed="false">Reference (R)</button>
        <button type="button" data-action="history" aria-pressed="false">History</button>
        <button type="button" data-action="compare" aria-pressed="false">Compare</button>
      </div>
      <label>Reference opacity <input data-action="opacity" type="range" min="0" max="100" value="55" /></label>
      <p class="studio-toolbar__status" role="status" aria-live="polite">No layer selected.</p>
      <ul class="studio-comments" aria-label="Saved comments"></ul>
    `;
    document.body.append(toolbar);

    const referenceOverlay = document.createElement('img');
    referenceOverlay.className = 'studio-reference';
    referenceOverlay.dataset.studioReference = '';
    referenceOverlay.alt = '';
    referenceOverlay.src = REFERENCE_URL;
    referenceOverlay.style.opacity = '0.55';
    referenceOverlay.hidden = true;
    slide.append(referenceOverlay);

    const markerLayer = document.createElement('div');
    markerLayer.className = 'studio-marker-layer';
    markerLayer.dataset.studioMarkerLayer = '';
    markerLayer.setAttribute('aria-hidden', 'true');
    slide.append(markerLayer);

    const compare = document.createElement('aside');
    compare.className = 'studio-compare';
    compare.hidden = true;
    compare.setAttribute('aria-label', 'Side-by-side reference comparison');
    compare.innerHTML = `
      <button class="studio-compare__close" type="button" aria-label="Close comparison">×</button>
      <section><h2>Current</h2><div class="studio-compare__canvas" data-current-preview></div></section>
      <section><h2>Reference</h2><div class="studio-compare__canvas"><img class="studio-compare__reference" alt="Reference slide" src="${REFERENCE_URL}" /></div></section>
    `;
    document.body.append(compare);

    const getAction = (name) => toolbar.querySelector(`[data-action="${name}"]`);
    const result = {
      selectedName: toolbar.querySelector('[data-selected-name]'),
      status: toolbar.querySelector('.studio-toolbar__status'),
      previousSlide: getAction('previous-slide'),
      nextSlide: getAction('next-slide'),
      layerComment: getAction('layer-comment'),
      pointCommentToggle: getAction('point-comment'),
      cropToggle: getAction('crop'),
      referenceToggle: getAction('reference'),
      compareToggle: getAction('compare'),
      historyToggle: getAction('history'),
      referenceOverlay,
      markerLayer,
      commentList: toolbar.querySelector('.studio-comments'),
      compare,
      currentPreview: compare.querySelector('[data-current-preview]'),
      events: [],
    };

    getAction('undo').addEventListener('click', undo);
    getAction('reset').addEventListener('click', resetLayout);
    result.previousSlide.addEventListener('click', () => goToSlide(SLIDE_ID - 1));
    result.nextSlide.addEventListener('click', () => goToSlide(SLIDE_ID + 1));
    result.layerComment.addEventListener('click', addLayerComment);
    result.pointCommentToggle.addEventListener('click', enterPointCommentMode);
    result.cropToggle.addEventListener('click', () => {
      cropMode = !cropMode;
      updateControls();
      setStatus(cropMode ? 'Crop mode: arrows pan; Shift + arrows pans faster; +/− zooms.' : 'Crop mode closed.');
    });
    result.referenceToggle.addEventListener('click', toggleReference);
    result.compareToggle.addEventListener('click', toggleCompare);
    result.historyToggle.addEventListener('click', toggleCommentHistory);
    getAction('opacity').addEventListener('input', (event) => {
      referenceOverlay.style.opacity = String(Number(event.target.value) / 100);
    });
    compare.querySelector('.studio-compare__close').addEventListener('click', toggleCompare);
    return result;
  }

  slide.addEventListener('click', (event) => {
    if (commentMode === 'point') {
      addPointComment(event);
      return;
    }
    selectLayer(event.target.closest('[data-layer-id]'));
  });

  document.addEventListener('keydown', (event) => {
    const active = document.activeElement;
    if (active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      if (commentMode === 'point') enterPointCommentMode();
      else deselect();
      return;
    }
    if (event.key.toLowerCase() === 'r') {
      event.preventDefault();
      toggleReference();
      return;
    }
    if (event.key.toLowerCase() === 'c') {
      event.preventDefault();
      if (selected) addLayerComment();
      else enterPointCommentMode();
      return;
    }
    if (cropByKeyboard(event)) {
      event.preventDefault();
      return;
    }
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      nudge(event);
    }
  });
})();
