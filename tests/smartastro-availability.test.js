const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const {
  createSignature,
  collectPayloadScheduleIds,
  markInWeekPopupRemovalsAsClassOver,
  mergeKnownScheduleIdsWithPayload,
  mergeSlotState,
  parsePayload,
  publicState,
  resolveKnownScheduleIds,
  STATIC_KNOWN_SCHEDULE_IDS,
  validateTimestamp,
  verifySignature,
} = require("../netlify/functions/lib/smartastro-availability");
const {
  buildManifest,
  detectPayloadAction,
  emptyPopupState,
  excludeInWeekPopupProtectedIds,
  mergeKnownScheduleIds,
  mergeReplaceWeek,
  parseReplaceWeekPayload,
  removeSchedulesFromPopupState,
} = require("../netlify/functions/lib/smartastro-popup-rollover");
const {
  emptyManagedState,
  parseUpsertSlotPayload,
  purgeOutOfWindowManagedSlots,
  removeSchedulesFromManagedState,
  buildManagedManifest,
  upsertManagedSlot,
  VALID_MANAGED_DESTINATION_KEYS,
} = require("../netlify/functions/lib/smartastro-managed-destinations");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const ALL_CLASSES_FIXTURE = path.join(
  PROJECT_ROOT,
  "tests/fixtures/replace-week-all-classes.json",
);
const SILKS_WEEK_FIXTURE = path.join(
  PROJECT_ROOT,
  "tests/fixtures/replace-week-silks-week.json",
);
const NEXT_WEEK_FIXTURE = path.join(
  PROJECT_ROOT,
  "tests/fixtures/replace-week-next-week.json",
);
const UPSERT_FIXTURE = path.join(
  PROJECT_ROOT,
  "tests/fixtures/upsert-slot-silks-foundations.json",
);

/** Fixture upsert whose slot falls inside defaultWindow() (starts at today). */
function inWindowUpsertBody(overrides = {}) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    ...JSON.parse(fs.readFileSync(UPSERT_FIXTURE, "utf8")),
    windowStart: today,
    windowEnd: "2099-12-31",
    startsAt: `${today}T21:30:00.000Z`,
    endsAt: `${today}T22:30:00.000Z`,
    displayDate: "Today",
    ...overrides,
  };
}

function parseInWindowUpsert(overrides = {}) {
  return parseUpsertSlotPayload(JSON.stringify(inWindowUpsertBody(overrides)));
}

test("verifies SmartAstro HMAC signatures over timestamp and raw body", () => {
  const body = JSON.stringify({ source: "smartastro", updates: [] });
  const timestamp = "2026-06-27T15:00:00.000Z";
  const signature = createSignature("secret", timestamp, body);

  assert.match(signature, /^sha256=[a-f0-9]{64}$/);
  assert.equal(verifySignature("secret", timestamp, body, signature), true);
  assert.equal(verifySignature("secret", timestamp, JSON.stringify({ changed: true }), signature), false);
});

test("rejects stale timestamps", () => {
  assert.equal(
    validateTimestamp("2026-06-27T15:00:00.000Z", Date.parse("2026-06-27T15:04:59.000Z")),
    true,
  );
  assert.equal(
    validateTimestamp("2026-06-27T15:00:00.000Z", Date.parse("2026-06-27T15:05:01.000Z")),
    false,
  );
});

test("rejects future timestamps outside the allowed clock window", () => {
  assert.equal(
    validateTimestamp("2026-06-27T15:04:59.000Z", Date.parse("2026-06-27T15:00:00.000Z")),
    true,
  );
  assert.equal(
    validateTimestamp("2026-06-27T15:05:01.000Z", Date.parse("2026-06-27T15:00:00.000Z")),
    false,
  );
  assert.equal(validateTimestamp("not-a-date"), false);
});

const {
  hasSeenIdempotencyKey,
  rememberIdempotencyKey,
  IDEMPOTENCY_RETENTION_MS,
} = require("../netlify/functions/lib/smartastro-replay-protection");

test("dedupes repeated idempotency keys within the retention window", () => {
  const state = { idempotencyKeys: [] };
  assert.equal(hasSeenIdempotencyKey(state, "run-1"), false);

  const afterFirst = rememberIdempotencyKey(state, "run-1");
  assert.equal(hasSeenIdempotencyKey(afterFirst, "run-1"), true);
  assert.equal(hasSeenIdempotencyKey(afterFirst, "run-2"), false);
});

test("expires idempotency keys after the retention window", () => {
  const staleSeenAt = new Date(Date.now() - IDEMPOTENCY_RETENTION_MS - 1000).toISOString();
  const state = {
    idempotencyKeys: [{ key: "old-run", seenAt: staleSeenAt }],
  };

  const refreshed = rememberIdempotencyKey(state, "new-run");
  assert.equal(hasSeenIdempotencyKey(refreshed, "old-run"), false);
  assert.equal(hasSeenIdempotencyKey(refreshed, "new-run"), true);
});

