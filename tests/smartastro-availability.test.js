const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const {
  createSignature,
  mergeSlotState,
  parsePayload,
  validateTimestamp,
  verifySignature,
} = require("../netlify/functions/lib/smartastro-availability");

const PROJECT_ROOT = path.resolve(__dirname, "..");

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
