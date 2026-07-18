# Spec: Before You Believe It — demo-ready static prototype

## Objective

Deliver a reliable 5–7 minute parent-and-child web activity that teaches a child to form answers with AI in the room. The child should be able to trace their own thinking through Think → Push back → Check → Make → Own, with no scores, diagnoses, rankings, or AI judgment. The activity must retain a static preset and optionally show a server-side live GPT challenge.

Success means a judge can complete the preset Floating City mission without an API key, see the clear separation between child work and AI help, and leave with a printable Learning Receipt.

## Tech stack

- Static HTML, CSS, modern browser JavaScript, and a Vercel serverless endpoint.
- A same-origin `POST /api/live-challenge` server boundary for GPT-5.6; no client-side key, database, or authentication.
- Optional Google Fonts with system-font fallbacks.
- GitHub Actions only for repository branch-source protection.

## Commands

```bash
npm run start
npm test
npm run test:browser
npm run check
```

`npm run start` serves the current directory on port 4173. `npm test` runs the pure mission-state unit suite. `npm run test:browser` launches its own temporary static server and runs the Playwright browser smoke test. `npm run check` runs JavaScript syntax checks and the structural regression check. Before first browser run, install `requirements-dev.txt` and run `playwright install chromium`.

## Project structure

```text
index.html                  Activity structure and accessible controls
styles.css                  Responsive, motion, and print presentation
app.js                      Deterministic activity state and receipt actions
live-challenge.js           Server-side request/schema/output validation
api/live-challenge.js       Vercel function for the live GPT challenge
mission-state.js            Pure state transitions and receipt transforms
check.js                    Lightweight regression check
test/                       Unit and browser smoke tests
requirements-dev.txt        Pinned test-only browser dependency
README.md                   Run instructions, demo narrative, future AI flow
docs/                       Architecture, decisions, progress, learning, spec
```

## Code style

Use small, named functions for state transitions and browser boundaries. Keep mission content declarative in markup or named constants; never encode a correctness rule for a child’s answer.

```js
function saveProgress() {
  sessionStorage.setItem(storageKey, JSON.stringify({ current, thinkChoice, evidenceChoice, answer }));
}
```

## Testing strategy

- Always run `npm test`, `npm run test:browser`, `npm run check`, and `git diff --check` before a commit.
- The browser smoke test verifies the full mission, refresh persistence, reset, console cleanliness, copy fallback, reduced motion, and no horizontal overflow at 320px, 768px, 1024px, and 1440px.
- Perform a human visual/accessibility review of keyboard order, live announcements, and print layout before release.
- Add a structural regression token to `check.js` when adding an essential activity or receipt control.

## Boundaries

- **Always:** preserve no-key static reliability; keep AI assistance separate from child contribution; retain accessible native controls; validate live model output before rendering; update the four living documents after meaningful work.
- **Never:** transmit a child’s work without explicit consent; grade, score, diagnose, rank, or judge a child; expose an API key in the browser; remove a failing test to make checks pass.

## Success criteria

- The full five-stage activity works from bundled content without an API key.
- The receipt separates child contribution, AI help, evidence checked, uncertainty, and a parent question.
- Refresh preserves only the active session’s activity state; Start over clears it.
- The receipt can be copied or printed/saved, with a visible fallback when copy is unavailable.
- A parent can request a live GPT-5.6 reasoning challenge using a general topic and age band; the browser receives only validated structured material and preserves the static fallback.
- `npm test`, `npm run test:browser`, `npm run check`, and `git diff --check` pass.
- Protected `main` accepts only passing PRs from `dev`.

## Open questions

- Is one polished preset mission plus a live companion challenge sufficient for the submission, or is a second full mission required?
- Which Vercel environments should receive `OPENAI_API_KEY` and model access?
- Should the future GPT-5.6 Agents SDK Mission Director replace the single-call live baseline after the hackathon?

## Approval gate

The project owner approved the optional server-side live GPT baseline on 2026-07-18. Do not add a browser API key, transmit a child’s answer, or replace the static fallback without a new approval.
