const crypto = require("node:crypto");

const VALID_DESTINATION_KEYS = new Set([
  "homepage-all-classes-week",
  "homepage-silks-week",
  "homepage-lyra",
]);

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_HEADING_LENGTH = 500;
const MAX_SLOT_DISPLAY_TIME_LENGTH = 200;
const MAX_GROUP_LABEL_LENGTH = 120;
const MAX_GROUP_KEY_LENGTH = 80;
const MAX_SLOTS_PER_DESTINATION = 200;
const SMARTASTRO_CALENDAR_HOST = "smartastro.app";

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isValidIsoDate(value) {
  if (typeof value !== "string" || !ISO_DATE_RE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function containsHtml(value) {
  return /[<>&]/.test(value);
}

function isValidSignUpUrl(url, scheduleId) {
  if (typeof url !== "string" || url.length > 500) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    if (!parsed.hostname.endsWith(SMARTASTRO_CALENDAR_HOST)) return false;
    const classParam = parsed.searchParams.get("class");
    return classParam === String(scheduleId);
  } catch (_err) {
    return false;
  }
}

function normalizeSlot(rawSlot) {
  if (!isPlainObject(rawSlot)) return null;

  const scheduleId = Number(rawSlot.scheduleId);
  if (!Number.isInteger(scheduleId) || scheduleId <= 0) return null;

  const groupKey = typeof rawSlot.groupKey === "string" ? rawSlot.groupKey.trim() : "";
  const groupLabel = typeof rawSlot.groupLabel === "string" ? rawSlot.groupLabel.trim() : "";
  const displayTime = typeof rawSlot.displayTime === "string" ? rawSlot.displayTime.trim() : "";

  if (!groupKey || groupKey.length > MAX_GROUP_KEY_LENGTH) return null;
  if (!groupLabel || groupLabel.length > MAX_GROUP_LABEL_LENGTH) return null;
  if (!displayTime || displayTime.length > MAX_SLOT_DISPLAY_TIME_LENGTH) return null;
  if (containsHtml(groupKey) || containsHtml(groupLabel) || containsHtml(displayTime)) return null;

  const signUpUrl =
    typeof rawSlot.signUpUrl === "string" && rawSlot.signUpUrl.trim()
      ? rawSlot.signUpUrl.trim()
      : `https://smartastro.app/calendar?class=${scheduleId}`;

  if (!isValidSignUpUrl(signUpUrl, scheduleId)) return null;

  return {
    scheduleId,
    groupKey,
    groupLabel,
    displayTime,
    isFull: Boolean(rawSlot.isFull),
    availableSpots: Math.max(0, Number(rawSlot.availableSpots) || 0),
    isClosed: Boolean(rawSlot.isClosed),
    hasEnded: Boolean(rawSlot.hasEnded),
    signUpUrl,
  };
}

function parseReplaceWeekPayload(body) {
  let payload;
  try {
    payload = JSON.parse(body);
  } catch (_err) {
    throw new Error("Invalid JSON body");
  }

  if (!isPlainObject(payload)) {
    throw new Error("Invalid SmartAstro replaceWeek payload");
  }

  if (payload.action !== "replaceWeek" || payload.source !== "smartastro") {
    throw new Error("Invalid SmartAstro replaceWeek payload");
  }

  const destinationKey =
    typeof payload.destinationKey === "string" ? payload.destinationKey.trim() : "";
  if (!VALID_DESTINATION_KEYS.has(destinationKey)) {
    throw new Error("Unknown popup destination key");
  }

  if (!isValidIsoDate(payload.windowStart) || !isValidIsoDate(payload.windowEnd)) {
    throw new Error("Invalid popup window dates");
  }

  if (payload.windowStart > payload.windowEnd) {
    throw new Error("Invalid popup window dates");
  }

  const heading = typeof payload.heading === "string" ? payload.heading.trim() : "";
  if (!heading || heading.length > MAX_HEADING_LENGTH || containsHtml(heading)) {
    throw new Error("Invalid popup heading");
  }

  if (!Array.isArray(payload.slots)) {
    throw new Error("Invalid popup slots");
  }

  if (payload.slots.length > MAX_SLOTS_PER_DESTINATION) {
    throw new Error("Popup payload has too many slots");
  }

  const slots = [];
  for (const rawSlot of payload.slots) {
    const slot = normalizeSlot(rawSlot);
    if (!slot) {
      throw new Error("Invalid popup slot");
    }
    slots.push(slot);
  }

  return {
    action: "replaceWeek",
    source: "smartastro",
    generatedAt:
      typeof payload.generatedAt === "string" && payload.generatedAt.trim()
        ? payload.generatedAt.trim()
        : new Date().toISOString(),
    destinationKey,
    windowStart: payload.windowStart,
    windowEnd: payload.windowEnd,
    heading,
    slots,
  };
}

function emptyPopupState() {
  return {
    source: "smartastro",
    updatedAt: null,
    destinations: {},
    manifest: {
      scheduleIds: [],
      byDestination: {},
      updatedAt: null,
    },
  };
}

function buildManifest(destinations) {
  const byDestination = {};
  const scheduleIds = new Set();

  for (const [destinationKey, destination] of Object.entries(destinations)) {
    const ids = (destination.slots || []).map((slot) => slot.scheduleId);
    byDestination[destinationKey] = ids;
    for (const id of ids) {
      scheduleIds.add(id);
    }
  }

  const sorted = Array.from(scheduleIds).sort((a, b) => a - b);
  return {
    scheduleIds: sorted,
    byDestination,
    updatedAt: new Date().toISOString(),
  };
}

function mergeReplaceWeek(existingState, payload) {
  const destinations = {
    ...(existingState && existingState.destinations ? existingState.destinations : {}),
  };

  const previous = destinations[payload.destinationKey];

  // #229: never wipe a populated popup with an empty replaceWeek payload.
  if (payload.slots.length === 0) {
    if (previous && Array.isArray(previous.slots) && previous.slots.length > 0) {
      return {
        state: existingState || emptyPopupState(),
        summary: {
          destinationKey: payload.destinationKey,
          preservedPreviousWeek: true,
          slotsReplaced: 0,
          windowStart: previous.windowStart,
          windowEnd: previous.windowEnd,
        },
      };
    }
    throw new Error("Cannot apply empty replaceWeek without a prior populated week");
  }

  destinations[payload.destinationKey] = {
    destinationKey: payload.destinationKey,
    windowStart: payload.windowStart,
    windowEnd: payload.windowEnd,
    heading: payload.heading,
    slots: payload.slots,
    generatedAt: payload.generatedAt,
    updatedAt: new Date().toISOString(),
  };

  const state = {
    source: "smartastro",
    updatedAt: new Date().toISOString(),
    destinations,
    manifest: buildManifest(destinations),
  };

  return {
    state,
    summary: {
      destinationKey: payload.destinationKey,
      preservedPreviousWeek: false,
      slotsReplaced: payload.slots.length,
      windowStart: payload.windowStart,
      windowEnd: payload.windowEnd,
    },
  };
}

function availabilityUpdatesFromSlots(slots, generatedAt) {
  return slots.map((slot) => ({
    scheduleId: slot.scheduleId,
    isFull: slot.isFull,
    availableSpots: slot.availableSpots,
    isClosed: slot.isClosed,
    hasEnded: Boolean(slot.hasEnded),
    signUpUrl: slot.signUpUrl,
    lastSyncedAt: generatedAt,
  }));
}

function publicPopupState(state) {
  const destinations = state && state.destinations ? state.destinations : {};
  const manifest =
    state && state.manifest
      ? state.manifest
      : {
          scheduleIds: [],
          byDestination: {},
          updatedAt: null,
        };

  return {
    source: "smartastro",
    updatedAt: state && state.updatedAt ? state.updatedAt : null,
    destinations,
    manifest,
  };
}

function collectManifestScheduleIds(popupState) {
  if (!popupState || !popupState.manifest || !Array.isArray(popupState.manifest.scheduleIds)) {
    return [];
  }
  return popupState.manifest.scheduleIds;
}

function mergeKnownScheduleIds(staticIds, popupState) {
  const merged = new Set(staticIds);
  for (const id of collectManifestScheduleIds(popupState)) {
    merged.add(id);
  }
  return merged;
}

function detectPayloadAction(body) {
  let payload;
  try {
    payload = JSON.parse(body);
  } catch (_err) {
    throw new Error("Invalid JSON body");
  }

  if (isPlainObject(payload) && payload.action === "replaceWeek") {
    return "replaceWeek";
  }

  if (isPlainObject(payload) && payload.action === "upsertSlot") {
    return "upsertSlot";
  }

  return "availability";
}

module.exports = {
  VALID_DESTINATION_KEYS,
  availabilityUpdatesFromSlots,
  buildManifest,
  collectManifestScheduleIds,
  detectPayloadAction,
  emptyPopupState,
  mergeKnownScheduleIds,
  mergeReplaceWeek,
  parseReplaceWeekPayload,
  publicPopupState,
};