test("updates known slots and skips unknown schedule IDs", () => {
  const payload = parsePayload(
    JSON.stringify({
      source: "smartastro",
      generatedAt: "2026-06-27T15:00:00.000Z",
      baseCalendarUrl: "https://smartastro.app/calendar",
      updates: [
        { scheduleId: 1440, isFull: false, availableSpots: 1, isClosed: false },
        { scheduleId: 999999, isFull: true, availableSpots: 0, isClosed: false },
      ],
    }),
  );

  const { state, summary } = mergeSlotState(null, payload);

  assert.equal(summary.updated, 1);
  assert.deepEqual(summary.skippedUnknown, [999999]);
  assert.equal(state.slots["1440"].isFull, false);
  assert.equal(state.slots["1440"].signUpUrl, "https://smartastro.app/calendar?class=1440");
});

test("availability batch accepts schedule IDs discovered on class pages", () => {
  const payload = parsePayload(
    JSON.stringify({
      source: "smartastro",
      generatedAt: "2026-07-01T15:00:00.000Z",
      updates: [
        { scheduleId: 1444, isFull: true, availableSpots: 0, isClosed: false },
        { scheduleId: 1511, isFull: false, availableSpots: 2, isClosed: false },
      ],
    }),
  );

  const knownScheduleIds = mergeKnownScheduleIdsWithPayload(
    resolveKnownScheduleIds(emptyPopupState(), emptyManagedState()),
    payload,
  );

  assert.ok(!STATIC_KNOWN_SCHEDULE_IDS.has(1444));
  assert.ok(!STATIC_KNOWN_SCHEDULE_IDS.has(1511));
  assert.ok(knownScheduleIds.has(1444));
  assert.ok(knownScheduleIds.has(1511));

  const { state, summary } = mergeSlotState(null, payload, { knownScheduleIds });
  assert.equal(summary.updated, 2);
  assert.deepEqual(summary.skippedUnknown, []);
  assert.equal(state.slots["1444"].isFull, true);
  assert.equal(state.slots["1511"].isFull, false);
});

test("collectPayloadScheduleIds ignores invalid schedule IDs", () => {
  const payload = parsePayload(
    JSON.stringify({
      source: "smartastro",
      updates: [
        { scheduleId: 1478, isFull: true, availableSpots: 0, isClosed: false },
        { scheduleId: "bad", isFull: false, availableSpots: 1, isClosed: false },
        { scheduleId: 0, isFull: false, availableSpots: 1, isClosed: false },
      ],
    }),
  );

  assert.deepEqual(collectPayloadScheduleIds(payload), [1478]);
});

test("homepage popup slots keep stable SmartAstro schedule IDs", () => {
  const html = fs.readFileSync(path.join(PROJECT_ROOT, "index.html"), "utf8");
  const slotBlocks = html.match(/<div class="popup-slot"[\s\S]*?<\/div>/g) || [];

  assert.ok(slotBlocks.length > 0, "expected homepage popup slots");

  for (const block of slotBlocks) {
    assert.match(block, /data-smartastro-schedule-id="\d+"/);
  }

  assert.match(
    html,
    /data-smartastro-schedule-id="1440"[\s\S]*?<span class="popup-slot-button full">Class Full<\/span>/,
  );
});

test("managed homepage popup destinations exist in index.html", () => {
  const html = fs.readFileSync(path.join(PROJECT_ROOT, "index.html"), "utf8");

  assert.match(html, /data-smartastro-popup-destination="homepage-all-classes-week"/);
  assert.match(html, /data-smartastro-popup-destination="homepage-lyra"/);
  assert.doesNotMatch(html, /data-smartastro-popup-destination="homepage-silks-week"/);
  assert.doesNotMatch(html, /PNO_july_25_flyer\.png/);
  assert.doesNotMatch(html, /Parents Night Out/);

  assert.doesNotMatch(html, /national_night_out\.jpeg/);
  assert.doesNotMatch(html, /National Night Out/);
  assert.doesNotMatch(html, /calendar\?class=1649/);

  const managedSlides = html.match(
    /data-slide="0" data-smartastro-popup-destination="homepage-all-classes-week"[\s\S]*?data-slide="1" data-smartastro-popup-destination="homepage-lyra"/,
  );
  assert.ok(managedSlides, "expected all-classes then lyra as the homepage carousel slides");
  assert.match(
    html,
    /<div class="popup-carousel-slide active" data-slide="0" data-smartastro-popup-destination="homepage-all-classes-week">/,
  );
});

test("parses replaceWeek payloads from fixture", () => {
  const body = fs.readFileSync(ALL_CLASSES_FIXTURE, "utf8");
  assert.equal(detectPayloadAction(body), "replaceWeek");

  const payload = parseReplaceWeekPayload(body);
  assert.equal(payload.destinationKey, "homepage-all-classes-week");
  assert.equal(payload.slots.length, 2);
  assert.equal(payload.slots[0].scheduleId, 1468);
});

