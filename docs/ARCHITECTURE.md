# Architecture

## Summary

Before You Believe It is a dependency-free static web prototype for a 5–7 minute parent-and-child reasoning activity. A child moves through a fixed mission—Think, Push back, Check, Make, and Own—while the interface keeps the child’s contribution, AI assistance, evidence, and uncertainty visibly separate.

## Components

| Component | Responsibility | Does not do |
| --- | --- | --- |
| `index.html` | Semantic five-stage activity, accessible controls, and receipt structure. | Fetch data, call AI, grade a child, or retain personal data remotely. |
| `styles.css` | Responsive 2D reasoning canvas, print layout, and reduced-motion support. | Supply mission content or make reasoning decisions. |
| `app.js` | Deterministic stage transitions, selections, receipt assembly, session-only persistence, copy, and print behavior. | Evaluate the answer or transmit it anywhere. |
| `mission-state.js` | Pure mission-state transitions, answer assembly, and receipt transforms shared by the browser UI and unit tests. | Read or write the DOM, browser storage, or network. |
| `check.js` | Minimal structural regression check for the required activity and receipt controls. | Replace live-browser accessibility or visual testing. |
| `test/` | Unit coverage for state outcomes and a Playwright browser smoke test for the full mission flow. | Replace human content review or external deployment checks. |
| Static MissionPack (embedded) | Supplies the Floating City claim, challenge cards, scaffolds, and parent prompt. | Adapt content dynamically or cite live sources. |

## Data flow

1. Parent and child open the static page in a modern browser.
2. The browser renders the bundled Floating City mission; no network or model call is needed for activity content.
3. The child selects a question and an evidence clue; `app.js` updates the visual trail and working answer.
4. The browser stores only the current stage, selected values, and answer in `sessionStorage` for the active browser session; derived receipt text is rebuilt locally on restore.
5. The Own stage assembles a Learning Receipt from those values and allows copying or printing it.
6. Starting over clears the session-only mission state.

## External dependencies

- Optional Google Fonts stylesheet for DM Sans, DM Mono, and Fraunces. System font fallbacks preserve usability when it is unavailable.
- Playwright 1.59.0 is a development-only dependency for browser verification, declared in `requirements-dev.txt`; it is not shipped to users.
- No AI SDK, analytics, database, authentication service, or API key is used by the current build.

## Deployment topology

The prototype is static HTML, CSS, and JavaScript. It can be served by any HTTPS static host. Local development uses Python’s built-in static server through `npm run start`; there is no always-on server, database, or billable backend.

## Future AI boundary

A future server-side Mission Director may coordinate Inquiry Designer, Skeptic, and Evidence Guardian agents to create a validated `MissionPack`. The browser must receive only a validated pack and a bundled fallback must remain available. The future system must not score, diagnose, rank, or judge children.

## Known limitations / non-goals

- One preset mission only; evidence cards are reasoning prompts, not live research citations.
- No multi-device saving, accounts, or parent dashboard.
- The browser smoke test covers runtime flow, console errors, responsive overflow, session restore, reset, copy fallback, and reduced motion. A human accessibility review remains valuable before final submission.
- Copy depends on browser clipboard permission; print opens the browser’s normal print flow.
