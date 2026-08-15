const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { pathToFileURL } = require("node:url");

const HANDLER_PATH = path.resolve(
  __dirname,
  "../netlify/functions/lib/smartastro-availability-handler.js",
);
const WRAPPER_PATH = path.resolve(
  __dirname,
  "../netlify/functions/smartastro-availability.mjs",
);
const LEGACY_ENTRY_PATH = path.resolve(
  __dirname,
  "../netlify/functions/smartastro-availability.js",
);
const { handleSmartAstroAvailability } = require(HANDLER_PATH);

function createMockStore() {
  return {
    get: async () => null,
    setJSON: async () => {},
  };
}

test("Functions 2.0 wrapper requests a strongly consistent Blob store (#9)", () => {
  const source = fs.readFileSync(WRAPPER_PATH, "utf8");

  assert.match(source, /export default async function smartAstroAvailability/);
  assert.match(source, /getStore\(STORE_NAME, \{ consistency: "strong" \}\)/);
  assert.doesNotMatch(source, /connectLambda/);
  assert.equal(fs.existsSync(LEGACY_ENTRY_PATH), false, "legacy Lambda entry must not shadow wrapper");
});

test("Functions 2.0 wrapper limits request bodies before buffering", async () => {
  const { readBodyWithLimit } = await import(pathToFileURL(WRAPPER_PATH).href);
  const accepted = await readBodyWithLimit(
    new Request("https://duckinggravity.com/api/smartastro-availability", {
      method: "POST",
      body: "1234",
    }),
    4,
  );
  const rejected = await readBodyWithLimit(
    new Request("https://duckinggravity.com/api/smartastro-availability", {
      method: "POST",
      body: "12345",
    }),
    4,
  );

  assert.deepEqual(accepted, { body: "1234", tooLarge: false });
  assert.deepEqual(rejected, { body: "", tooLarge: true });
});

test("handler checks POST configuration before using stored state", async () => {
  const mockStore = createMockStore();

  const event = {
    httpMethod: "POST",
    headers: {},
    body: "{}",
    isBase64Encoded: false,
  };

  const response = await handleSmartAstroAvailability(event, mockStore);

  assert.equal(response.statusCode, 503);
});

test("handler applies availability batch using payload schedule IDs", async () => {
  const stored = { slots: {} };
  const mockStore = {
    get: async (key) => {
      if (key === "class-slots") return stored;
      return null;
    },
    setJSON: async (key, value) => {
      if (key === "class-slots") Object.assign(stored, value);
    },
  };

  const availabilityLib = require("../netlify/functions/lib/smartastro-availability");
  const timestamp = new Date().toISOString();
  const body = JSON.stringify({
    source: "smartastro",
    generatedAt: timestamp,
    updates: [{ scheduleId: 1444, isFull: true, availableSpots: 0, isClosed: false }],
  });

  const previousSecret = process.env.MARKETING_SYNC_SHARED_SECRET;
  process.env.MARKETING_SYNC_SHARED_SECRET = "test-secret";

  try {
    const response = await handleSmartAstroAvailability(
      {
        httpMethod: "POST",
        headers: {
          "x-smartastro-timestamp": timestamp,
          "x-smartastro-signature": availabilityLib.createSignature("test-secret", timestamp, body),
        },
        body,
        isBase64Encoded: false,
      },
      mockStore,
    );

    assert.equal(response.statusCode, 200);
    assert.equal(stored.slots["1444"].isFull, true);
  } finally {
    if (previousSecret === undefined) {
      delete process.env.MARKETING_SYNC_SHARED_SECRET;
    } else {
      process.env.MARKETING_SYNC_SHARED_SECRET = previousSecret;
    }
  }
});

test("strong Blob reads retain rapid managed upserts across destinations (#9)", async () => {
  const stored = new Map();
  const strongStore = {
    get: async (key) => {
      const value = stored.get(key);
      return value === undefined ? null : structuredClone(value);
    },
    setJSON: async (key, value) => {
      stored.set(key, structuredClone(value));
      return { modified: true };
    },
  };

  const availabilityLib = require("../netlify/functions/lib/smartastro-availability");
  const previousSecret = process.env.MARKETING_SYNC_SHARED_SECRET;
  process.env.MARKETING_SYNC_SHARED_SECRET = "test-secret";
  const schedules = [
    ["homeschool-foundations", "Homeschool Foundations", 1740, "2026-09-01", false],
    ["homeschool-foundations", "Homeschool Foundations", 1739, "2026-09-08", false],
    ["homeschool-foundations", "Homeschool Foundations", 1743, "2026-09-15", false],
    ["homeschool-foundations", "Homeschool Foundations", 1741, "2026-09-22", false],
    ["junior-homeschool-foundations", "Junior Homeschool Foundations", 1736, "2026-09-03", false],
    ["junior-homeschool-foundations", "Junior Homeschool Foundations", 1738, "2026-09-10", false],
    ["junior-homeschool-foundations", "Junior Homeschool Foundations", 1735, "2026-09-17", false],
    ["junior-homeschool-foundations", "Junior Homeschool Foundations", 1737, "2026-09-24", false],
    ["juniors-act-classes", "Junior ACT!", 1731, "2026-09-02", true],
    ["juniors-act-classes", "Junior ACT!", 1732, "2026-09-09", true],
    ["juniors-act-classes", "Junior ACT!", 1734, "2026-09-23", true],
  ];

  try {
    for (const [destinationKey, className, scheduleId, date, isClosed] of schedules) {
      const timestamp = new Date().toISOString();
      const body = JSON.stringify({
        action: "upsertSlot",
        source: "smartastro",
        generatedAt: timestamp,
        destinationKey,
        windowStart: "2026-08-15",
        windowEnd: "2026-09-25",
        scheduleId,
        className,
        startsAt: `${date}T18:00:00.000Z`,
        endsAt: `${date}T19:00:00.000Z`,
        displayDate: date,
        displayTime: "2:00pm - 3:00pm",
        displayPrice: "$15/class",
        isFull: false,
        availableSpots: 8,
        isClosed,
        hasEnded: false,
        signUpUrl: `https://smartastro.app/calendar?class=${scheduleId}`,
      });
      const response = await handleSmartAstroAvailability(
        {
          httpMethod: "POST",
          headers: {
            "x-smartastro-timestamp": timestamp,
            "x-smartastro-signature": availabilityLib.createSignature("test-secret", timestamp, body),
            "x-smartastro-idempotency-key": `test-upsert-${destinationKey}-${scheduleId}`,
          },
          body,
          isBase64Encoded: false,
        },
        strongStore,
      );
      assert.equal(response.statusCode, 200, response.body);
    }

    const managed = stored.get("managed-slots");
    assert.deepEqual(
      managed.destinations["homeschool-foundations"].slots.map((slot) => slot.scheduleId),
      [1740, 1739, 1743, 1741],
    );
    assert.deepEqual(
      managed.destinations["junior-homeschool-foundations"].slots.map((slot) => slot.scheduleId),
      [1736, 1738, 1735, 1737],
    );
    assert.deepEqual(
      managed.destinations["juniors-act-classes"].slots.map((slot) => slot.scheduleId),
      [1731, 1732, 1734],
    );
    assert.ok(
      managed.destinations["juniors-act-classes"].slots.every((slot) => slot.isClosed),
    );
  } finally {
    if (previousSecret === undefined) {
      delete process.env.MARKETING_SYNC_SHARED_SECRET;
    } else {
      process.env.MARKETING_SYNC_SHARED_SECRET = previousSecret;
    }
  }
});
