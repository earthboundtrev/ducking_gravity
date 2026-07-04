const SMARTASTRO_CALENDAR_HOST = "smartastro.app";
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_WINDOW_WEEKS = 6;
const STUDIO_TIMEZONE = process.env.SMARTASTRO_STUDIO_TIMEZONE || "America/New_York";
const MAX_CLASS_NAME_LENGTH = 120;
const MAX_DISPLAY_FIELD_LENGTH = 200;
const MAX_SLOTS_PER_DESTINATION = 300;

/** Managed list/table destinations exposed to SmartAstro for upsertSlot (#224). */
const MANAGED_DESTINATION_DEFINITIONS = {
  "silks-foundations": {
    destinationKey: "silks-foundations",
    classNames: ["Silks Foundations"],
    insertionEnabled: true,
  },
  "silks-adult-aerials": {
    destinationKey: "silks-adult-aerials",
    classNames: ["Adult Aerials"],
    insertionEnabled: true,
  },
  "silks-open-aerials": {
    destinationKey: "silks-open-aerials",
    classNames: ["Open Aerials"],
    insertionEnabled: true,
  },
  "lyra-foundations": {
    destinationKey: "lyra-foundations",
    classNames: ["Lyra Foundations"],
    insertionEnabled: true,
  },
  "mixed-apparatus-foundations": {
    destinationKey: "mixed-apparatus-foundations",
    classNames: ["Mixed Apparatus Foundations"],
    insertionEnabled: true,
  },
  "junior-aerial-classes": {
    destinationKey: "junior-aerial-classes",
    classNames: ["Junior Aerial Classes", "Junior Aerials"],
    insertionEnabled: true,
  },
  "spin-and-swing": {
    destinationKey: "spin-and-swing",
    classNames: ["Spin and Swing"],
    insertionEnabled: true,
  },
  "juniors-open-aerials": {
    destinationKey: "juniors-open-aerials",
    classNames: ["Open Aerials"],
    insertionEnabled: true,
  },
  "silks-act-classes": {
    destinationKey: "silks-act-classes",
    classNames: ["ACT! Classes", "ACT! Session 1"],
    insertionEnabled: true,
  },
};

const VALID_MANAGED_DESTINATION_KEYS = new Set(Object.keys(MANAGED_DESTINATION_DEFINITIONS));

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function containsHtml(value) {
  return /[<>&]/.test(value);
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

function isValidIsoDateTime(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed);
}

function isValidSignUpUrl(url, scheduleId) {
  if (typeof url !== "string" || url.length > 500) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    if (!parsed.hostname.endsWith(SMARTASTRO_CALENDAR_HOST)) return false;
    return parsed.searchParams.get("class") === String(scheduleId);
  } catch (_err) {
    return false;
  }
}

function toYmdFromIsoDateTime(isoDateTime, timezone = STUDIO_TIMEZONE) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(isoDateTime));
}

function addDaysToYmd(ymd, days) {
  const [year, month, day] = ymd.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return next.toISOString().slice(0, 10);
}

function defaultWindow(referenceDate = new Date()) {
  const today = toYmdFromIsoDateTime(referenceDate.toISOString());
  return {
    windowStart: today,
    windowEnd: addDaysToYmd(today, DEFAULT_WINDOW_WEEKS * 7 - 1),
  };
}

function normalizeManagedSlot(rawSlot) {
  if (!isPlainObject(rawSlot)) return null;

  const scheduleId = Number(rawSlot.scheduleId);
  if (!Number.isInteger(scheduleId) || scheduleId <= 0) return null;

  const className = typeof rawSlot.className === "string" ? rawSlot.className.trim() : "";
  const displayDate = typeof rawSlot.displayDate === "string" ? rawSlot.displayDate.trim() : "";
  const displayTime = typeof rawSlot.displayTime === "string" ? rawSlot.displayTime.trim() : "";
  const displayPrice = typeof rawSlot.displayPrice === "string" ? rawSlot.displayPrice.trim() : "";

  if (!className || className.length > MAX_CLASS_NAME_LENGTH || containsHtml(className)) return null;
  if (!displayDate || displayDate.length > MAX_DISPLAY_FIELD_LENGTH || containsHtml(displayDate)) return null;
  if (!displayTime || displayTime.length > MAX_DISPLAY_FIELD_LENGTH || containsHtml(displayTime)) return null;
  if (!displayPrice || displayPrice.length > MAX_DISPLAY_FIELD_LENGTH) return null;

  if (!isValidIsoDateTime(rawSlot.startsAt) || !isValidIsoDateTime(rawSlot.endsAt)) return null;

  const signUpUrl =
    typeof rawSlot.signUpUrl === "string" && rawSlot.signUpUrl.trim()
      ? rawSlot.signUpUrl.trim()
      : `https://smartastro.app/calendar?class=${scheduleId}`;

  if (!isValidSignUpUrl(signUpUrl, scheduleId)) return null;

  return {
    scheduleId,
    className,
    startsAt: new Date(rawSlot.startsAt).toISOString(),
    endsAt: new Date(rawSlot.endsAt).toISOString(),
    displayDate,
    displayTime,
    displayPrice,
    isFull: Boolean(rawSlot.isFull),
    availableSpots: Math.max(0, Number(rawSlot.availableSpots) || 0),
    isClosed: Boolean(rawSlot.isClosed),
    hasEnded: Boolean(rawSlot.hasEnded),
    signUpUrl,
    updatedAt: new Date().toISOString(),
  };
}

