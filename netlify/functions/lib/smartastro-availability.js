const crypto = require("node:crypto");

const SIGNATURE_PREFIX = "sha256=";
const MAX_TIMESTAMP_AGE_MS = 5 * 60 * 1000;
const DEFAULT_CALENDAR_BASE_URL = "https://smartastro.app/calendar";

const KNOWN_SCHEDULE_IDS = new Set([
  1292, 1331, 1372, 1440, 1453, 1459, 1468, 1478, 1487, 1494, 1503, 1508, 1518,
  1495, 1496, 1497, 1526, 1537, 1543,
]);

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function createSignature(secret, timestamp, body) {
  return `${SIGNATURE_PREFIX}${crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex")}`;
}

function verifySignature(secret, timestamp, body, signature) {
  if (!secret || !timestamp || !body || !signature) return false;

  const expected = createSignature(secret, timestamp, body);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

function validateTimestamp(timestamp, now = Date.now()) {
  const parsed = Date.parse(timestamp);
  if (!Number.isFinite(parsed)) return false;
  return Math.abs(now - parsed) <= MAX_TIMESTAMP_AGE_MS;
}

function buildSignUpUrl(scheduleId, calendarBaseUrl = DEFAULT_CALENDAR_BASE_URL) {
  const base = String(calendarBaseUrl || DEFAULT_CALENDAR_BASE_URL).trim().replace(/\?+$/, "");
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}class=${scheduleId}`;
}

function parsePayload(body) {
  let payload;
  try {
    payload = JSON.parse(body);
  } catch (_err) {
    throw new Error("Invalid JSON body");
  }

  if (!payload || payload.source !== "smartastro" || !Array.isArray(payload.updates)) {
    throw new Error("Invalid SmartAstro sync payload");
  }

  return payload;
}

function normalizeUpdate(update, calendarBaseUrl) {
  const scheduleId = Number(update && update.scheduleId);
  if (!Number.isInteger(scheduleId) || scheduleId <= 0) return null;
  if (!KNOWN_SCHEDULE_IDS.has(scheduleId)) return { scheduleId, unknown: true };

  const availableSpots = Math.max(0, Number(update.availableSpots) || 0);
  return {
    scheduleId,
    isFull: Boolean(update.isFull),
    availableSpots,
    isClosed: Boolean(update.isClosed),
    signUpUrl: buildSignUpUrl(scheduleId, calendarBaseUrl),
    lastSyncedAt: new Date().toISOString(),
  };
}

function mergeSlotState(existingState, payload) {
  const baseCalendarUrl = payload.baseCalendarUrl || DEFAULT_CALENDAR_BASE_URL;
  const slots = { ...(existingState && existingState.slots ? existingState.slots : {}) };
  const summary = {
    updated: 0,
    skippedUnknown: [],
    skippedInvalid: 0,
  };

  for (const rawUpdate of payload.updates) {
    const update = normalizeUpdate(rawUpdate, baseCalendarUrl);
    if (!update) {
      summary.skippedInvalid += 1;
      continue;
    }
    if (update.unknown) {
      summary.skippedUnknown.push(update.scheduleId);
      continue;
    }

    slots[String(update.scheduleId)] = update;
    summary.updated += 1;
  }

  return {
    state: {
      source: "smartastro",
      updatedAt: new Date().toISOString(),
      generatedAt: payload.generatedAt || null,
      slots,
    },
    summary,
  };
}

function publicState(state) {
  return {
    source: "smartastro",
    updatedAt: state && state.updatedAt ? state.updatedAt : null,
    generatedAt: state && state.generatedAt ? state.generatedAt : null,
    slots: state && state.slots ? state.slots : {},
  };
}

module.exports = {
  DEFAULT_CALENDAR_BASE_URL,
  KNOWN_SCHEDULE_IDS,
  createSignature,
  json,
  mergeSlotState,
  parsePayload,
  publicState,
  validateTimestamp,
  verifySignature,
};