test("rejects invalid replaceWeek payloads", () => {
  const body = fs.readFileSync(ALL_CLASSES_FIXTURE, "utf8");
  const payload = JSON.parse(body);
  payload.destinationKey = "homepage-summer-camp";
  assert.throws(() => parseReplaceWeekPayload(JSON.stringify(payload)), /Unknown popup destination key/);

  payload.destinationKey = "homepage-all-classes-week";
  payload.heading = "<script>alert(1)</script>";
  assert.throws(() => parseReplaceWeekPayload(JSON.stringify(payload)), /Invalid popup heading/);
});

test("replaceWeek performs whole-week slot replacement per destination", () => {
  const first = parseReplaceWeekPayload(fs.readFileSync(ALL_CLASSES_FIXTURE, "utf8"));
  const second = parseReplaceWeekPayload(fs.readFileSync(NEXT_WEEK_FIXTURE, "utf8"));

  const { state: afterFirst } = mergeReplaceWeek(emptyPopupState(), first);
  const { state: afterSecond } = mergeReplaceWeek(afterFirst, second);

  const destination = afterSecond.destinations["homepage-all-classes-week"];
  assert.equal(destination.windowStart, "2026-07-06");
  assert.equal(destination.slots.length, 1);
  assert.equal(destination.slots[0].scheduleId, 1600);
  assert.deepEqual(afterSecond.manifest.byDestination["homepage-all-classes-week"], [1600]);
  assert.ok(!afterSecond.manifest.byDestination["homepage-all-classes-week"].includes(1468));
});

test("replaceWeek removes prior-week schedule ids only via whole-week swap", () => {
  const first = parseReplaceWeekPayload(fs.readFileSync(ALL_CLASSES_FIXTURE, "utf8"));
  const second = parseReplaceWeekPayload(fs.readFileSync(NEXT_WEEK_FIXTURE, "utf8"));

  const { state: afterFirst } = mergeReplaceWeek(emptyPopupState(), first);
  assert.deepEqual(afterFirst.manifest.scheduleIds.sort((a, b) => a - b), [1468, 1518]);

  const { state: afterSecond } = mergeReplaceWeek(afterFirst, second);
  assert.deepEqual(afterSecond.manifest.scheduleIds, [1600]);
});

test("replaceWeek is idempotent when the same payload is re-applied", () => {
  const payload = parseReplaceWeekPayload(fs.readFileSync(NEXT_WEEK_FIXTURE, "utf8"));
  const { state: once } = mergeReplaceWeek(emptyPopupState(), payload);
  const { state: twice, summary } = mergeReplaceWeek(once, payload);

  assert.equal(summary.preservedPreviousWeek, false);
  assert.equal(twice.destinations["homepage-all-classes-week"].slots.length, 1);
  assert.deepEqual(
    twice.destinations["homepage-all-classes-week"].slots,
    once.destinations["homepage-all-classes-week"].slots,
  );
});

test("empty replaceWeek preserves the last populated week (#229)", () => {
  const populated = parseReplaceWeekPayload(fs.readFileSync(ALL_CLASSES_FIXTURE, "utf8"));
  const { state: afterPopulated } = mergeReplaceWeek(emptyPopupState(), populated);

  const emptyBody = fs.readFileSync(
    path.join(PROJECT_ROOT, "tests/fixtures/replace-week-empty.json"),
    "utf8",
  );
  const emptyPayload = parseReplaceWeekPayload(emptyBody);
  const { state: afterEmpty, summary } = mergeReplaceWeek(afterPopulated, emptyPayload);

  assert.equal(summary.preservedPreviousWeek, true);
  assert.deepEqual(
    afterEmpty.destinations["homepage-all-classes-week"].slots,
    afterPopulated.destinations["homepage-all-classes-week"].slots,
  );
  assert.deepEqual(afterEmpty.manifest.scheduleIds.sort((a, b) => a - b), [1468, 1518]);
});

test("empty replaceWeek for a new window clears prior popup slots (#281)", () => {
  const populated = parseReplaceWeekPayload(fs.readFileSync(ALL_CLASSES_FIXTURE, "utf8"));
  const { state: afterPopulated } = mergeReplaceWeek(emptyPopupState(), populated);

  const newWeekEmptyBody = JSON.stringify({
    action: "replaceWeek",
    source: "smartastro",
    generatedAt: "2026-07-05T10:00:00.000Z",
    destinationKey: "homepage-all-classes-week",
    windowStart: "2026-07-06",
    windowEnd: "2026-07-10",
    heading: "All classes this week — Mon Jul 6 through Fri Jul 10, 2026",
    slots: [],
  });
  const newWeekEmpty = parseReplaceWeekPayload(newWeekEmptyBody);
  const { state: afterEmpty, summary } = mergeReplaceWeek(afterPopulated, newWeekEmpty);

  assert.equal(summary.preservedPreviousWeek, false);
  assert.equal(afterEmpty.destinations["homepage-all-classes-week"].slots.length, 0);
  assert.equal(afterEmpty.destinations["homepage-all-classes-week"].windowStart, "2026-07-06");
  assert.deepEqual(afterEmpty.manifest.scheduleIds, []);
});

