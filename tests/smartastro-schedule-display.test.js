const test = require("node:test");
const assert = require("node:assert/strict");
const {
  formatWeekPopupSlotDisplayTime,
  formatNaiveTimeRangeForTable,
  toYmdFromNaiveIsoDateTime,
} = require("../netlify/functions/lib/smartastro-schedule-display");
const { parseReplaceWeekPayload } = require("../netlify/functions/lib/smartastro-popup-rollover");
const { parseUpsertSlotPayload } = require("../netlify/functions/lib/smartastro-managed-destinations");
const fs = require("node:fs");
const path = require("node:path");

const PROJECT_ROOT = path.join(__dirname, "..");

test("formatWeekPopupSlotDisplayTime uses naive wall clock (#292)", () => {
  const start = new Date("2026-06-30T18:45:00.000Z");
  const end = new Date("2026-06-30T19:45:00.000Z");
  assert.equal(formatWeekPopupSlotDisplayTime(start, end), "Tue Jun 30 · 6:45–7:45pm");
});

test("formatNaiveTimeRangeForTable uses naive wall clock (#292)", () => {
  const start = new Date("2026-07-07T17:30:00.000Z");
  const end = new Date("2026-07-07T18:30:00.000Z");
  assert.equal(formatNaiveTimeRangeForTable(start, end), "5:30pm - 6:30pm");
});

test("toYmdFromNaiveIsoDateTime does not apply timezone shift (#292)", () => {
  assert.equal(toYmdFromNaiveIsoDateTime("2026-07-07T21:30:00.000Z"), "2026-07-07");
});

test("replaceWeek overrides shifted displayTime when startsAt is present (#292)", () => {
  const body = fs.readFileSync(
    path.join(PROJECT_ROOT, "tests/fixtures/replace-week-all-classes.json"),
    "utf8",
  );
  const payload = parseReplaceWeekPayload(body);
  assert.equal(payload.slots[0].displayTime, "Tue Jun 30 · 5:30–6:30pm");
  assert.equal(payload.slots[1].displayTime, "Thu Jul 2 · 8:00–9:00pm");
});

test("replaceWeek rejects retired homepage-silks-week destination (#302)", () => {
  const body = fs.readFileSync(
    path.join(PROJECT_ROOT, "tests/fixtures/replace-week-silks-week.json"),
    "utf8",
  );
  assert.throws(() => parseReplaceWeekPayload(body), /Unknown popup destination key/);
});

test("upsertSlot derives table displayTime from startsAt (#292)", () => {
  const body = fs.readFileSync(
    path.join(PROJECT_ROOT, "tests/fixtures/upsert-slot-silks-foundations.json"),
    "utf8",
  );
  const payload = parseUpsertSlotPayload(body);
  assert.equal(payload.slot.displayTime, "5:30pm - 6:30pm");
});
