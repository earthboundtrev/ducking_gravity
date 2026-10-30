"use strict";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
const MAX_NAME = 80;
const MAX_EMAIL = 254;
const MAX_PHONE = 40;
const MAX_SUBJECT = 200;
const MAX_MESSAGE = 5000;
const VALID_SOURCES = new Set(["contact", "birthday"]);
const DEFAULT_INBOX = "duckinggravity@gmail.com";

function jsonHeaders() {
  return {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };
}

function result(statusCode, body) {
  return {
    statusCode,
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  };
}

function trimString(value, max) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripHeaderNewlines(value) {
  return String(value).replace(/[\r\n]+/g, " ").trim();
}

function createRateLimiter({ windowMs = 10 * 60 * 1000, maxHits = 8 } = {}) {
  const hits = new Map();
  return {
    isLimited(key, now = Date.now()) {
      if (!key) return false;
      const entry = hits.get(key);
      if (!entry || now >= entry.resetAt) {
        hits.set(key, { count: 1, resetAt: now + windowMs });
        return false;
      }
      entry.count += 1;
      return entry.count > maxHits;
    },
  };
}

function parseFormPayload(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { error: "Invalid form submission" };
  }

  const firstName = trimString(raw.firstName, MAX_NAME);
  const lastName = trimString(raw.lastName, MAX_NAME);
  const email = trimString(raw.email, MAX_EMAIL);
  const phone = trimString(raw.phone, MAX_PHONE);
  const subject = trimString(raw.subject, MAX_SUBJECT);
  const message = trimString(raw.message, MAX_MESSAGE);
  const recaptchaToken = typeof raw.recaptchaToken === "string" ? raw.recaptchaToken.trim() : "";
  const source = VALID_SOURCES.has(raw.source) ? raw.source : "contact";

  if (firstName.length < 2 || lastName.length < 2) {
    return { error: "Invalid form submission" };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: "Invalid form submission" };
  }
  if (!PHONE_RE.test(phone)) {
    return { error: "Invalid form submission" };
  }
  if (!subject || !message) {
    return { error: "Invalid form submission" };
  }
  if (!recaptchaToken) {
    return { error: "Invalid form submission" };
  }

  return {
    fields: {
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
      recaptchaToken,
      source,
    },
  };
}

function buildEmail(fields, inbox, fromAddress) {
  const fullName = `${fields.firstName} ${fields.lastName}`;
  const prefix = fields.source === "birthday" ? "Birthday party inquiry" : "Website inquiry";
  const subject = stripHeaderNewlines(`${prefix}: ${fields.subject}`);
  const text = [
    `From: ${fullName}`,
    `Email: ${fields.email}`,
    `Phone: ${fields.phone}`,
    `Source: ${fields.source}`,
    "",
    fields.message,
  ].join("\n");

  const html = [
    `<p><strong>From:</strong> ${escapeHtml(fullName)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(fields.email)}</p>`,
    `<p><strong>Phone:</strong> ${escapeHtml(fields.phone)}</p>`,
    `<p><strong>Source:</strong> ${escapeHtml(fields.source)}</p>`,
    `<p>${escapeHtml(fields.message).replace(/\n/g, "<br>")}</p>`,
  ].join("");

  return {
    from: fromAddress,
    to: [inbox],
    reply_to: fields.email,
    subject,
    text,
    html,
  };
}

async function defaultVerifyCaptcha(token, secret, fetchImpl) {
  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  const response = await fetchImpl("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) return false;
  const data = await response.json();
  return Boolean(data && data.success);
}

async function defaultSendResendEmail(payload, apiKey, fetchImpl) {
  const response = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = new Error("Resend request failed");
    error.status = response.status;
    throw error;
  }
  return { ok: true };
}

function clientIpFromHeaders(headers) {
  if (!headers) return "";
  const nf = headers["x-nf-client-connection-ip"] || headers["X-NF-Client-Connection-Ip"];
  if (nf) return String(nf).split(",")[0].trim();
  const forwarded = headers["x-forwarded-for"] || headers["X-Forwarded-For"];
  if (forwarded) return String(forwarded).split(",")[0].trim();
  return "";
}

async function handleContactForm(rawPayload, options = {}) {
  const env = options.env || process.env;
  const fetchImpl = options.fetchImpl || fetch;
  const log = options.log || function () {};
  const now = typeof options.now === "number" ? options.now : Date.now();
  const ip = options.ip || "";
  const rateLimiter = options.rateLimiter;

  const recaptchaSecret = env.RECAPTCHA_SECRET_KEY;
  const resendKey = env.RESEND_API_KEY;
  const fromAddress = env.RESEND_FROM;
  const inbox = env.CONTACT_INBOX || DEFAULT_INBOX;

  if (!recaptchaSecret || !resendKey || !fromAddress) {
    return result(503, { error: "Contact form is not configured" });
  }

  if (rateLimiter && rateLimiter.isLimited(ip, now)) {
    return result(429, { error: "Too many requests. Please try again later." });
  }

  const parsed = parseFormPayload(rawPayload);
  if (parsed.error) {
    return result(400, { error: parsed.error });
  }

  const verifyCaptcha = options.verifyCaptcha || defaultVerifyCaptcha;
  let captchaOk = false;
  try {
    captchaOk = await verifyCaptcha(parsed.fields.recaptchaToken, recaptchaSecret, fetchImpl);
  } catch (_err) {
    log("contact-form captcha verify failed");
    return result(400, { error: "Verification failed" });
  }
  if (!captchaOk) {
    return result(400, { error: "Verification failed" });
  }

  const emailPayload = buildEmail(parsed.fields, inbox, fromAddress);
  const sendResendEmail = options.sendResendEmail || defaultSendResendEmail;
  try {
    await sendResendEmail(emailPayload, resendKey, fetchImpl);
  } catch (err) {
    log("contact-form send failed", { status: err && err.status });
    return result(502, { error: "Unable to send message" });
  }

  return result(200, { ok: true });
}

module.exports = {
  DEFAULT_INBOX,
  buildEmail,
  clientIpFromHeaders,
  createRateLimiter,
  handleContactForm,
  parseFormPayload,
};
