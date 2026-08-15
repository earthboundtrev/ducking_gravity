import { getStore } from "@netlify/blobs";
import handlerModule from "./lib/smartastro-availability-handler.js";

const { handleSmartAstroAvailability } = handlerModule;
const STORE_NAME = "smartastro-availability";
const MAX_BODY_BYTES = 1024 * 1024;

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export async function readBodyWithLimit(request, maxBytes = MAX_BODY_BYTES) {
  if (!request.body) return { body: "", tooLarge: false };

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let body = "";
  let bytesRead = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytesRead += value.byteLength;
    if (bytesRead > maxBytes) {
      await reader.cancel();
      return { body: "", tooLarge: true };
    }
    body += decoder.decode(value, { stream: true });
  }

  body += decoder.decode();
  return { body, tooLarge: false };
}

function toLegacyEvent(request, body) {
  return {
    httpMethod: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body,
    isBase64Encoded: false,
  };
}

export default async function smartAstroAvailability(request) {
  // This endpoint performs whole-blob read/merge/write mutations. Functions 2.0
  // supplies the uncached Blob endpoint required for strong read-after-write
  // consistency; Lambda compatibility mode does not.
  const store = getStore(STORE_NAME, { consistency: "strong" });
  if (request.method === "POST" && !process.env.MARKETING_SYNC_SHARED_SECRET) {
    return jsonResponse(503, { error: "SmartAstro availability sync is not configured" });
  }

  const bodyResult =
    request.method === "GET" ? { body: "", tooLarge: false } : await readBodyWithLimit(request);
  if (bodyResult.tooLarge) {
    return jsonResponse(413, { error: "SmartAstro sync payload is too large" });
  }

  const body = bodyResult.body;
  const result = await handleSmartAstroAvailability(toLegacyEvent(request, body), store);

  return new Response(result.body, {
    status: result.statusCode,
    headers: result.headers,
  });
}
