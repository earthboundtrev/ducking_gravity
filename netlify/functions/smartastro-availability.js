const { connectLambda, getStore } = require("@netlify/blobs");
const {
  json,
  mergeKnownScheduleIdsWithPayload,
  mergeSlotState,
  parsePayload,
  publicState,
  resolveKnownScheduleIds,
  validateTimestamp,
  verifySignature,
} = require("./lib/smartastro-availability");
const {
  availabilityUpdatesFromSlots,
  detectPayloadAction,
  emptyPopupState,
  mergeReplaceWeek,
  parseReplaceWeekPayload,
  removeSchedulesFromPopupState,
} = require("./lib/smartastro-popup-rollover");
const {
  availabilityUpdateFromManagedSlot,
  emptyManagedState,
  parseUpsertSlotPayload,
  purgeOutOfWindowManagedSlots,
  removeSchedulesFromManagedState,
  upsertManagedSlot,
} = require("./lib/smartastro-managed-destinations");
const {
  hasSeenIdempotencyKey,
  rememberIdempotencyKey,
} = require("./lib/smartastro-replay-protection");

const STORE_NAME = "smartastro-availability";
const STATE_KEY = "class-slots";
const POPUP_STATE_KEY = "homepage-popups";
const MANAGED_STATE_KEY = "managed-slots";
const MAX_BODY_BYTES = 1024 * 1024;
const MAX_UPDATES = 500;

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

async function readPopupState(store) {
  const state = await store.get(POPUP_STATE_KEY, { type: "json" });
  return state || emptyPopupState();
}

async function readManagedState(store) {
  const state = await store.get(MANAGED_STATE_KEY, { type: "json" });
  return state || emptyManagedState();
}

function buildAvailabilityPayloadFromRolloverSlots(slots, generatedAt) {
  return {
    source: "smartastro",
    generatedAt,
    updates: availabilityUpdatesFromSlots(slots, generatedAt),
  };
}

function buildAvailabilityPayloadFromManagedSlot(slot, generatedAt) {
  return {
    source: "smartastro",
    generatedAt,
    updates: [availabilityUpdateFromManagedSlot(slot, generatedAt)],
  };
}

exports.handler = async function smartAstroAvailability(event) {
  // Functions v1 (Lambda compatibility) does not auto-inject Blobs credentials.
  connectLambda(event);
  const store = getStore(STORE_NAME);

  if (event.httpMethod === "GET") {
    const [state, popupState, managedState] = await Promise.all([
      readState(store),
      readPopupState(store),
      readManagedState(store),
    ]);
    return json(200, publicState(state, popupState, managedState));
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

  let action;
  try {
    action = detectPayloadAction(body);
  } catch (err) {
    return json(400, { error: err.message });
  }

  if (action === "replaceWeek") {
    let payload;
    try {
      payload = parseReplaceWeekPayload(body);
    } catch (err) {
      return json(400, { error: err.message });
    }

    const existingPopupState = await readPopupState(store);
    const managedState = await readManagedState(store);
    let popupState;
    let summary;
    try {
      ({ state: popupState, summary } = mergeReplaceWeek(existingPopupState, payload));
    } catch (err) {
      return json(400, { error: err.message });
    }

    if (!summary.preservedPreviousWeek) {
      await store.setJSON(POPUP_STATE_KEY, popupState);

      const knownScheduleIds = resolveKnownScheduleIds(popupState, managedState);
      const rolloverAvailabilityPayload = buildAvailabilityPayloadFromRolloverSlots(
        payload.slots,
        payload.generatedAt,
      );
      const { state: mergedAvailabilityState, summary: availabilitySummary } = mergeSlotState(
        existingState,
        rolloverAvailabilityPayload,
        { knownScheduleIds },
      );
      await store.setJSON(
        STATE_KEY,
        rememberIdempotencyKey(mergedAvailabilityState, idempotencyKey),
      );

      return json(200, {
        ok: true,
        action: "replaceWeek",
        ...summary,
        availabilityUpdated: availabilitySummary.updated,
      });
    }

    await store.setJSON(
      STATE_KEY,
      rememberIdempotencyKey(existingState, idempotencyKey),
    );

    return json(200, {
      ok: true,
      action: "replaceWeek",
      ...summary,
      availabilityUpdated: 0,
    });
  }

  if (action === "upsertSlot") {
    let payload;
    try {
      payload = parseUpsertSlotPayload(body);
    } catch (err) {
      return json(400, { error: err.message });
    }

    const existingManagedState = await readManagedState(store);
    const popupState = await readPopupState(store);
    let { state: managedState, summary } = upsertManagedSlot(existingManagedState, payload);
    const { state: purgedState, purged } = purgeOutOfWindowManagedSlots(managedState);
    if (purged > 0) {
      managedState = purgedState;
      summary.purgedOutOfWindow = purged;
    }
    await store.setJSON(MANAGED_STATE_KEY, managedState);

    const knownScheduleIds = resolveKnownScheduleIds(popupState, managedState);
    const slotAvailabilityPayload = buildAvailabilityPayloadFromManagedSlot(
      payload.slot,
      payload.generatedAt,
    );
    const { state: mergedAvailabilityState, summary: availabilitySummary } = mergeSlotState(
      existingState,
      slotAvailabilityPayload,
      { knownScheduleIds },
    );
    await store.setJSON(
      STATE_KEY,
      rememberIdempotencyKey(mergedAvailabilityState, idempotencyKey),
    );

    return json(200, {
      ok: true,
      action: "upsertSlot",
      ...summary,
      availabilityUpdated: availabilitySummary.updated,
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

  const popupState = await readPopupState(store);
  let managedState = await readManagedState(store);
  const knownScheduleIds = mergeKnownScheduleIdsWithPayload(
    resolveKnownScheduleIds(popupState, managedState),
    payload,
  );
  const { state, summary } = mergeSlotState(existingState, payload, { knownScheduleIds });

  if (payload.removedScheduleIds && payload.removedScheduleIds.length > 0) {
    const { state: nextPopupState, removed: popupRemoved } = removeSchedulesFromPopupState(
      popupState,
      payload.removedScheduleIds,
    );
    if (popupRemoved > 0) {
      await store.setJSON(POPUP_STATE_KEY, nextPopupState);
      summary.popupRemoved = popupRemoved;
    }

    const { state: nextManagedState, removed: managedRemoved } = removeSchedulesFromManagedState(
      managedState,
      payload.removedScheduleIds,
    );
    if (managedRemoved > 0) {
      managedState = nextManagedState;
      summary.managedRemoved = managedRemoved;
    }

    const { state: purgedState, purged } = purgeOutOfWindowManagedSlots(managedState);
    if (purged > 0) {
      managedState = purgedState;
      summary.purgedOutOfWindow = purged;
    }

    if ((summary.managedRemoved || 0) > 0 || (summary.purgedOutOfWindow || 0) > 0) {
      await store.setJSON(MANAGED_STATE_KEY, managedState);
    }
  }

  await store.setJSON(STATE_KEY, rememberIdempotencyKey(state, idempotencyKey));

  return json(200, {
    ok: true,
    ...summary,
  });
};
