import { startServer } from "./server.mjs";

const reviewUrl = new URL("../review/", import.meta.url);
const overridesUrl = new URL("overrides.json", reviewUrl);
const feedbackUrl = new URL("feedback.jsonl", reviewUrl);
const originalOverrides = await Bun.file(overridesUrl).exists() ? await Bun.file(overridesUrl).arrayBuffer() : null;
const originalFeedback = await Bun.file(feedbackUrl).exists() ? await Bun.file(feedbackUrl).arrayBuffer() : null;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(base, pathname, options) {
  const response = await fetch(new URL(pathname, base), options);
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json() : await response.text();
  return { response, body };
}

async function post(base, pathname, payload) {
  return request(base, pathname, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

let running;
try {
  running = await startServer({ port: 0 });
  await Bun.write(overridesUrl, '{"overrides":{}}\n');
  await Bun.write(feedbackUrl, "");
  const base = running.server.url;

  const production = await request(base, "/presentation/decks/current/index.html");
  assert(production.response.status === 200, `production slide must be served (received ${production.response.status}: ${production.body})`);
  assert(!/<script\b[^>]*\bsrc=["'][^"']*(?:editor|moveable)[^"']*["']/i.test(production.body), "production HTML must not directly load editor dependencies");
  assert(production.body.includes("get('edit') === '1'"), "edit mode must be explicitly query-gated");
  const editShell = await request(base, "/presentation/decks/current/index.html?edit=1");
  assert(editShell.response.status === 200 && editShell.body === production.body, "server must serve one production shell; edit dependencies load client-side only");

  const vendor = await request(base, "/vendor/moveable.min.js");
  assert(vendor.response.status === 200 && vendor.response.headers.get("content-type")?.includes("javascript"), "Moveable must be served from its exact local route");
  const gsapVendor = await request(base, "/vendor/gsap.min.js");
  assert(gsapVendor.response.status === 200 && gsapVendor.response.headers.get("content-type")?.includes("javascript"), "GSAP must be served from its exact local route");
  const editor = await request(base, "/presentation/studio/editor.js");
  assert(editor.response.status === 200 && editor.response.headers.get("content-type")?.includes("javascript"), "edit mode must be able to load the local editor script");
  const privateState = await request(base, "/presentation/review/overrides.json");
  assert(privateState.response.status === 404, "review state must not be static content");
  const serverSource = await request(base, "/presentation/studio/server.mjs");
  assert(serverSource.response.status === 404, "studio implementation must not be static content");
  const traversal = await request(base, "/presentation/%2e%2e/package.json");
  assert(traversal.response.status === 404, "encoded traversal must not escape presentation");
  const reference = await request(base, "/references/canva-1/canva-01.jpg");
  assert(reference.response.status === 200 && reference.response.headers.get("content-type")?.includes("image/jpeg"), "the mapped local reference image must be served for edit-time use");
  const referenceTraversal = await request(base, "/references/canva-1/%2e%2e/canva-01.jpg");
  assert(referenceTraversal.response.status === 404, "reference traversal must not escape the allowed directory");
  const outOfRootReference = await request(base, "/references/canva-2/canva-01.jpg");
  assert(outOfRootReference.response.status === 404, "reference requests outside canva-1 must not be served");

  const initialState = await request(base, "/api/state");
  assert(initialState.response.status === 200 && JSON.stringify(initialState.body) === '{"overrides":{}}', "initial override state must be empty");
  assert(initialState.response.headers.get("access-control-allow-origin") === null, "API must not emit wildcard CORS");

  const geometry = {
    slide: 1,
    layerId: "cover-title",
    type: "geometry",
    before: { x: 72, y: 181, width: 820, height: 250 },
    after: { x: 80, y: 189, width: 820, height: 250 },
  };
  const geometryResult = await post(base, "/api/geometry", geometry);
  assert(geometryResult.response.status === 200, "valid geometry must persist");
  assert(geometryResult.body.overrides["1"]["cover-title"].x === 80, "geometry response must expose persisted after state");
  const persistedState = await request(base, "/api/state");
  assert(persistedState.body.overrides["1"]["cover-title"].y === 189, "geometry must survive a fresh state read");
  const persistedFile = JSON.parse(await Bun.file(overridesUrl).text());
  assert(persistedFile.overrides["1"]["cover-title"].width === 820, "geometry must be atomically written under review");
  const geometryEvents = await request(base, "/api/feedback");
  const geometryEvent = geometryEvents.body.events[0];
  assert(geometryEvents.response.status === 200 && geometryEvents.body.events.length === 1, "geometry must append one feedback event");
  assert(typeof geometryEvent.id === "string"
    && typeof geometryEvent.timestamp === "string"
    && geometryEvent.deck === "current"
    && geometryEvent.slide === 1
    && geometryEvent.layerId === "cover-title"
    && geometryEvent.type === "geometry"
    && geometryEvent.before.x === 72
    && geometryEvent.after.x === 80
    && geometryEvent.status === "pending", "geometry feedback must use the structured pending event shape");

  const crop = {
    slide: 1,
    layerId: "cover-image",
    type: "crop",
    before: { x: 0, y: 0, zoom: 1 },
    after: { x: -12, y: 6, zoom: 1.1 },
  };
  const cropResult = await post(base, "/api/crop", crop);
  assert(cropResult.response.status === 200 && cropResult.body.overrides["1"]["cover-image"].crop.zoom === 1.1, "valid crop must persist in the image override");
  const cropState = await request(base, "/api/state");
  assert(cropState.body.overrides["1"]["cover-image"].crop.x === -12, "crop must survive a fresh state read");
  const cropEvents = await request(base, "/api/feedback");
  const cropEvent = cropEvents.body.events[1];
  assert(cropEvents.body.events.length === 2
    && typeof cropEvent.id === "string"
    && typeof cropEvent.timestamp === "string"
    && cropEvent.deck === "current"
    && cropEvent.slide === 1
    && cropEvent.layerId === "cover-image"
    && cropEvent.type === "crop"
    && cropEvent.before.zoom === 1
    && cropEvent.after.zoom === 1.1
    && cropEvent.status === "pending", "crop must append one structured pending feedback event");

  const malformedGeometry = await request(base, "/api/geometry", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{",
  });
  assert(malformedGeometry.response.status === 400, "malformed API JSON must be rejected as validation input");
  const unknownLayer = await post(base, "/api/geometry", { ...geometry, layerId: "not-a-layer" });
  assert(unknownLayer.response.status === 400, "unknown layer IDs must be rejected");
  const wrongSlideGeometry = await post(base, "/api/geometry", { ...geometry, slide: 2 });
  assert(wrongSlideGeometry.response.status === 400, "layer IDs must belong to the requested geometry slide");
  const outOfBounds = await post(base, "/api/geometry", {
    ...geometry,
    after: { x: 1590, y: 210, width: 20, height: 198 },
  });
  assert(outOfBounds.response.status === 400, "out-of-bounds canonical geometry must be rejected");
  const invalidCrop = await post(base, "/api/crop", { ...crop, after: { x: 0, y: 0, zoom: 2.6 } });
  assert(invalidCrop.response.status === 400, "out-of-range crop zoom must be rejected");
  const wrongSlideCrop = await post(base, "/api/crop", { ...crop, slide: 2 });
  assert(wrongSlideCrop.response.status === 400, "image layer IDs must belong to the requested crop slide");

  const feedback = await post(base, "/api/feedback", {
    slide: 1,
    layerId: null,
    type: "comment",
    note: "Check the title rhythm.",
    rect: { x: 112, y: 202, width: 650, height: 198 },
  });
  assert(feedback.response.status === 201
    && typeof feedback.body.event.id === "string"
    && typeof feedback.body.event.timestamp === "string"
    && feedback.body.event.deck === "current"
    && feedback.body.event.status === "pending", "valid feedback must append a structured pending event");
  const pointFeedback = await post(base, "/api/feedback", {
    slide: 1,
    layerId: null,
    type: "point",
    note: "Check this point.",
    x: 800,
    y: 450,
  });
  assert(pointFeedback.response.status === 201
    && typeof pointFeedback.body.event.id === "string"
    && typeof pointFeedback.body.event.timestamp === "string"
    && pointFeedback.body.event.deck === "current"
    && pointFeedback.body.event.status === "pending", "point feedback must append a structured pending event");
  const feedbackEvents = await request(base, "/api/feedback");
  assert(feedbackEvents.response.status === 200 && feedbackEvents.body.events.length === 4, "feedback endpoint must read all appended events");
  const feedbackLines = (await Bun.file(feedbackUrl).text()).trim().split("\n");
  const commentEvent = JSON.parse(feedbackLines[2]);
  const pointEvent = JSON.parse(feedbackLines[3]);
  assert(feedbackLines.length === 4
    && commentEvent.note === "Check the title rhythm."
    && commentEvent.status === "pending"
    && pointEvent.x === 800
    && pointEvent.status === "pending", "feedback must use one JSONL record per append");
  const motionFeedback = await post(base, "/api/feedback", {
    slide: 1,
    layerId: "cover-title",
    cueId: "enter",
    type: "comment",
    note: "Slow the opening cue slightly.",
  });
  assert(motionFeedback.response.status === 201
    && motionFeedback.body.event.cueId === "enter"
    && motionFeedback.body.event.layerId === "cover-title", "motion feedback must reuse the structured feedback queue");
  const invalidFeedback = await post(base, "/api/feedback", {
    slide: 9,
    layerId: null,
    type: "point",
    note: "bad",
    x: 1,
    y: 1,
  });
  assert(invalidFeedback.response.status === 400, "unknown feedback slide must be rejected");
  const wrongSlideFeedback = await post(base, "/api/feedback", {
    slide: 2,
    layerId: "cover-title",
    type: "comment",
    note: "Check the title rhythm.",
    rect: { x: 112, y: 202, width: 650, height: 198 },
  });
  assert(wrongSlideFeedback.response.status === 400, "feedback layer IDs must belong to the requested slide");
  const dismissed = await post(base, "/api/feedback/resolve", {
    feedbackIds: [feedback.body.event.id],
    status: "rejected",
  });
  assert(dismissed.response.status === 201
    && dismissed.body.event.type === "resolution"
    && dismissed.body.event.status === "rejected"
    && dismissed.body.event.feedbackIds[0] === feedback.body.event.id, "dismiss must append a rejected resolution event");
  const duplicateDismissal = await post(base, "/api/feedback/resolve", {
    feedbackIds: [feedback.body.event.id],
    status: "rejected",
  });
  assert(duplicateDismissal.response.status === 400, "resolved feedback cannot be dismissed twice");

  const reset = await post(base, "/api/reset", { slide: 1, layerId: "cover-title" });
  assert(reset.response.status === 200
    && !Object.hasOwn(reset.body.overrides["1"], "cover-title")
    && reset.body.overrides["1"]["cover-image"].crop.zoom === 1.1, "reset must remove only the requested override");
  const wrongSlideReset = await post(base, "/api/reset", { slide: 2, layerId: "cover-title" });
  assert(wrongSlideReset.response.status === 400, "reset layer IDs must belong to the requested slide");
  const slideThreeGeometry = await post(base, "/api/geometry", {
    slide: 3,
    layerId: "curse-title",
    type: "geometry",
    before: { x: 72, y: 164, width: 1428, height: 128 },
    after: { x: 80, y: 164, width: 1420, height: 128 },
  });
  assert(slideThreeGeometry.response.status === 200
    && slideThreeGeometry.body.overrides["3"]["curse-title"].x === 80, "each deck slide must persist its own layer geometry");
  console.log("Studio server E2E passed");
} finally {
  if (running) running.close();
  if (originalOverrides === null) {
    if (await Bun.file(overridesUrl).exists()) await Bun.file(overridesUrl).delete();
  } else {
    await Bun.write(overridesUrl, originalOverrides);
  }
  if (originalFeedback === null) {
    if (await Bun.file(feedbackUrl).exists()) await Bun.file(feedbackUrl).delete();
  } else {
    await Bun.write(feedbackUrl, originalFeedback);
  }
}
