# Progress log

## 2026-07-18 — prototype and documentation baseline

### Done this session

- Built a responsive five-stage reasoning canvas for the Floating City mission.
- Implemented child choice, hidden-assumption, evidence-linking, answer-building, and Learning Receipt interactions without scoring or judgment.
- Added session-only progress preservation plus copy and print/save receipt actions.
- Added lightweight structural checks with `npm run check`.
- Created the public GitHub repository with protected `main`, a `dev` branch, and a `dev`-only PR validation workflow.
- Added current-state architecture, ADR, learning, and specification documents.
- Extracted deterministic mission state into `mission-state.js` using a red-green-refactor test cycle.
- Expanded the Node unit suite to 11 tests, including malformed restore values, partial answers, neutral defaults, malformed answer fields, and minimal session serialization.
- Added a self-contained Playwright browser smoke test covering the full mission, refresh persistence, reset, copy fallback, reduced motion, console errors, and 320px/768px/1024px/1440px responsive overflow.
- Captured and reviewed settled browser screenshots at 320px, 768px, 1024px, and 1440px; no visual clipping was found.

### In progress (not done)

- The public Vercel deployment currently serves `main`, which does not yet contain the optional live GPT functions from `dev`. The static mission is live; the live path needs a `dev` preview deployment after the judge-access update is pushed.

### Next (priority order)

1. Review the refreshed PR checks and comments, then merge the `dev` → `main` PR once required checks permit it.
2. Deploy `dev` to Vercel with `OPENAI_API_KEY` and `DEMO_ACCESS_TOKEN`, then perform a live hosted GPT verification.
3. Perform a human accessibility/content review before final submission.
4. Only after the core demo is proven, specify a server-side validated MissionPack pipeline for future GPT-5.6 agent orchestration.

### Open questions / blocked on

- Vercel needs `OPENAI_API_KEY` (and access to the configured `OPENAI_MODEL`) plus `DEMO_ACCESS_TOKEN` for the optional gated live challenge.
- Does the project need a second mission before submission, or is one polished mission the intended scope? The current spec accepts one polished mission.

### Changed since last entry

- The Live GPT Mission Lab calls a same-origin Vercel function with only a parent topic and age band. A separate server function now verifies a judge code and grants a two-hour signed, HTTP-only cookie before the GPT function accepts a request. Unit tests cover signing, expiry, endpoint authorization, request/schema/endpoint fallback; the browser test covers judge unlock and live challenge rendering. The static MissionPack remains the core fallback; the live decision is recorded in [ADR 0002](adr/0002-add-server-side-live-gpt-challenge.md).
