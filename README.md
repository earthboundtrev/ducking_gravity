# ducking_gravity

## Local setup

1. Copy `.env.example` to `.env` and add your EmailJS values.
2. Run `node inject-env.js` before deploy or when you need `index.html` updated from env vars.

**Netlify:** set `EMAILJS_PUBLIC_KEY`, `EMAILJS_SERVICE_ID`, and `EMAILJS_TEMPLATE_ID` under Site configuration → Environment variables (the build runs `node inject-env.js`).
