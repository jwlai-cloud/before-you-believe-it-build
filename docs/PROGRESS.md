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

- The optional live GPT challenge path is pushed to `dev` in `d74fc54`; PR #1 and bot checks are refreshing. The preset mission remains available as a no-key fallback.

### Next (priority order)

1. Review the refreshed PR checks and comments, then merge the `dev` → `main` PR once required checks permit it.
2. Deploy `dev` to Vercel with `OPENAI_API_KEY` and perform a live hosted GPT verification.
4. Perform a human accessibility/content review before final submission.
5. Only after the core demo is proven, specify a server-side validated MissionPack pipeline for future GPT-5.6 agent orchestration.

### Open questions / blocked on

- Vercel needs `OPENAI_API_KEY` (and access to the configured `OPENAI_MODEL`) for the optional live challenge.
- Does the project need a second mission before submission, or is one polished mission the intended scope? The current spec accepts one polished mission.

### Changed since last entry

- The Live GPT Mission Lab calls a same-origin Vercel function with only a parent topic and age band. The function uses GPT-5.6 Structured Outputs, validates its response, and the frontend renders the resulting claim/clues as text nodes. Unit tests cover the request/schema/endpoint fallback; the browser test mocks the endpoint and verifies the rendered live challenge. The static MissionPack remains the core fallback; the live decision is recorded in [ADR 0002](adr/0002-add-server-side-live-gpt-challenge.md).