test("weekend next-week replaceWeek payload replaces the published window", () => {
  const currentWeek = parseReplaceWeekPayload(fs.readFileSync(ALL_CLASSES_FIXTURE, "utf8"));
  const nextWeek = parseReplaceWeekPayload(fs.readFileSync(NEXT_WEEK_FIXTURE, "utf8"));

  assert.equal(currentWeek.windowStart, "2026-06-29");
  assert.equal(nextWeek.windowStart, "2026-07-06");
  assert.ok(nextWeek.slots.length > 0, "weekend payload should stay populated");

  const { state } = mergeReplaceWeek(
    mergeReplaceWeek(emptyPopupState(), currentWeek).state,
    nextWeek,
  );
  const destination = state.destinations["homepage-all-classes-week"];
  assert.equal(destination.windowStart, "2026-07-06");
  assert.ok(destination.slots.length > 0);
});

test("managed popup render markers keep static fallback when API slots are empty", () => {
  const html = fs.readFileSync(path.join(PROJECT_ROOT, "index.html"), "utf8");
  assert.match(html, /data-smartastro-popup-slot-root/);
  assert.match(html, /data-smartastro-popup-heading/);
  assert.match(html, /data-smartastro-schedule-id="\d+"/);
});

test("manifest includes popup-linked schedule IDs for sync discovery", () => {
  const payload = parseReplaceWeekPayload(fs.readFileSync(ALL_CLASSES_FIXTURE, "utf8"));
  const { state } = mergeReplaceWeek(emptyPopupState(), payload);

  assert.deepEqual(state.manifest.scheduleIds, [1468, 1518]);
  assert.ok(resolveKnownScheduleIds(state).has(1468));
  assert.ok(resolveKnownScheduleIds(state).has(1518));
});

test("availability sync accepts popup manifest schedule IDs", () => {
  const nextWeek = parseReplaceWeekPayload(fs.readFileSync(NEXT_WEEK_FIXTURE, "utf8"));
  const { state: popupState } = mergeReplaceWeek(emptyPopupState(), nextWeek);
  const knownScheduleIds = resolveKnownScheduleIds(popupState, emptyManagedState());

  const availabilityPayload = parsePayload(
    JSON.stringify({
      source: "smartastro",
      updates: [
        { scheduleId: 1600, isFull: false, availableSpots: 2, isClosed: false },
        { scheduleId: 999999, isFull: true, availableSpots: 0, isClosed: false },
      ],
    }),
  );

  const { state, summary } = mergeSlotState(null, availabilityPayload, { knownScheduleIds });
  assert.equal(summary.updated, 1);
  assert.deepEqual(summary.skippedUnknown, [999999]);
  assert.equal(state.slots["1600"].availableSpots, 2);
});

test("public state exposes popup destinations and manifest", () => {
  const popupPayload = parseReplaceWeekPayload(fs.readFileSync(ALL_CLASSES_FIXTURE, "utf8"));
  const { state: popupState } = mergeReplaceWeek(emptyPopupState(), popupPayload);
  const response = publicState(
    { slots: {}, updatedAt: null, generatedAt: null },
    popupState,
    emptyManagedState(),
  );

  assert.ok(response.popups.destinations["homepage-all-classes-week"]);
  assert.deepEqual(response.manifest.scheduleIds, [1468, 1518]);
});

test("static homepage schedule IDs remain registered without popup state", () => {
  const known = resolveKnownScheduleIds(emptyPopupState(), emptyManagedState());
  for (const id of STATIC_KNOWN_SCHEDULE_IDS) {
    assert.ok(known.has(id));
  }
});

test("buildManifest aggregates ids across destinations", () => {
  const destinations = {
    "homepage-all-classes-week": {
      slots: [{ scheduleId: 10 }, { scheduleId: 11 }],
    },
    "homepage-lyra": {
      slots: [{ scheduleId: 11 }, { scheduleId: 12 }],
    },
  };

  const manifest = buildManifest(destinations);
  assert.deepEqual(manifest.scheduleIds, [10, 11, 12]);
  assert.deepEqual(manifest.byDestination["homepage-lyra"], [11, 12]);
});

test("mergeKnownScheduleIds unions static and popup ids", () => {
  const popupState = {
    manifest: { scheduleIds: [42, 1468] },
  };
  const merged = mergeKnownScheduleIds(STATIC_KNOWN_SCHEDULE_IDS, popupState);
  assert.ok(merged.has(42));
  assert.ok(merged.has(1440));
});

