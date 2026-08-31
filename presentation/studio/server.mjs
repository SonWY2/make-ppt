import { watch } from "node:fs";
import { appendFile, mkdir, realpath, rename, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WIDTH = 1600;
const HEIGHT = 900;
const MAX_JSON_BYTES = 64 * 1024;
const MAX_NOTE_LENGTH = 2000;
const DECK = "current";
const SLIDE_LAYER_IDS = new Map([
  [1, new Set(["cover-title", "cover-summary", "cover-image", "cover-frameworks"])],
  [2, new Set(["complexity-title", "complexity-stat", "complexity-image", "complexity-mechanism", "complexity-result"])],
  [3, new Set(["curse-title", "curse-symptoms", "curse-image", "curse-practice"])],
  [4, new Set(["classic-title", "classic-image", "classic-avoid", "classic-adopt"])],
  [5, new Set(["syntax-title", "syntax-image", "syntax-corrections"])],
  [6, new Set(["voice-title", "passive-principle", "concrete-image", "concrete-principle"])],
  [7, new Set(["ai-title", "ai-metrics", "ai-pipeline", "ai-image", "ai-human"])],
  [8, new Set(["action-title", "action-image", "action-list"])],
]);
const IMAGE_LAYER_IDS = new Set([
  "cover-image",
  "complexity-image",
  "curse-image",
  "classic-image",
  "syntax-image",
  "concrete-image",
  "ai-image",
  "action-image",
]);

const STUDIO_DIR = path.dirname(fileURLToPath(import.meta.url));
const EDITOR_PATH = path.join(STUDIO_DIR, "editor.js");
const DEFAULT_PRESENTATION_ROOT = path.resolve(STUDIO_DIR, "..");
const DEFAULT_REFERENCE_DIR = path.resolve(DEFAULT_PRESENTATION_ROOT, "..", "references");
const DEFAULT_REVIEW_DIR = path.join(DEFAULT_PRESENTATION_ROOT, "review");
const DEFAULT_VENDOR_PATH = path.resolve(
  DEFAULT_PRESENTATION_ROOT,
  "..",
  "node_modules",
  "moveable",
  "dist",
  "moveable.min.js",
);

const GSAP_VENDOR_PATH = path.resolve(
  DEFAULT_PRESENTATION_ROOT,
  "..",
  "node_modules",
  "gsap",
  "dist",
  "gsap.min.js",
);

const STATIC_TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
  [".avif", "image/avif"],
  [".ico", "image/x-icon"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".ttf", "font/ttf"],
  [".otf", "font/otf"],
  [".mp4", "video/mp4"],
  [".webm", "video/webm"],
]);

function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function fail(message, status = 400) {
  return json({ error: message }, status);
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasOnlyKeys(value, keys) {
  return Object.keys(value).every((key) => keys.has(key));
}

function validSlideLayer(value, allowNull = false) {
  if (!isPlainObject(value) || !Number.isInteger(value.slide)) return false;
  const slideLayers = SLIDE_LAYER_IDS.get(value.slide);
  return Boolean(slideLayers)
    && ((allowNull && value.layerId === null) || slideLayers.has(value.layerId));
}

function finite(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function validRect(value) {
  if (!isPlainObject(value)
    || !hasOnlyKeys(value, new Set(["x", "y", "width", "height"]))) {
    return false;
  }
  const { x, y, width, height } = value;
  return finite(x)
    && finite(y)
    && finite(width)
    && finite(height)
    && x >= 0
    && y >= 0
    && width > 0
    && height > 0
    && x + width <= WIDTH
    && y + height <= HEIGHT;
}

function validPoint(value) {
  return finite(value.x) && finite(value.y) && value.x >= 0 && value.x <= WIDTH && value.y >= 0 && value.y <= HEIGHT;
}

function validCrop(value) {
  if (!isPlainObject(value) || !hasOnlyKeys(value, new Set(["x", "y", "zoom"]))) return false;
  return finite(value.x) && finite(value.y) && finite(value.zoom) && value.zoom >= 1 && value.zoom <= 2.5;
}

function geometryOverride(value) {
  return validRect(value) ? value : isPlainObject(value) && validRect(value.geometry) ? value.geometry : null;
}

function cropOverride(value) {
  return isPlainObject(value) && validCrop(value.crop) ? value.crop : null;
}

function withGeometryOverride(layerId, previous, geometry) {
  const crop = IMAGE_LAYER_IDS.has(layerId) ? cropOverride(previous) : null;
  return crop ? { geometry, crop } : geometry;
}

function withCropOverride(previous, crop) {
  const geometry = geometryOverride(previous);
  return geometry ? { geometry, crop } : { crop };
}

function feedbackEvent(body) {
  const timestamp = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    timestamp,
    deck: DECK,
    ...body,
    status: "pending",
    createdAt: timestamp,
  };
}

function invalidRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

async function readRequestJson(request) {
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_JSON_BYTES) {
    throw invalidRequest("Request body is too large");
  }
  try {
    const value = JSON.parse(body);
    if (!isPlainObject(value)) throw invalidRequest("JSON body must be an object");
    return value;
  } catch (error) {
    if (error.status === 400) throw error;
    throw invalidRequest("Malformed JSON");
  }
}

