# Architecture

## Summary

Before You Believe It is a 5–7 minute parent-and-child reasoning activity with a bundled five-step mission and an optional, server-side live GPT challenge. A child moves through Think, Push back, Check, Make, and Own while the interface keeps the child’s contribution, AI assistance, evidence, and uncertainty visibly separate.

## Components

| Component | Responsibility | Does not do |
| --- | --- | --- |
| `index.html` | Semantic five-stage activity, accessible controls, receipt structure, judge-code form, and live-topic form. | Hold an API key or send the child’s answer to AI. |
| `styles.css` | Responsive 2D reasoning canvas, print layout, and reduced-motion support. | Supply mission content or make reasoning decisions. |
| `app.js` | Deterministic stage transitions, selections, receipt assembly, session-only persistence, copy/print, and safe rendering of a live challenge. | Evaluate the answer or transmit it anywhere. |
| `api/demo-access.js` + `demo-access.js` | Verifies the judge code and issues a two-hour signed, HTTP-only cookie. | Put the code in browser JavaScript or identify a child. |
| `api/live-challenge.js` | Vercel serverless boundary: validates a parent topic, requires judge access, calls GPT-5.6, and returns a safe JSON result. | Expose `OPENAI_API_KEY`, retain a child’s answer, or decide the child’s conclusion. |
| `live-challenge.js` | Validates inputs/model output and builds the schema-constrained Responses API request. | Render browser UI or accept arbitrary model output. |
| `mission-state.js` | Pure mission-state transitions, answer assembly, and receipt transforms shared by the browser UI and unit tests. | Read or write the DOM, browser storage, or network. |
| `check.js` | Minimal structural regression check for the required activity and receipt controls. | Replace live-browser accessibility or visual testing. |
| `test/` | Unit coverage for state outcomes and a Playwright browser smoke test for the full mission flow. | Replace human content review or external deployment checks. |
| Static MissionPack (embedded) | Supplies the Floating City claim, challenge cards, scaffolds, and parent prompt. | Adapt content dynamically or cite live sources. |

## Data flow

1. Parent and child open the bundled Floating City mission; no network or model call is needed for the core activity.
2. For a live demo, a reviewer enters a server-configured judge code. The same-origin function issues a signed, HTTP-only cookie valid for two hours.
3. An authorized parent submits a general topic and age band to the same-origin Vercel function. The child’s answer is never sent.
4. The function calls GPT-5.6 through the Responses API with a strict JSON schema; malformed output is rejected before the browser receives it.
5. `app.js` reshapes all five mission stages (claim, pause questions, claim parts and assumptions, evidence clues, and answer scaffolds) from the validated challenge using DOM text nodes. If live GPT fails, the preset mission remains usable.
6. The child selects a question and an evidence clue; `app.js` updates the visual trail and working answer.
7. The browser stores only the current stage, selected values, and answer in `sessionStorage` for the active browser session; derived receipt text is rebuilt locally on restore.
8. The Own stage assembles a Learning Receipt from those values and allows copying or printing it. Starting over clears session-only state.

## External dependencies

- Optional Google Fonts stylesheet for DM Sans, DM Mono, and Fraunces. System font fallbacks preserve usability when it is unavailable.
- Playwright 1.59.0 is a development-only dependency for browser verification, declared in `requirements-dev.txt`; it is not shipped to users.
- The deployed live path uses the built-in `fetch` API to call the OpenAI Responses API; it adds no production npm dependency.
- `OPENAI_API_KEY`, optional `OPENAI_MODEL`, and `DEMO_ACCESS_TOKEN` live only in Vercel environment variables. No analytics, database, or third-party authentication service is used.

## Deployment topology

The preset is static HTML, CSS, and JavaScript. Vercel additionally serves `api/demo-access.js` and `api/live-challenge.js` as short-lived serverless functions. Local development uses Python’s built-in static server through `npm run start`, so it intentionally exercises the preset fallback rather than live GPT.

## Future AI boundary

The live baseline is one schema-constrained GPT-5.6 call. A future server-side Mission Director may use the Agents SDK’s manager-as-tools pattern to coordinate Inquiry Designer, Skeptic, and Evidence Guardian agents, then validate a full `MissionPack` before release. The browser must receive only validated material and keep the bundled fallback. Neither path may score, diagnose, rank, or judge children.

## Known limitations / non-goals

- One preset mission plus an optional live companion challenge; generated evidence cards are reasoning prompts, not live research citations.
- No multi-device saving, accounts, or parent dashboard.
- This stateless demo deliberately does not claim durable rate limiting for access-code attempts or live generations: a signed cookie can be replayed and Vercel function invocations do not share request state. The private judge code and two-hour cookie scope the demo; production use needs durable server-side throttling before exposing paid calls.
- The browser smoke test covers runtime flow, console errors, responsive overflow, session restore, reset, copy fallback, and reduced motion. A human accessibility review remains valuable before final submission.
- Copy depends on browser clipboard permission; print opens the browser’s normal print flow.
