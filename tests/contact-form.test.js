const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { pathToFileURL } = require("node:url");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const {
  DEFAULT_INBOX,
  buildEmail,
  clientIpFromHeaders,
  createRateLimiter,
  handleContactForm,
  parseFormPayload,
} = require("../netlify/functions/lib/contact-form.js");
const client = require("../js/contact-form.js");

const WRAPPER_PATH = path.resolve(__dirname, "../netlify/functions/contact-form.mjs");

const VALID_PAYLOAD = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  phone: "540-555-0100",
  subject: "Class question",
  message: "Do you have an evening silks class?",
  recaptchaToken: "test-token",
  source: "contact",
};

const CONFIGURED_ENV = {
  RECAPTCHA_SECRET_KEY: "recaptcha-test-secret",
  RESEND_API_KEY: "re_test_key_do_not_leak",
  RESEND_FROM: "Ducking Gravity <forms@duckinggravity.com>",
  CONTACT_INBOX: "duckinggravity@gmail.com",
};

function parseBody(response) {
  return JSON.parse(response.body);
}

test("parseFormPayload accepts the public contact fields (#20)", () => {
  const parsed = parseFormPayload(VALID_PAYLOAD);
  assert.deepEqual(parsed.fields, VALID_PAYLOAD);
});

test("parseFormPayload rejects missing or invalid fields (#20)", () => {
  assert.equal(parseFormPayload(null).error, "Invalid form submission");
  assert.equal(parseFormPayload({ ...VALID_PAYLOAD, email: "not-an-email" }).error, "Invalid form submission");
  assert.equal(parseFormPayload({ ...VALID_PAYLOAD, recaptchaToken: "" }).error, "Invalid form submission");
  assert.equal(parseFormPayload({ ...VALID_PAYLOAD, firstName: "A" }).error, "Invalid form submission");
});

test("handleContactForm returns 503 without secrets and does not leak them (#20)", async () => {
  const logs = [];
  const sendCalls = [];
  const response = await handleContactForm(VALID_PAYLOAD, {
    env: {},
    log: (...args) => logs.push(args),
    sendResendEmail: async (payload) => {
      sendCalls.push(payload);
    },
    verifyCaptcha: async () => true,
  });

  assert.equal(response.statusCode, 503);
  const body = parseBody(response);
  assert.equal(body.error, "Contact form is not configured");
  assert.doesNotMatch(response.body, /re_test_key|recaptcha-test-secret|RESEND_API_KEY/);
  assert.equal(sendCalls.length, 0);
});

test("handleContactForm rejects captcha failure without calling Resend (#20)", async () => {
  const sendCalls = [];
  const response = await handleContactForm(VALID_PAYLOAD, {
    env: CONFIGURED_ENV,
    verifyCaptcha: async () => false,
    sendResendEmail: async (payload) => {
      sendCalls.push(payload);
    },
  });

  assert.equal(response.statusCode, 400);
  assert.equal(parseBody(response).error, "Verification failed");
  assert.equal(sendCalls.length, 0);
  assert.doesNotMatch(response.body, /re_test_key_do_not_leak|recaptcha-test-secret/);
});

test("handleContactForm happy path sends Reply-To mail via Resend (#20)", async () => {
  let sent;
  const response = await handleContactForm(
    { ...VALID_PAYLOAD, source: "birthday" },
    {
      env: CONFIGURED_ENV,
      verifyCaptcha: async (token, secret) => token === "test-token" && secret === CONFIGURED_ENV.RECAPTCHA_SECRET_KEY,
      sendResendEmail: async (payload, apiKey) => {
        sent = { payload, apiKey };
      },
    },
  );

  assert.equal(response.statusCode, 200);
  assert.deepEqual(parseBody(response), { ok: true });
  assert.equal(sent.apiKey, CONFIGURED_ENV.RESEND_API_KEY);
  assert.equal(sent.payload.reply_to, "ada@example.com");
  assert.deepEqual(sent.payload.to, [DEFAULT_INBOX]);
  assert.equal(sent.payload.from, CONFIGURED_ENV.RESEND_FROM);
  assert.match(sent.payload.subject, /^Birthday party inquiry: Class question$/);
  assert.match(sent.payload.text, /Do you have an evening silks class\?/);
  assert.doesNotMatch(response.body, /re_test_key_do_not_leak/);
});

test("buildEmail escapes HTML in visitor fields (#20)", () => {
  const email = buildEmail(
    {
      ...VALID_PAYLOAD,
      firstName: "<script>alert(1)</script>",
      message: "Hello <b>there</b>",
    },
    DEFAULT_INBOX,
    CONFIGURED_ENV.RESEND_FROM,
  );
  assert.match(email.html, /&lt;script&gt;/);
  assert.doesNotMatch(email.html, /<script>alert/);
});

