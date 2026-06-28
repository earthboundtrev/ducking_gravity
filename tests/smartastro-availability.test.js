const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const {
  createSignature,
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
  mergeKnownScheduleIds,
  mergeReplaceWeek,
  parseReplaceWeekPayload,
} = require("../netlify/functions/lib/smartastro-popup-rollover");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const ALL_CLASSES_FIXTURE = path.join(
  PROJECT_ROOT,
  "tests/fixtures/replace-week-all-classes.json",
);
const NEXT_WEEK_FIXTURE = path.join(
  PROJECT_ROOT,
  "tests/fixtures/replace-week-next-week.json",
);

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
  assert.match(html, /data-smartastro-popup-destination="homepage-silks-week"/);
  assert.match(html, /data-smartastro-popup-destination="homepage-lyra"/);

  const summerCampSlide = html.match(
    /<div class="popup-carousel-slide active" data-slide="0">[\s\S]*?<\/div>\s*<!-- Slide 2:/,
  );
  assert.ok(summerCampSlide, "expected summer camp slide markup");
  assert.doesNotMatch(summerCampSlide[0], /data-smartastro-popup-destination=/);
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
  const knownScheduleIds = resolveKnownScheduleIds(popupState);

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
  const response = publicState({ slots: {}, updatedAt: null, generatedAt: null }, popupState);

  assert.ok(response.popups.destinations["homepage-all-classes-week"]);
  assert.deepEqual(response.manifest.scheduleIds, [1468, 1518]);
});

test("static homepage schedule IDs remain registered without popup state", () => {
  const known = resolveKnownScheduleIds(emptyPopupState());
  for (const id of STATIC_KNOWN_SCHEDULE_IDS) {
    assert.ok(known.has(id));
  }
});

test("buildManifest aggregates ids across destinations", () => {
  const destinations = {
    "homepage-all-classes-week": {
      slots: [{ scheduleId: 10 }, { scheduleId: 11 }],
    },
    "homepage-silks-week": {
      slots: [{ scheduleId: 11 }, { scheduleId: 12 }],
    },
  };

  const manifest = buildManifest(destinations);
  assert.deepEqual(manifest.scheduleIds, [10, 11, 12]);
  assert.deepEqual(manifest.byDestination["homepage-silks-week"], [11, 12]);
});

test("mergeKnownScheduleIds unions static and popup ids", () => {
  const popupState = {
    manifest: { scheduleIds: [42, 1468] },
  };
  const merged = mergeKnownScheduleIds(STATIC_KNOWN_SCHEDULE_IDS, popupState);
  assert.ok(merged.has(42));
  assert.ok(merged.has(1440));
});
