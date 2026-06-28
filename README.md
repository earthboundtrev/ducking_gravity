# Ducking Gravity — Marketing site

Public marketing website for **[duckinggravity.com](https://duckinggravity.com)** — the studio’s brochure site for programs, class listings, summer camps, memberships, and contact.

This repo is the **companion site** to **[SmartAstro](https://smartastro.app)** (studio operations: scheduling, bookings, calendar, admin). Class sign-up links on this site point visitors to SmartAstro; SmartAstro can push class availability and weekly popup updates here so the marketing site stays current without manual HTML edits.

**SmartAstro source:** [gitlab.com/earthboundtrev/astro](https://gitlab.com/earthboundtrev/astro)

---

## About the studio

This site was built for and is in active use by **Ducking Gravity — An Aerial Arts Studio**, a real studio in **Culpeper, Virginia** (15532E Montanus Dr, Culpeper, VA 22701). Copy on the live pages describes an inclusive aerial arts community that celebrates movement while promoting physical and emotional well-being, with mixed-level classes and coaching for first-timers through experienced aerialists.

Program pages cover silks and open aerials, lyra, mixed apparatus, junior aerials, summer camps, birthday parties, events, memberships, homeschool programming, and more.

---

## What’s in the repo

- **Static, multi-page HTML** — each major offering has its own page (e.g. `silks.html`, `summercamps.html`, `memberships.html`) plus `index.html` with a homepage popup carousel.
- **Contact / inquiry forms** via **EmailJS** (no custom backend for forms).
- **Google reCAPTCHA** on forms that use it.
- **Netlify** hosting: build runs `node inject-env.js` to inject EmailJS config at deploy time (see `netlify.toml`).
- **SmartAstro sync receiver** — Netlify Function at `/api/smartastro-availability` accepts authenticated payloads from SmartAstro for:
  - full/open status updates on linked class slots
  - weekly homepage popup `replaceWeek` rollover (all-classes, silks, lyra)
  - `upsertSlot` insertion of new classes into managed list/table destinations
- **Client sync** — `js/smartastro-availability.js` fetches sync state and updates slot buttons (`Sign up!` / `Class Full`) and dynamically inserted rows without changing page layout.
- **Assets** — logos, photos, and media (many served from R2/CDN URLs in HTML).

There is no app database in this project; class sync state lives in **Netlify Blobs**. Studio data and scheduling live in SmartAstro.

---

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env` and add EmailJS values (`EMAILJS_PUBLIC_KEY`, `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`).
3. Run `node inject-env.js` to refresh EmailJS placeholders in `index.html` from your env file.
4. Run tests: `npm test`

---

## Deploy (Netlify)

In **Site configuration → Environment variables**, set:

| Variable | Purpose |
|----------|---------|
| `EMAILJS_PUBLIC_KEY` | Contact form delivery |
| `EMAILJS_SERVICE_ID` | Contact form delivery |
| `EMAILJS_TEMPLATE_ID` | Contact form delivery |
| `MARKETING_SYNC_SHARED_SECRET` | Shared secret for SmartAstro → site sync (must match SmartAstro env) |

Build command: `node inject-env.js`  
Publish directory: repo root (see `netlify.toml`).

Enable **Netlify Blobs** for the SmartAstro sync function.

---

## SmartAstro integration

Configured in SmartAstro Admin → Scheduled Jobs → **Marketing site sync** (see the [astro](https://gitlab.com/earthboundtrev/astro) repo). SmartAstro scans configured page URLs, discovers `data-smartastro-schedule-id` / calendar links, and POSTs signed JSON to the webhook URL (typically `https://duckinggravity.com/api/smartastro-availability`).

GET on that endpoint returns the current sync manifest (popup and managed destination schedule IDs) for discovery and verification.

### Replay protection (#233)

The receiver **fail-closes** on bad auth and enforces replay resistance before applying payloads:

| Check | Behavior |
|-------|----------|
| `X-SmartAstro-Timestamp` | Reject if missing or outside ±5 minutes of server time → **401** |
| `X-SmartAstro-Signature` | HMAC-SHA256 over `{timestamp}.{rawBody}`; constant-time compare → **401** on mismatch |
| `X-SmartAstro-Idempotency-Key` | Dedupe within a **24-hour** retention window (up to 100 keys stored); repeats return **200** with `{ duplicate: true }` and do not re-apply the payload |

Unit tests in `tests/smartastro-availability.test.js` cover timestamp windows and idempotency dedupe. SmartAstro integration docs: [marketing-site-sync.md](https://gitlab.com/earthboundtrev/astro/-/blob/main/docs/integrations/marketing-site-sync.md) in the astro repo.

---

## Note on secrets

Do not commit `.env`. Use `.env.example` as the template only. The marketing sync shared secret is server-side only on Netlify and in SmartAstro’s environment — never in client HTML.