async function readJsonFile(file, fallback) {
  if (!(await Bun.file(file).exists())) return fallback;
  try {
    return JSON.parse(await Bun.file(file).text());
  } catch {
    throw new Error(`Cannot read ${path.basename(file)} as JSON`);
  }
}

async function atomicJsonWrite(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = path.join(path.dirname(file), `.${path.basename(file)}.${crypto.randomUUID()}.tmp`);
  await Bun.write(temporary, `${JSON.stringify(value, null, 2)}\n`);
  await rename(temporary, file);
}

function parseOverrides(document) {
  if (!isPlainObject(document) || !isPlainObject(document.overrides)) {
    throw new Error("overrides.json has an invalid shape");
  }
  return document.overrides;
}

async function readOverrides(overridesFile) {
  return parseOverrides(await readJsonFile(overridesFile, { overrides: {} }));
}

async function readFeedback(feedbackFile) {
  if (!(await Bun.file(feedbackFile).exists())) return [];
  const content = await Bun.file(feedbackFile).text();
  if (content === "") return [];
  const events = [];
  for (const line of content.split("\n")) {
    if (!line) continue;
    try {
      events.push(JSON.parse(line));
    } catch {
      throw new Error("feedback.jsonl contains invalid JSON");
    }
  }
  return events;
}

function unresolvedAnnotations(events) {
  const handled = new Set(
    events
      .filter((event) => event.type === "resolution" && ["applied", "rejected"].includes(event.status))
      .flatMap((event) => Array.isArray(event.feedbackIds) ? event.feedbackIds : []),
  );
  return new Set(
    events
      .filter((event) => ["comment", "point"].includes(event.type) && !handled.has(event.id))
      .map((event) => event.id),
  );
}

function resolutionEvent(feedbackIds, status) {
  const timestamp = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    timestamp,
    deck: DECK,
    type: "resolution",
    feedbackIds,
    status,
    createdAt: timestamp,
  };
}

async function appendFeedback(feedbackFile, event) {
  await mkdir(path.dirname(feedbackFile), { recursive: true });
  await appendFile(feedbackFile, `${JSON.stringify(event)}\n`, "utf8");
}

function staticPath(urlPathname, presentationRoot) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPathname);
  } catch {
    return null;
  }
  if (!decoded.startsWith("/presentation/")) return null;
  const relative = decoded.slice("/presentation/".length);
  if (!relative || relative.includes("\0") || ["review", "studio"].includes(relative.split("/")[0])) return null;
  const candidate = path.resolve(presentationRoot, relative);
  const contained = candidate === presentationRoot || candidate.startsWith(`${presentationRoot}${path.sep}`);
  return contained && STATIC_TYPES.has(path.extname(candidate).toLowerCase()) ? candidate : null;
}

async function serveStatic(urlPathname, presentationRoot) {
  const candidate = staticPath(urlPathname, presentationRoot);
  if (!candidate || !(await Bun.file(candidate).exists())) return fail("Not found", 404);
  try {
    const [resolvedRoot, resolvedCandidate, details] = await Promise.all([
      realpath(presentationRoot),
      realpath(candidate),
      stat(candidate),
    ]);
    if (!details.isFile() || !resolvedCandidate.startsWith(`${resolvedRoot}${path.sep}`)) {
      return fail("Not found", 404);
    }
  } catch {
    return fail("Not found", 404);
  }
  return new Response(Bun.file(candidate), {
    headers: {
      "content-type": STATIC_TYPES.get(path.extname(candidate).toLowerCase()),
      "cache-control": "no-store",
    },
  });
}

function referencePath(urlPathname, referenceRoot) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPathname);
  } catch {
    return null;
  }
  const prefix = "/references/canva-1/";
  if (!decoded.startsWith(prefix)) return null;
  const filename = decoded.slice(prefix.length);
  if (!filename
    || filename.includes("\0")
    || filename.includes("/")
    || filename.includes("\\")
    || path.extname(filename).toLowerCase() !== ".jpg") {
    return null;
  }
  const referenceDirectory = path.join(referenceRoot, "canva-1");
  const candidate = path.resolve(referenceDirectory, filename);
  return candidate.startsWith(`${referenceDirectory}${path.sep}`) ? candidate : null;
}