test("parses upsertSlot payloads from fixture", () => {
  const body = JSON.stringify(inWindowUpsertBody());
  assert.equal(detectPayloadAction(body), "upsertSlot");

  const payload = parseUpsertSlotPayload(body);
  assert.equal(payload.destinationKey, "silks-foundations");
  assert.equal(payload.slot.scheduleId, 1600);
});

test("rejects unknown managed destination keys", () => {
  const payload = inWindowUpsertBody({ destinationKey: "unknown-destination" });
  assert.throws(() => parseUpsertSlotPayload(JSON.stringify(payload)), /Unknown managed destination key/);
});

test("rejects out-of-window upsertSlot payloads", () => {
  const payload = parseInWindowUpsert();
  payload.windowStart = "2099-01-01";
  payload.windowEnd = "2099-01-31";
  assert.throws(() => upsertManagedSlot(emptyManagedState(), payload), /outside the managed destination window/);
});

test("upsertSlot inserts and updates without duplicates", () => {
  const first = parseInWindowUpsert();
  const { state: afterInsert, summary: insertSummary } = upsertManagedSlot(emptyManagedState(), first);
  assert.equal(insertSummary.inserted, true);
  assert.equal(afterInsert.destinations["silks-foundations"].slots.length, 1);

  const second = parseInWindowUpsert({ availableSpots: 1, isFull: true });
  const { state: afterUpdate, summary: updateSummary } = upsertManagedSlot(afterInsert, second);
  assert.equal(updateSummary.inserted, false);
  assert.equal(afterUpdate.destinations["silks-foundations"].slots.length, 1);
  assert.equal(afterUpdate.destinations["silks-foundations"].slots[0].isFull, true);
});

test("managed manifest schedule IDs are accepted by availability sync", () => {
  const upsertPayload = parseInWindowUpsert();
  const { state: managedState } = upsertManagedSlot(emptyManagedState(), upsertPayload);
  const knownScheduleIds = resolveKnownScheduleIds(emptyPopupState(), managedState);

  const availabilityPayload = parsePayload(
    JSON.stringify({
      source: "smartastro",
      updates: [{ scheduleId: 1600, isFull: false, availableSpots: 2, isClosed: false }],
    }),
  );
  const { state, summary } = mergeSlotState(null, availabilityPayload, { knownScheduleIds });
  assert.equal(summary.updated, 1);
  assert.equal(state.slots["1600"].availableSpots, 2);
});

test("class pages expose managed destination markers", () => {
  const silks = fs.readFileSync(path.join(PROJECT_ROOT, "silks.html"), "utf8");
  const lyra = fs.readFileSync(path.join(PROJECT_ROOT, "lyra.html"), "utf8");
  const juniors = fs.readFileSync(path.join(PROJECT_ROOT, "juniors.html"), "utf8");
  const homeschool = fs.readFileSync(path.join(PROJECT_ROOT, "homeschool.html"), "utf8");

  assert.match(silks, /data-smartastro-managed-destination="silks-foundations"/);
  assert.match(silks, /data-smartastro-managed-destination="silks-adult-aerials"/);
  assert.match(silks, /data-smartastro-managed-destination="silks-act-classes"/);
  assert.match(lyra, /data-smartastro-managed-destination="lyra-foundations"/);
  assert.match(juniors, /data-smartastro-managed-destination="juniors-act-classes"/);
  assert.match(homeschool, /data-smartastro-managed-destination="homeschool-foundations"/);
  assert.match(homeschool, /data-smartastro-managed-destination="junior-homeschool-foundations"/);
  assert.match(silks, /js\/smartastro-availability\.js/);
  assert.match(homeschool, /js\/smartastro-availability\.js/);
});

test("stores hasEnded separately from isFull in availability state (#269)", () => {
  const payload = parsePayload(
    JSON.stringify({
      source: "smartastro",
      generatedAt: "2026-07-01T15:00:00.000Z",
      updates: [
        {
          scheduleId: 1440,
          isFull: false,
          availableSpots: 6,
          isClosed: false,
          hasEnded: true,
        },
        {
          scheduleId: 1478,
          isFull: true,
          availableSpots: 0,
          isClosed: false,
          hasEnded: false,
        },
      ],
    }),
  );

  const { state } = mergeSlotState(null, payload);
  assert.equal(state.slots["1440"].hasEnded, true);
  assert.equal(state.slots["1440"].isFull, false);
  assert.equal(state.slots["1478"].hasEnded, false);
  assert.equal(state.slots["1478"].isFull, true);
});

test("marks removed schedules with a tombstone slot (#270)", () => {
  const payload = parsePayload(
    JSON.stringify({
      source: "smartastro",
      generatedAt: "2026-07-01T15:00:00.000Z",
      updates: [],
      removedScheduleIds: [1440],
    }),
  );

  const { state, summary } = mergeSlotState(null, payload);
  assert.equal(summary.removed, 1);
  assert.equal(state.slots["1440"].removed, true);
  assert.equal(state.slots["1440"].hasEnded, true);
  assert.equal(state.slots["1440"].isFull, false);
});