function parseUpsertSlotPayload(body) {
  let payload;
  try {
    payload = JSON.parse(body);
  } catch (_err) {
    throw new Error("Invalid JSON body");
  }

  if (!isPlainObject(payload) || payload.action !== "upsertSlot" || payload.source !== "smartastro") {
    throw new Error("Invalid SmartAstro upsertSlot payload");
  }

  const destinationKey =
    typeof payload.destinationKey === "string" ? payload.destinationKey.trim() : "";
  const definition = MANAGED_DESTINATION_DEFINITIONS[destinationKey];
  if (!definition) {
    throw new Error("Unknown managed destination key");
  }
  if (!definition.insertionEnabled) {
    throw new Error("Managed destination insertion is disabled");
  }

  const slot = normalizeManagedSlot(payload);
  if (!slot) {
    throw new Error("Invalid upsertSlot fields");
  }

  const classNameMatches = definition.classNames.some(
    (name) => name.trim().toLowerCase() === slot.className.toLowerCase(),
  );
  if (!classNameMatches) {
    throw new Error("Class name does not match destination rules");
  }

  let windowStart =
    typeof payload.windowStart === "string" && isValidIsoDate(payload.windowStart)
      ? payload.windowStart
      : null;
  let windowEnd =
    typeof payload.windowEnd === "string" && isValidIsoDate(payload.windowEnd) ? payload.windowEnd : null;

  if (windowStart && windowEnd && windowStart > windowEnd) {
    throw new Error("Invalid managed destination window dates");
  }

  return {
    action: "upsertSlot",
    source: "smartastro",
    generatedAt:
      typeof payload.generatedAt === "string" && payload.generatedAt.trim()
        ? payload.generatedAt.trim()
        : new Date().toISOString(),
    destinationKey,
    windowStart,
    windowEnd,
    slot,
  };
}

function emptyManagedState() {
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

function buildManagedManifest(destinations) {
  const byDestination = {};
  const scheduleIds = new Set();

  for (const [destinationKey, destination] of Object.entries(destinations)) {
    const ids = (destination.slots || []).map((slot) => slot.scheduleId);
    byDestination[destinationKey] = ids;
    for (const id of ids) {
      scheduleIds.add(id);
    }
  }

  return {
    scheduleIds: Array.from(scheduleIds).sort((a, b) => a - b),
    byDestination,
    updatedAt: new Date().toISOString(),
  };
}

function slotWithinWindow(slot, windowStart, windowEnd) {
  const slotDate = toYmdFromIsoDateTime(slot.startsAt);
  return slotDate >= windowStart && slotDate <= windowEnd;
}

function sortManagedSlots(slots) {
  return [...slots].sort((a, b) => {
    const startDiff = Date.parse(a.startsAt) - Date.parse(b.startsAt);
    if (startDiff !== 0) return startDiff;
    return a.scheduleId - b.scheduleId;
  });
}

function upsertManagedSlot(existingState, payload) {
  const destinations = {
    ...(existingState && existingState.destinations ? existingState.destinations : {}),
  };

  const existingDestination = destinations[payload.destinationKey] || {};
  const window =
    payload.windowStart && payload.windowEnd
      ? { windowStart: payload.windowStart, windowEnd: payload.windowEnd }
      : existingDestination.windowStart && existingDestination.windowEnd
        ? {
            windowStart: existingDestination.windowStart,
            windowEnd: existingDestination.windowEnd,
          }
        : defaultWindow();

  if (!slotWithinWindow(payload.slot, window.windowStart, window.windowEnd)) {
    throw new Error("Slot is outside the managed destination window");
  }

  const slots = Array.isArray(existingDestination.slots) ? [...existingDestination.slots] : [];
  const existingIndex = slots.findIndex((slot) => slot.scheduleId === payload.slot.scheduleId);
  const inserted = existingIndex < 0;

  if (existingIndex >= 0) {
    slots[existingIndex] = { ...slots[existingIndex], ...payload.slot };
  } else {
    if (slots.length >= MAX_SLOTS_PER_DESTINATION) {
      throw new Error("Managed destination has too many slots");
    }
    slots.push(payload.slot);
  }

  destinations[payload.destinationKey] = {
    destinationKey: payload.destinationKey,
    windowStart: window.windowStart,
    windowEnd: window.windowEnd,
    insertionEnabled: true,
    slots: sortManagedSlots(slots),
    updatedAt: new Date().toISOString(),
  };

  const state = {
    source: "smartastro",
    updatedAt: new Date().toISOString(),
    destinations,
    manifest: buildManagedManifest(destinations),
  };

  return {
    state,
    summary: {
      destinationKey: payload.destinationKey,
      scheduleId: payload.slot.scheduleId,
      inserted,
      windowStart: window.windowStart,
      windowEnd: window.windowEnd,
    },
  };
}

function publicManagedState(state) {
  const destinations = {};
  for (const [key, definition] of Object.entries(MANAGED_DESTINATION_DEFINITIONS)) {
    const stored = state && state.destinations ? state.destinations[key] : null;
    const window =
      stored && stored.windowStart && stored.windowEnd
        ? { windowStart: stored.windowStart, windowEnd: stored.windowEnd }
        : defaultWindow();
    destinations[key] = {
      destinationKey: key,
      classNames: definition.classNames,
      insertionEnabled: definition.insertionEnabled,
      windowStart: window.windowStart,
      windowEnd: window.windowEnd,
      slots: stored && Array.isArray(stored.slots) ? stored.slots : [],
      updatedAt: stored && stored.updatedAt ? stored.updatedAt : null,
    };
  }

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
    definitions: MANAGED_DESTINATION_DEFINITIONS,
    manifest,
  };
}