async function serveReference(urlPathname, referenceRoot) {
  const candidate = referencePath(urlPathname, referenceRoot);
  if (!candidate || !(await Bun.file(candidate).exists())) return fail("Not found", 404);
  const referenceDirectory = path.join(referenceRoot, "canva-1");
  try {
    const [resolvedDirectory, resolvedCandidate, details] = await Promise.all([
      realpath(referenceDirectory),
      realpath(candidate),
      stat(candidate),
    ]);
    if (!details.isFile() || !resolvedCandidate.startsWith(`${resolvedDirectory}${path.sep}`)) {
      return fail("Not found", 404);
    }
  } catch {
    return fail("Not found", 404);
  }
  return new Response(Bun.file(candidate), {
    headers: { "content-type": "image/jpeg", "cache-control": "no-store" },
  });
}

function makeReloadNotifier(presentationRoot) {
  const clients = new Set();
  let timer;
  const sendReload = () => {
    timer = undefined;
    const message = `event: reload\ndata: ${JSON.stringify({ changed: true })}\n\n`;
    for (const client of clients) client.enqueue(message);
  };
  const schedule = () => {
    if (!timer) timer = setTimeout(sendReload, 50);
  };
  const watchers = [presentationRoot].map((directory) => {
    try {
      return watch(directory, { recursive: true }, schedule);
    } catch {
      return null;
    }
  }).filter(Boolean);
  return {
    open() {
      let controller;
      const stream = new ReadableStream({
        start(next) {
          controller = next;
          clients.add(controller);
          controller.enqueue("retry: 1000\n\n");
        },
        cancel() {
          clients.delete(controller);
        },
      });
      return new Response(stream, {
        headers: {
          "content-type": "text/event-stream; charset=utf-8",
          "cache-control": "no-cache",
          connection: "keep-alive",
        },
      });
    },
    close() {
      clearTimeout(timer);
      for (const watcher of watchers) watcher.close();
      for (const client of clients) client.close();
      clients.clear();
    },
  };
}