test("public state exposes managed destinations and combined manifest", () => {
  const upsertPayload = parseInWindowUpsert();
  const { state: managedState } = upsertManagedSlot(emptyManagedState(), upsertPayload);
  const response = publicState(
    { slots: {}, updatedAt: null, generatedAt: null },
    emptyPopupState(),
    managedState,
  );

  assert.ok(response.managed.destinations["silks-foundations"]);
  assert.deepEqual(response.manifest.scheduleIds, [1600]);
  assert.ok(VALID_MANAGED_DESTINATION_KEYS.has("lyra-foundations"));
  assert.ok(VALID_MANAGED_DESTINATION_KEYS.has("silks-act-classes"));
  assert.ok(VALID_MANAGED_DESTINATION_KEYS.has("juniors-act-classes"));
  assert.ok(VALID_MANAGED_DESTINATION_KEYS.has("homeschool-foundations"));
  assert.ok(VALID_MANAGED_DESTINATION_KEYS.has("junior-homeschool-foundations"));
});

test("accepts ACT! Session 1 upserts for silks-act-classes", () => {
  const today = new Date().toISOString().slice(0, 10);
  const body = JSON.stringify({
    action: "upsertSlot",
    source: "smartastro",
    generatedAt: "2026-07-01T16:00:00.000Z",
    destinationKey: "silks-act-classes",
    windowStart: today,
    windowEnd: "2099-12-31",
    scheduleId: 1586,
    className: "ACT! Session 1",
    startsAt: `${today}T21:45:00.000Z`,
    endsAt: `${today}T23:15:00.000Z`,
    displayDate: "Today",
    displayTime: "5:45pm - 7:15pm",
    displayPrice: "$115/month with ACT membership",
    isFull: false,
    availableSpots: 10,
    isClosed: false,
    signUpUrl: "https://smartastro.app/calendar?class=1586",
  });

  const payload = parseUpsertSlotPayload(body);
  const { summary } = upsertManagedSlot(emptyManagedState(), payload);
  assert.equal(summary.destinationKey, "silks-act-classes");
  assert.equal(summary.scheduleId, 1586);
});

test("accepts Junior ACT! and both Homeschool upserts for their destinations (#5)", () => {
  const today = new Date().toISOString().slice(0, 10);
  const juniorAct = parseUpsertSlotPayload(
    JSON.stringify({
      action: "upsertSlot",
      source: "smartastro",
      generatedAt: "2026-09-01T16:00:00.000Z",
      destinationKey: "juniors-act-classes",
      windowStart: today,
      windowEnd: "2099-12-31",
      scheduleId: 1731,
      className: "Junior ACT!",
      startsAt: `${today}T22:00:00.000Z`,
      endsAt: `${today}T23:00:00.000Z`,
      displayDate: "Today",
      displayTime: "6:00pm - 7:00pm",
      displayPrice: "$115/month with ACT membership",
      isFull: false,
      availableSpots: 10,
      isClosed: true,
      signUpUrl: "https://smartastro.app/calendar?class=1731",
    }),
  );
  const homeschool = parseUpsertSlotPayload(
    JSON.stringify({
      action: "upsertSlot",
      source: "smartastro",
      generatedAt: "2026-09-01T16:00:00.000Z",
      destinationKey: "homeschool-foundations",
      windowStart: today,
      windowEnd: "2099-12-31",
      scheduleId: 1740,
      className: "Homeschool Foundations",
      startsAt: `${today}T17:00:00.000Z`,
      endsAt: `${today}T18:00:00.000Z`,
      displayDate: "Today",
      displayTime: "1:00pm - 2:00pm",
      displayPrice: "Members $25 or $100/month\nNon-members $30",
      isFull: false,
      availableSpots: 8,
      isClosed: false,
      signUpUrl: "https://smartastro.app/calendar?class=1740",
    }),
  );
  const juniorHomeschool = parseUpsertSlotPayload(
    JSON.stringify({
      action: "upsertSlot",
      source: "smartastro",
      generatedAt: "2026-09-01T16:00:00.000Z",
      destinationKey: "junior-homeschool-foundations",
      windowStart: today,
      windowEnd: "2099-12-31",
      scheduleId: 1741,
      className: "Junior Homeschool Foundations",
      startsAt: `${today}T15:45:00.000Z`,
      endsAt: `${today}T16:45:00.000Z`,
      displayDate: "Today",
      displayTime: "11:45am - 12:45pm",
      displayPrice: "$75/month or $15/class",
      isFull: false,
      availableSpots: 10,
      isClosed: false,
      signUpUrl: "https://smartastro.app/calendar?class=1741",
    }),
  );

  assert.equal(upsertManagedSlot(emptyManagedState(), juniorAct).summary.destinationKey, "juniors-act-classes");
  assert.equal(upsertManagedSlot(emptyManagedState(), homeschool).summary.destinationKey, "homeschool-foundations");
  assert.equal(
    upsertManagedSlot(emptyManagedState(), juniorHomeschool).summary.destinationKey,
    "junior-homeschool-foundations",
  );
});

