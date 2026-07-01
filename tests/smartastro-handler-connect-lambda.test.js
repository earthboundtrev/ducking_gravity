const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const HANDLER_PATH = path.resolve(
  __dirname,
  "../netlify/functions/smartastro-availability.js",
);
const BLOBS_PATH = require.resolve("@netlify/blobs");

function createMockStore() {
  return {
    get: async () => null,
    setJSON: async () => {},
  };
}

function loadHandlerWithBlobMocks(blobMocks) {
  const previousBlobsEntry = require.cache[BLOBS_PATH];
  const previousHandlerEntry = require.cache[HANDLER_PATH];

  require.cache[BLOBS_PATH] = {
    id: BLOBS_PATH,
    filename: BLOBS_PATH,
    loaded: true,
    exports: blobMocks,
  };
  delete require.cache[HANDLER_PATH];

  try {
    return require(HANDLER_PATH);
  } finally {
    if (previousHandlerEntry) {
      require.cache[HANDLER_PATH] = previousHandlerEntry;
    } else {
      delete require.cache[HANDLER_PATH];
    }

    if (previousBlobsEntry) {
      require.cache[BLOBS_PATH] = previousBlobsEntry;
    } else {
      delete require.cache[BLOBS_PATH];
    }
  }
}

test("handler calls connectLambda with the Lambda event before getStore", async () => {
  const calls = { connectLambda: [], getStore: [] };
  const mockStore = createMockStore();

  const { handler } = loadHandlerWithBlobMocks({
    connectLambda: (event) => {
      calls.connectLambda.push(event);
    },
    getStore: (name) => {
      calls.getStore.push(name);
      return mockStore;
    },
  });

  const event = {
    httpMethod: "GET",
    headers: {},
  };

  const response = await handler(event);

  assert.equal(response.statusCode, 200);
  assert.equal(calls.connectLambda.length, 1);
  assert.equal(calls.getStore.length, 1);
  assert.equal(calls.connectLambda[0], event);
  assert.equal(calls.getStore[0], "smartastro-availability");
});

test("handler calls connectLambda before POST auth checks use the blob store", async () => {
  const callOrder = [];
  const mockStore = createMockStore();

  const { handler } = loadHandlerWithBlobMocks({
    connectLambda: (event) => {
      callOrder.push({ step: "connectLambda", method: event.httpMethod });
    },
    getStore: (name) => {
      callOrder.push({ step: "getStore", name });
      return mockStore;
    },
  });

  const event = {
    httpMethod: "POST",
    headers: {},
    body: "{}",
    isBase64Encoded: false,
  };

  const response = await handler(event);

  assert.equal(callOrder[0]?.step, "connectLambda");
  assert.equal(callOrder[1]?.step, "getStore");
  assert.equal(response.statusCode, 503);
});

test("handler applies availability batch using payload schedule IDs", async () => {
  const calls = { connectLambda: [], getStore: [] };
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

  const { handler } = loadHandlerWithBlobMocks({
    connectLambda: (event) => calls.connectLambda.push(event),
    getStore: (name) => {
      calls.getStore.push(name);
      return mockStore;
    },
  });

  try {
    const response = await handler({
      httpMethod: "POST",
      headers: {
        "x-smartastro-timestamp": timestamp,
        "x-smartastro-signature": availabilityLib.createSignature("test-secret", timestamp, body),
      },
      body,
      isBase64Encoded: false,
    });

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

test("handler source initializes Netlify Blobs for Lambda compatibility mode", () => {
  const source = fs.readFileSync(HANDLER_PATH, "utf8");

  assert.match(source, /connectLambda/);
  assert.match(source, /connectLambda\(event\)/);

  const handlerStart = source.indexOf("exports.handler");
  const connectIndex = source.indexOf("connectLambda(event)", handlerStart);
  const getStoreIndex = source.indexOf("getStore(STORE_NAME)", handlerStart);

  assert.ok(handlerStart >= 0, "expected exports.handler");
  assert.ok(connectIndex > handlerStart, "connectLambda should be inside the handler");
  assert.ok(getStoreIndex > connectIndex, "getStore should run after connectLambda");
});
