import handlerModule from "./lib/contact-form.js";

const { handleContactForm, clientIpFromHeaders, createRateLimiter } = handlerModule;

const MAX_BODY_BYTES = 32 * 1024;
const rateLimiter = createRateLimiter();

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

export default async function contactForm(request) {
  if (request.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const bodyResult = await readBodyWithLimit(request);
  if (bodyResult.tooLarge) {
    return jsonResponse(413, { error: "Form submission is too large" });
  }

  let payload;
  try {
    payload = bodyResult.body ? JSON.parse(bodyResult.body) : {};
  } catch {
    return jsonResponse(400, { error: "Invalid form submission" });
  }

  const headers = Object.fromEntries(request.headers.entries());
  const result = await handleContactForm(payload, {
    ip: clientIpFromHeaders(headers),
    rateLimiter,
  });

  return new Response(result.body, {
    status: result.statusCode,
    headers: result.headers,
  });
}