/** Start the loopback-only Presentation Studio server. */
export async function startServer({
  port = Number(process.env.PORT || 3000),
} = {}) {
  const absolutePresentationRoot = DEFAULT_PRESENTATION_ROOT;
  const absoluteReferenceDir = DEFAULT_REFERENCE_DIR;
  const absoluteReviewDir = DEFAULT_REVIEW_DIR;
  const overridesFile = path.join(absoluteReviewDir, "overrides.json");
  const feedbackFile = path.join(absoluteReviewDir, "feedback.jsonl");
  await mkdir(absoluteReviewDir, { recursive: true });
  const reload = makeReloadNotifier(absolutePresentationRoot);

  const server = Bun.serve({
    hostname: "127.0.0.1",
    port,
    async fetch(request) {
      const url = new URL(request.url);
      try {
        if (request.method === "GET" && url.pathname === "/api/state") {
          return json({ overrides: await readOverrides(overridesFile) });
        }
        if (request.method === "GET" && url.pathname === "/api/feedback") {
          return json({ events: await readFeedback(feedbackFile) });
        }
        if (request.method === "GET" && url.pathname === "/api/events") {
          return reload.open();
        }
        if (request.method === "POST" && url.pathname === "/api/geometry") {
          const body = await readRequestJson(request);
          if (!validSlideLayer(body)
            || body.type !== "geometry"
            || !validRect(body.before)
            || !validRect(body.after)
            || !hasOnlyKeys(body, new Set(["slide", "layerId", "type", "before", "after"]))) {
            return fail("Invalid geometry payload");
          }
          const overrides = await readOverrides(overridesFile);
          const slideKey = String(body.slide);
          const slideOverrides = isPlainObject(overrides[slideKey]) ? overrides[slideKey] : {};
          const previous = slideOverrides[body.layerId];
          slideOverrides[body.layerId] = withGeometryOverride(body.layerId, previous, body.after);
          overrides[slideKey] = slideOverrides;
          await atomicJsonWrite(overridesFile, { overrides });
          await appendFeedback(feedbackFile, feedbackEvent(body));
          return json({ overrides });
        }
        if (request.method === "POST" && url.pathname === "/api/crop") {
          const body = await readRequestJson(request);
          if (!validSlideLayer(body)
            || !IMAGE_LAYER_IDS.has(body.layerId)
            || body.type !== "crop"
            || !validCrop(body.before)
            || !validCrop(body.after)
            || !hasOnlyKeys(body, new Set(["slide", "layerId", "type", "before", "after"]))) {
            return fail("Invalid crop payload");
          }
          const overrides = await readOverrides(overridesFile);
          const slideKey = String(body.slide);
          const slideOverrides = isPlainObject(overrides[slideKey]) ? overrides[slideKey] : {};
          slideOverrides[body.layerId] = withCropOverride(slideOverrides[body.layerId], body.after);
          overrides[slideKey] = slideOverrides;
          await atomicJsonWrite(overridesFile, { overrides });
          await appendFeedback(feedbackFile, feedbackEvent(body));
          return json({ overrides });
        }
        if (request.method === "POST" && url.pathname === "/api/reset") {
          const body = await readRequestJson(request);
          if (!validSlideLayer(body) || !hasOnlyKeys(body, new Set(["slide", "layerId"]))) {
            return fail("Invalid reset payload");
          }
          const overrides = await readOverrides(overridesFile);
          const slideKey = String(body.slide);
          if (isPlainObject(overrides[slideKey])) {
            delete overrides[slideKey][body.layerId];
            if (Object.keys(overrides[slideKey]).length === 0) delete overrides[slideKey];
          }
          await atomicJsonWrite(overridesFile, { overrides });
          return json({ overrides });
        }
        if (request.method === "POST" && url.pathname === "/api/feedback") {
          const body = await readRequestJson(request);
          const keys = new Set(["slide", "layerId", "type", "note", "rect", "x", "y", "cueId"]);
          const validNote = typeof body.note === "string" && body.note.length <= MAX_NOTE_LENGTH;
          const validCue = !Object.hasOwn(body, "cueId")
            || (typeof body.cueId === "string" && /^[a-z][a-z0-9-]{0,63}$/.test(body.cueId) && typeof body.layerId === "string");
          const hasPoint = Object.hasOwn(body, "x") || Object.hasOwn(body, "y");
          const validLocation = (!Object.hasOwn(body, "rect") || validRect(body.rect))
            && (!hasPoint || validPoint(body));
          if (!validSlideLayer(body, true)
            || !["comment", "point"].includes(body.type)
            || !validNote
            || !validCue
            || !validLocation
            || !hasOnlyKeys(body, keys)
            || (body.type === "point" && !validPoint(body))) {
            return fail("Invalid feedback payload");
          }
          const event = feedbackEvent(body);
          await appendFeedback(feedbackFile, event);
          return json({ event }, 201);
        }
        if (request.method === "POST" && url.pathname === "/api/feedback/resolve") {
          const body = await readRequestJson(request);
          const validIds = Array.isArray(body.feedbackIds)
            && body.feedbackIds.length > 0
            && body.feedbackIds.length <= 20
            && body.feedbackIds.every((id) => typeof id === "string" && id.length > 0 && id.length <= 100)
            && new Set(body.feedbackIds).size === body.feedbackIds.length;
          if (!hasOnlyKeys(body, new Set(["feedbackIds", "status"])) || !validIds || body.status !== "rejected") {
            return fail("Invalid feedback resolution payload");
          }
          const events = await readFeedback(feedbackFile);
          const pending = unresolvedAnnotations(events);
          if (!body.feedbackIds.every((id) => pending.has(id))) {
            return fail("Feedback is not an unresolved comment or point");
          }
          const event = resolutionEvent(body.feedbackIds, body.status);
          await appendFeedback(feedbackFile, event);
          return json({ event }, 201);
        }
        if (request.method === "GET" && url.pathname === "/vendor/moveable.min.js") {
          if (!(await Bun.file(DEFAULT_VENDOR_PATH).exists())) return fail("Not found", 404);
          return new Response(Bun.file(DEFAULT_VENDOR_PATH), {
            headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": "no-store" },
          });
        }
        if (request.method === "GET" && url.pathname === "/vendor/gsap.min.js") {
          if (!(await Bun.file(GSAP_VENDOR_PATH).exists())) return fail("Not found", 404);
          return new Response(Bun.file(GSAP_VENDOR_PATH), {
            headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": "no-store" },
          });
        }
        if (request.method === "GET" && url.pathname === "/presentation/studio/editor.js") {
          return new Response(Bun.file(EDITOR_PATH), {
            headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": "no-store" },
          });
        }
        if (request.method === "GET" && url.pathname.startsWith("/references/")) {
          return await serveReference(url.pathname, absoluteReferenceDir);
        }
        if (request.method === "GET") return await serveStatic(url.pathname, absolutePresentationRoot);
        return fail("Method not allowed", 405);
      } catch (error) {
        if (error.status === 400) return fail(error.message);
        console.error(error);
        return fail("Server error", 500);
      }
    },
  });

  return {
    server,
    close() {
      reload.close();
      server.stop(true);
    },
  };
}

if (import.meta.main) {
  const running = await startServer();
  console.log(`Presentation Studio listening on ${running.server.url}`);
}