test("rejects cross-table ACT and Homeschool upserts (#5)", () => {
  assert.throws(
    () =>
      parseUpsertSlotPayload(
        JSON.stringify(
          inWindowUpsertBody({
            destinationKey: "silks-act-classes",
            className: "Junior ACT!",
          }),
        ),
      ),
    /Class name does not match destination rules/,
  );
  assert.throws(
    () =>
      parseUpsertSlotPayload(
        JSON.stringify(
          inWindowUpsertBody({
            destinationKey: "juniors-act-classes",
            className: "ACT! Session 1",
          }),
        ),
      ),
    /Class name does not match destination rules/,
  );
  assert.throws(
    () =>
      parseUpsertSlotPayload(
        JSON.stringify(
          inWindowUpsertBody({
            destinationKey: "homeschool-foundations",
            className: "Junior Homeschool Foundations",
          }),
        ),
      ),
    /Class name does not match destination rules/,
  );
});

test("public state manifest includes availability slot ids for discovery", () => {
  const response = publicState(
    {
      slots: {
        1444: { scheduleId: 1444, isFull: true, availableSpots: 0, isClosed: false },
        1511: { scheduleId: 1511, isFull: false, availableSpots: 2, isClosed: false },
      },
      updatedAt: "2026-07-01T15:00:00.000Z",
      generatedAt: "2026-07-01T15:00:00.000Z",
    },
    emptyPopupState(),
    emptyManagedState(),
  );

  assert.deepEqual(response.manifest.scheduleIds, [1444, 1511]);
});

test("replaceWeek rejects retired homepage-silks-week destination (#302)", () => {
  const body = fs.readFileSync(SILKS_WEEK_FIXTURE, "utf8");
  assert.throws(() => parseReplaceWeekPayload(body), /Unknown popup destination key/);
});

test("removedScheduleIds keep in-week popup slots for Class Over (day-after guard)", () => {
  const allClasses = parseReplaceWeekPayload(fs.readFileSync(ALL_CLASSES_FIXTURE, "utf8"));
  const { state: popupState } = mergeReplaceWeek(emptyPopupState(), allClasses);

  // Managed-table stale detection historically shipped these IDs the day after class.
  // In-week popup rows must remain so every dropdown still shows yesterday as Class Over.
  const { state: nextPopupState, removed } = removeSchedulesFromPopupState(popupState, [1468]);
  assert.equal(removed, 0);
  assert.deepEqual(nextPopupState.manifest.byDestination["homepage-all-classes-week"], [1468, 1518]);
});

test("in-week popup IDs are excluded from availability removed tombstones (#3)", () => {
  const allClasses = parseReplaceWeekPayload(fs.readFileSync(ALL_CLASSES_FIXTURE, "utf8"));
  const { state: popupState } = mergeReplaceWeek(emptyPopupState(), allClasses);

  // 1468 is in-week; 1999 is not on the popup at all → still eligible for tombstone.
  assert.deepEqual(excludeInWeekPopupProtectedIds([1468, 1999], popupState), [1999]);

  const mergePayload = {
    source: "smartastro",
    removedScheduleIds: excludeInWeekPopupProtectedIds([1468, 1999], popupState),
    updates: [],
  };
  const { state: merged, summary } = mergeSlotState(null, mergePayload, {
    knownScheduleIds: new Set([1468, 1518, 1999]),
  });
  assert.equal(summary.removed, 1);
  assert.equal(merged.slots["1999"].removed, true);
  assert.equal(merged.slots["1468"], undefined);

  const { state, marked } = markInWeekPopupRemovalsAsClassOver(
    merged,
    [1468, 1999],
    popupState,
  );
  assert.equal(marked, 1);
  assert.equal(state.slots["1468"].hasEnded, true);
  assert.equal(state.slots["1468"].removed, false);
  assert.equal(state.slots["1999"].removed, true);
});

test("in-week popup removals clear prior Class Removed tombstones (#3)", () => {
  const allClasses = parseReplaceWeekPayload(fs.readFileSync(ALL_CLASSES_FIXTURE, "utf8"));
  const { state: popupState } = mergeReplaceWeek(emptyPopupState(), allClasses);
  const prior = {
    source: "smartastro",
    updatedAt: "2026-07-01T12:00:00.000Z",
    slots: {
      1468: {
        scheduleId: 1468,
        removed: true,
        hasEnded: true,
        isFull: false,
        isClosed: false,
        availableSpots: 0,
        signUpUrl: "https://smartastro.app/calendar?class=1468",
      },
    },
  };

  const { state, marked } = markInWeekPopupRemovalsAsClassOver(prior, [1468], popupState);
  assert.equal(marked, 1);
  assert.equal(state.slots["1468"].removed, false);
  assert.equal(state.slots["1468"].hasEnded, true);
});

