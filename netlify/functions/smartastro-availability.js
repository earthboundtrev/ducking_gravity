const { getStore } = require("@netlify/blobs");
const {
  json,
  mergeSlotState,
  parsePayload,
  publicState,
  validateTimestamp,
  verifySignature,
} = require("./lib/smartastro-availability");

const STORE_NAME = "smartastro-availability";
const STATE_KEY = "class-slots";
const MAX_BODY_BYTES = 1024 * 1024;
const MAX_UPDATES = 500;
const MAX_IDEMPOTENCY_KEYS = 100;
const IDEMPOTENCY_RETENTION_MS = 24 * 60 * 60 * 1000;

function methodNotAllowed() {
  return {
    statusCode: 405,
    headers: { Allow: "GET, POST", "Content-Type": "application/json" },
    body: JSON.stringify({ error: "Method not allowed" }),
  };
}

async function readState(store) {
  const state = await store.get(STATE_KEY, { type: "json" });
  return state || {
    source: "smartastro",
    updatedAt: null,
    generatedAt: null,
    slots: {},
    idempotencyKeys: [],
  };
}

function hasSeenIdempotencyKey(state, key) {
  if (!key || !Array.isArray(state.idempotencyKeys)) return false;
  return state.idempotencyKeys.some((entry) => entry && entry.key === key);
}

function rememberIdempotencyKey(state, key) {
  if (!key) return state;

  const now = Date.now();
  const retained = Array.isArray(state.idempotencyKeys)
    ? state.idempotencyKeys.filter((entry) => {
        const seenAt = Date.parse(entry && entry.seenAt);
        return Number.isFinite(seenAt) && now - seenAt <= IDEMPOTENCY_RETENTION_MS;
      })
    : [];

  return {
    ...state,
    idempotencyKeys: [
      ...retained,
      { key, seenAt: new Date(now).toISOString() },
    ].slice(-MAX_IDEMPOTENCY_KEYS),
  };
}

exports.handler = async function smartAstroAvailability(event) {
  const store = getStore(STORE_NAME);

  if (event.httpMethod === "GET") {
    const state = await readState(store);
    return json(200, publicState(state));
  }

  if (event.httpMethod !== "POST") {
    return methodNotAllowed();
  }

  const secret = process.env.MARKETING_SYNC_SHARED_SECRET;
  if (!secret) {
    return json(503, { error: "SmartAstro availability sync is not configured" });
  }

  const body = event.isBase64Encoded
    ? Buffer.from(event.body || "", "base64").toString("utf8")
    : event.body || "";

  if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
    return json(413, { error: "SmartAstro sync payload is too large" });
  }

  const timestamp = event.headers["x-smartastro-timestamp"] || event.headers["X-SmartAstro-Timestamp"];
  const signature = event.headers["x-smartastro-signature"] || event.headers["X-SmartAstro-Signature"];
  const idempotencyKey =
    event.headers["x-smartastro-idempotency-key"] || event.headers["X-SmartAstro-Idempotency-Key"];

  if (!validateTimestamp(timestamp)) {
    return json(401, { error: "Missing or stale SmartAstro timestamp" });
  }

  if (!verifySignature(secret, timestamp, body, signature)) {
    return json(401, { error: "Invalid SmartAstro signature" });
  }

  const existingState = await readState(store);
  if (hasSeenIdempotencyKey(existingState, idempotencyKey)) {
    return json(200, {
      ok: true,
      duplicate: true,
      updated: 0,
      skippedUnknown: [],
      skippedInvalid: 0,
    });
  }

  let payload;
  try {
    payload = parsePayload(body);
  } catch (err) {
    return json(400, { error: err.message });
  }

  if (payload.updates.length > MAX_UPDATES) {
    return json(413, { error: "SmartAstro sync payload has too many updates" });
  }

  const { state, summary } = mergeSlotState(existingState, payload);
  await store.setJSON(STATE_KEY, rememberIdempotencyKey(state, idempotencyKey));

  return json(200, {
    ok: true,
    ...summary,
  });
};
