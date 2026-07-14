const crypto = require("node:crypto");

const SIGNATURE_PREFIX = "sha256=";
const MAX_TIMESTAMP_AGE_MS = 5 * 60 * 1000;
const DEFAULT_CALENDAR_BASE_URL = "https://smartastro.app/calendar";

const STATIC_KNOWN_SCHEDULE_IDS = new Set([
  1292, 1331, 1372, 1440, 1453, 1459, 1478, 1487, 1503, 1508, 1518,
  1495, 1496, 1497, 1526, 1537, 1543, 1640,
]);

function resolveKnownScheduleIds(popupState, managedState) {
  const { mergeKnownScheduleIds } = require("./smartastro-popup-rollover");
  const { collectManagedManifestScheduleIds } = require("./smartastro-managed-destinations");
  let merged = mergeKnownScheduleIds(STATIC_KNOWN_SCHEDULE_IDS, popupState);
  for (const id of collectManagedManifestScheduleIds(managedState)) {
    merged.add(id);
  }
  return merged;
}

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

  const removedScheduleIds = Array.isArray(payload.removedScheduleIds)
    ? payload.removedScheduleIds
    : [];

  if (payload.updates.length === 0 && removedScheduleIds.length === 0) {
    throw new Error("Invalid SmartAstro sync payload");
  }

  return { ...payload, removedScheduleIds };
}

function collectPayloadScheduleIds(payload) {
  if (!payload || !Array.isArray(payload.updates)) return [];
  const ids = [];
  for (const update of payload.updates) {
    const scheduleId = Number(update && update.scheduleId);
    if (Number.isInteger(scheduleId) && scheduleId > 0) ids.push(scheduleId);
  }
  return ids;
}

function mergeKnownScheduleIdsWithPayload(knownScheduleIds, payload) {
  const merged = new Set(knownScheduleIds);
  for (const scheduleId of collectPayloadScheduleIds(payload)) {
    merged.add(scheduleId);
  }
  return merged;
}

function normalizeUpdate(update, calendarBaseUrl, knownScheduleIds = STATIC_KNOWN_SCHEDULE_IDS) {
  const scheduleId = Number(update && update.scheduleId);
  if (!Number.isInteger(scheduleId) || scheduleId <= 0) return null;
  if (!knownScheduleIds.has(scheduleId)) return { scheduleId, unknown: true };

  const availableSpots = Math.max(0, Number(update.availableSpots) || 0);
  const hasEnded = Boolean(update.hasEnded);
  return {
    scheduleId,
    isFull: Boolean(update.isFull),
    availableSpots,
    isClosed: Boolean(update.isClosed),
    hasEnded,
    signUpUrl: buildSignUpUrl(scheduleId, calendarBaseUrl),
    lastSyncedAt: new Date().toISOString(),
  };
}

function mergeSlotState(existingState, payload, options = {}) {
  const baseCalendarUrl = payload.baseCalendarUrl || DEFAULT_CALENDAR_BASE_URL;
  const knownScheduleIds = options.knownScheduleIds || STATIC_KNOWN_SCHEDULE_IDS;
  const slots = { ...(existingState && existingState.slots ? existingState.slots : {}) };
  const summary = {
    updated: 0,
    removed: 0,
    skippedUnknown: [],
    skippedInvalid: 0,
  };

  for (const rawId of payload.removedScheduleIds || []) {
    const scheduleId = Number(rawId);
    if (!Number.isInteger(scheduleId) || scheduleId <= 0) continue;
    slots[String(scheduleId)] = {
      scheduleId,
      removed: true,
      hasEnded: true,
      isFull: false,
      isClosed: false,
      availableSpots: 0,
      signUpUrl: buildSignUpUrl(scheduleId, baseCalendarUrl),
      lastSyncedAt: new Date().toISOString(),
    };
    summary.removed += 1;
  }

  for (const rawUpdate of payload.updates || []) {
    const update = normalizeUpdate(rawUpdate, baseCalendarUrl, knownScheduleIds);
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

function publicState(state, popupState, managedState) {
  const { publicPopupState } = require("./smartastro-popup-rollover");
  const { publicManagedState } = require("./smartastro-managed-destinations");
  const popups = publicPopupState(popupState);
  const managed = publicManagedState(managedState);
  const scheduleIds = new Set([
    ...(popups.manifest && popups.manifest.scheduleIds ? popups.manifest.scheduleIds : []),
    ...(managed.manifest && managed.manifest.scheduleIds ? managed.manifest.scheduleIds : []),
    ...Object.keys(state && state.slots ? state.slots : {})
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0),
  ]);

  return {
    source: "smartastro",
    updatedAt: state && state.updatedAt ? state.updatedAt : null,
    generatedAt: state && state.generatedAt ? state.generatedAt : null,
    slots: state && state.slots ? state.slots : {},
    popups,
    managed,
    manifest: {
      scheduleIds: Array.from(scheduleIds).sort((a, b) => a - b),
      popupByDestination: popups.manifest ? popups.manifest.byDestination : {},
      managedByDestination: managed.manifest ? managed.manifest.byDestination : {},
      updatedAt: new Date().toISOString(),
    },
  };
}

module.exports = {
  DEFAULT_CALENDAR_BASE_URL,
  KNOWN_SCHEDULE_IDS: STATIC_KNOWN_SCHEDULE_IDS,
  STATIC_KNOWN_SCHEDULE_IDS,
  collectPayloadScheduleIds,
  mergeKnownScheduleIdsWithPayload,
  resolveKnownScheduleIds,
  createSignature,
  json,
  mergeSlotState,
  parsePayload,
  publicState,
  validateTimestamp,
  verifySignature,
};