test("in-week popup removals force Class Over even when update says open (#3)", () => {
  const allClasses = parseReplaceWeekPayload(fs.readFileSync(ALL_CLASSES_FIXTURE, "utf8"));
  const { state: popupState } = mergeReplaceWeek(emptyPopupState(), allClasses);
  const merged = {
    source: "smartastro",
    slots: {
      1468: {
        scheduleId: 1468,
        removed: false,
        hasEnded: false,
        isFull: false,
        isClosed: false,
        availableSpots: 2,
        signUpUrl: "https://smartastro.app/calendar?class=1468",
      },
    },
  };

  const { state, marked } = markInWeekPopupRemovalsAsClassOver(merged, [1468], popupState, {
    updates: [{ scheduleId: 1468, hasEnded: false, availableSpots: 2 }],
  });
  assert.equal(marked, 1);
  assert.equal(state.slots["1468"].hasEnded, true);
  assert.equal(state.slots["1468"].removed, false);
  assert.equal(state.slots["1468"].isFull, false);
});

test("removedScheduleIds purge popup slots outside the published week (#278)", () => {
  const allClasses = parseReplaceWeekPayload(fs.readFileSync(ALL_CLASSES_FIXTURE, "utf8"));
  const { state: popupState } = mergeReplaceWeek(emptyPopupState(), allClasses);
  const destination = popupState.destinations["homepage-all-classes-week"];
  destination.slots.push({
    ...destination.slots[0],
    scheduleId: 1999,
    startsAt: "2026-06-20T17:30:00.000Z",
    endsAt: "2026-06-20T18:30:00.000Z",
    displayTime: "Sat Jun 20 · 1:30–2:30pm",
  });
  popupState.manifest = buildManifest(popupState.destinations);

  const { state: nextPopupState, removed } = removeSchedulesFromPopupState(popupState, [1999, 1468]);
  assert.equal(removed, 1);
  assert.deepEqual(nextPopupState.manifest.byDestination["homepage-all-classes-week"], [1468, 1518]);
});

test("removedScheduleIds purge managed table slots (#278)", () => {
  const upsertPayload = parseInWindowUpsert();
  const { state: managedState } = upsertManagedSlot(emptyManagedState(), upsertPayload);

  const { state: nextManagedState, removed } = removeSchedulesFromManagedState(managedState, [1600]);
  assert.equal(removed, 1);
  assert.equal(nextManagedState.destinations["silks-foundations"].slots.length, 0);
});

test("purgeOutOfWindowManagedSlots drops rows outside the published window (#278)", () => {
  const upsertPayload = parseInWindowUpsert();
  const { state: managedState } = upsertManagedSlot(emptyManagedState(), upsertPayload);

  const staleSlot = {
    ...managedState.destinations["silks-foundations"].slots[0],
    scheduleId: 1700,
    startsAt: "2020-05-01T21:30:00.000Z",
    endsAt: "2020-05-01T22:30:00.000Z",
  };
  managedState.destinations["silks-foundations"].slots.push(staleSlot);
  managedState.manifest = buildManagedManifest(managedState.destinations);

  const { state: purgedState, purged } = purgeOutOfWindowManagedSlots(managedState);
  assert.equal(purged, 1);
  assert.deepEqual(
    purgedState.destinations["silks-foundations"].slots.map((slot) => slot.scheduleId),
    [1600],
  );
});

test("index.html wires homepage popup destinations (#302)", () => {
  const indexHtml = fs.readFileSync(path.join(PROJECT_ROOT, "index.html"), "utf8");
  assert.match(indexHtml, /data-smartastro-popup-destination="homepage-all-classes-week"/);
  assert.match(indexHtml, /data-smartastro-popup-destination="homepage-lyra"/);
  assert.doesNotMatch(indexHtml, /data-smartastro-popup-destination="homepage-silks-week"/);
});

test("upsertSlot never shrinks stored managed destination window (#280)", () => {
  const first = parseInWindowUpsert({ windowEnd: "2099-08-09" });
  const { state: afterFirst } = upsertManagedSlot(emptyManagedState(), first);
  const storedStart = afterFirst.destinations["silks-foundations"].windowStart;
  const storedEnd = afterFirst.destinations["silks-foundations"].windowEnd;

  const second = parseInWindowUpsert({
    windowStart: "2020-06-29",
    windowEnd: "2020-07-20",
  });
  const { state: afterSecond } = upsertManagedSlot(afterFirst, second);

  const destination = afterSecond.destinations["silks-foundations"];
  assert.equal(destination.windowStart, storedStart);
  assert.equal(destination.windowEnd, storedEnd);
});