function collectManagedManifestScheduleIds(managedState) {
  if (!managedState || !managedState.manifest || !Array.isArray(managedState.manifest.scheduleIds)) {
    return [];
  }
  return managedState.manifest.scheduleIds;
}

function purgeOutOfWindowManagedSlots(existingState) {
  const destinations = {
    ...(existingState && existingState.destinations ? existingState.destinations : {}),
  };
  let purged = 0;

  for (const [destinationKey, destination] of Object.entries(destinations)) {
    const windowStart = destination.windowStart;
    const windowEnd = destination.windowEnd;
    if (!windowStart || !windowEnd) continue;

    const slots = Array.isArray(destination.slots) ? destination.slots : [];
    const nextSlots = slots.filter((slot) => slotWithinWindow(slot, windowStart, windowEnd));
    if (nextSlots.length === slots.length) continue;

    purged += slots.length - nextSlots.length;
    destinations[destinationKey] = {
      ...destination,
      slots: sortManagedSlots(nextSlots),
      updatedAt: new Date().toISOString(),
    };
  }

  if (purged === 0) {
    return { state: existingState, purged: 0 };
  }

  return {
    state: {
      source: "smartastro",
      updatedAt: new Date().toISOString(),
      destinations,
      manifest: buildManagedManifest(destinations),
    },
    purged,
  };
}

function removeSchedulesFromManagedState(existingState, scheduleIds) {
  const ids = new Set(
    (scheduleIds || [])
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0),
  );
  if (ids.size === 0) {
    return { state: existingState, removed: 0 };
  }

  const destinations = {
    ...(existingState && existingState.destinations ? existingState.destinations : {}),
  };
  let removed = 0;

  for (const [destinationKey, destination] of Object.entries(destinations)) {
    const slots = Array.isArray(destination.slots) ? destination.slots : [];
    const nextSlots = slots.filter((slot) => !ids.has(slot.scheduleId));
    if (nextSlots.length === slots.length) continue;
    removed += slots.length - nextSlots.length;
    destinations[destinationKey] = {
      ...destination,
      slots: sortManagedSlots(nextSlots),
      updatedAt: new Date().toISOString(),
    };
  }

  if (removed === 0) {
    return { state: existingState, removed: 0 };
  }

  return {
    state: {
      source: "smartastro",
      updatedAt: new Date().toISOString(),
      destinations,
      manifest: buildManagedManifest(destinations),
    },
    removed,
  };
}

function availabilityUpdateFromManagedSlot(slot, generatedAt) {
  return {
    scheduleId: slot.scheduleId,
    isFull: slot.isFull,
    availableSpots: slot.availableSpots,
    isClosed: slot.isClosed,
    hasEnded: Boolean(slot.hasEnded),
    signUpUrl: slot.signUpUrl,
    lastSyncedAt: generatedAt,
  };
}

module.exports = {
  DEFAULT_WINDOW_WEEKS,
  MANAGED_DESTINATION_DEFINITIONS,
  VALID_MANAGED_DESTINATION_KEYS,
  availabilityUpdateFromManagedSlot,
  buildManagedManifest,
  collectManagedManifestScheduleIds,
  defaultWindow,
  emptyManagedState,
  parseUpsertSlotPayload,
  publicManagedState,
  purgeOutOfWindowManagedSlots,
  removeSchedulesFromManagedState,
  slotWithinWindow,
  upsertManagedSlot,
};