test("handleContactForm logs omit message bodies and API keys (#20)", async () => {
  const logs = [];
  await handleContactForm(VALID_PAYLOAD, {
    env: CONFIGURED_ENV,
    verifyCaptcha: async () => true,
    sendResendEmail: async () => {
      const error = new Error("Resend request failed");
      error.status = 500;
      throw error;
    },
    log: (...args) => logs.push(JSON.stringify(args)),
  });
  const dumped = logs.join(" ");
  assert.doesNotMatch(dumped, /Do you have an evening silks class/);
  assert.doesNotMatch(dumped, /re_test_key_do_not_leak/);
  assert.doesNotMatch(dumped, /recaptcha-test-secret/);
});

test("handleContactForm rate-limits repeat posts from the same IP (#20)", async () => {
  const limiter = createRateLimiter({ windowMs: 60_000, maxHits: 2 });
  const options = {
    env: CONFIGURED_ENV,
    ip: "203.0.113.9",
    rateLimiter: limiter,
    now: 1_000,
    verifyCaptcha: async () => true,
    sendResendEmail: async () => ({ ok: true }),
  };

  assert.equal((await handleContactForm(VALID_PAYLOAD, options)).statusCode, 200);
  assert.equal((await handleContactForm(VALID_PAYLOAD, options)).statusCode, 200);
  const limited = await handleContactForm(VALID_PAYLOAD, options);
  assert.equal(limited.statusCode, 429);
});

test("clientIpFromHeaders prefers Netlify connection IP (#20)", () => {
  assert.equal(
    clientIpFromHeaders({
      "x-nf-client-connection-ip": "198.51.100.4",
      "x-forwarded-for": "203.0.113.8, 198.51.100.4",
    }),
    "198.51.100.4",
  );
});

test("contact-form wrapper limits request bodies before buffering (#20)", async () => {
  const { readBodyWithLimit } = await import(pathToFileURL(WRAPPER_PATH).href);
  const accepted = await readBodyWithLimit(
    new Request("https://duckinggravity.com/api/contact", { method: "POST", body: "1234" }),
    4,
  );
  const rejected = await readBodyWithLimit(
    new Request("https://duckinggravity.com/api/contact", { method: "POST", body: "12345" }),
    4,
  );
  assert.deepEqual(accepted, { body: "1234", tooLarge: false });
  assert.deepEqual(rejected, { body: "", tooLarge: true });
});

test("shared client helper validates the same visitor fields (#20)", () => {
  assert.equal(client.validateName("Ada"), true);
  assert.equal(client.validateEmail("ada@example.com"), true);
  assert.equal(client.validatePhone("540-555-0100"), true);
  assert.equal(client.validatePhone("nope"), false);
});

test("shared client resets reCAPTCHA after send success or failure (#20)", () => {
  const source = fs.readFileSync(path.join(PROJECT_ROOT, "js/contact-form.js"), "utf8");
  assert.match(source, /finally \{\s*resetRecaptcha\(\);/);
});

test("form pages post through the shared helper and drop EmailJS (#20)", () => {
  const pages = ["index.html", "birthday.html", "birthday-parties.html"];
  for (const fileName of pages) {
    const html = fs.readFileSync(path.join(PROJECT_ROOT, fileName), "utf8");
    assert.match(html, /js\/contact-form\.js/);
    assert.match(html, /id="contact-form"/);
    assert.doesNotMatch(html, /@emailjs\/browser/);
    assert.doesNotMatch(html, /emailjs\.send/);
    assert.doesNotMatch(html, /EMAILJS_PUBLIC_KEY/);
    assert.doesNotMatch(html, /EMAILJS_SERVICE_ID/);
    assert.doesNotMatch(html, /EMAILJS_TEMPLATE_ID/);
    assert.match(html, /g-recaptcha/);
    assert.match(html, /www\.google\.com\/recaptcha\/api\.js/);
  }

  const indexHtml = fs.readFileSync(path.join(PROJECT_ROOT, "index.html"), "utf8");
  const birthdayHtml = fs.readFileSync(path.join(PROJECT_ROOT, "birthday.html"), "utf8");
  const partiesHtml = fs.readFileSync(path.join(PROJECT_ROOT, "birthday-parties.html"), "utf8");
  assert.match(indexHtml, /data-contact-source="contact"/);
  assert.match(birthdayHtml, /data-contact-source="birthday"/);
  assert.match(partiesHtml, /data-contact-source="birthday"/);
});

test("EmailJS build injection is gone from Netlify config (#20)", () => {
  const netlifyToml = fs.readFileSync(path.join(PROJECT_ROOT, "netlify.toml"), "utf8");
  const envExample = fs.readFileSync(path.join(PROJECT_ROOT, ".env.example"), "utf8");
  assert.equal(fs.existsSync(path.join(PROJECT_ROOT, "inject-env.js")), false);
  assert.doesNotMatch(netlifyToml, /EMAILJS_/);
  assert.match(netlifyToml, /from = "\/api\/contact"/);
  assert.match(envExample, /RESEND_API_KEY=/);
  assert.match(envExample, /RECAPTCHA_SECRET_KEY=/);
  assert.doesNotMatch(envExample, /EMAILJS_/);
});
