# Ducking Gravity — Studio website

## About this project

This site was **built for a client** and is **in active use** by **Ducking Gravity — An Aerial Arts Studio**, a real studio in **Culpeper, Virginia** (15532E Montanus Dr, Culpeper, VA 22701). The copy on the live pages describes the business as an **inclusive aerial arts community in Culpeper, VA** that celebrates movement while **promoting physical and emotional well-being**, with mixed-level classes and coaching that meet people where they are—from first-timers to experienced aerialists.

Program pages mirror what the studio offers on the site: silks and open aerials, lyra, yoga, mixed apparatus, junior aerials, summer camps, birthday parties, events, memberships, homeschool programming, and more, plus imagery and contact paths so visitors can get in touch.

## What’s in the repo

- **Static, multi-page HTML** — each major offering has its own page (e.g. `silks.html`, `summer-camps.html`, `memberships.html`) plus a central `index.html`.
- **Contact / inquiry forms** wired through **EmailJS** so submissions go to email without a custom backend.
- **Google reCAPTCHA** on forms that use it, to cut down on spam.
- **Netlify** for hosting: build runs `node inject-env.js` to inject EmailJS config into `index.html` at deploy time (see below).
- **Assets** — logos, photos, and video under `images/`.

There is no app server or database in this project; it’s a static site with third-party form delivery.

## Local setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and add your EmailJS values (`EMAILJS_PUBLIC_KEY`, `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`).
3. Run `node inject-env.js` when you want the build step to refresh EmailJS placeholders in `index.html` from your env file.

## Deploy (Netlify)

In **Site configuration → Environment variables**, set:

- `EMAILJS_PUBLIC_KEY`
- `EMAILJS_SERVICE_ID`
- `EMAILJS_TEMPLATE_ID`

The site build command is `node inject-env.js`; the publish directory is the repo root (see `netlify.toml`).

## Note on secrets

Do not commit `.env`. Use `.env.example` as the template only.
