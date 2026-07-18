# Spec: Before You Believe It — demo-ready static prototype

## Objective

Deliver a reliable 5–7 minute parent-and-child web activity that teaches a child to form answers with AI in the room. The child should be able to trace their own thinking through Think → Push back → Check → Make → Own, with no scores, diagnoses, rankings, or AI judgment.

Success means a judge can complete the preset Floating City mission without an API key, see the clear separation between child work and AI help, and leave with a printable Learning Receipt.

## Tech stack

- Static HTML, CSS, and modern browser JavaScript.
- No runtime package dependency, model call, backend, database, or authentication.
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
  sessionStorage.setItem(storageKey, JSON.stringify({ current, thinking, evidence }));
}
```

## Testing strategy

- Always run `npm test`, `npm run test:browser`, `npm run check`, and `git diff --check` before a commit.
- The browser smoke test verifies the full mission, refresh persistence, reset, console cleanliness, copy fallback, reduced motion, and no horizontal overflow at 320px, 768px, 1024px, and 1440px.
- Perform a human visual/accessibility review of keyboard order, live announcements, and print layout before release.
- Add a structural regression token to `check.js` when adding an essential activity or receipt control.

## Boundaries

- **Always:** preserve no-key static reliability; keep AI assistance separate from child contribution; retain accessible native controls; update the four living documents after meaningful work.
- **Ask first:** add a dependency, backend, analytics, authentication, new persistent storage, CI changes, a deployment provider, or live model integration.
- **Never:** transmit a child’s work without explicit consent; grade, score, diagnose, rank, or judge a child; expose an API key in the browser; remove a failing test to make checks pass.

## Success criteria

- The full five-stage activity works from bundled content without an API key.
- The receipt separates child contribution, AI help, evidence checked, uncertainty, and a parent question.
- Refresh preserves only the active session’s activity state; Start over clears it.
- The receipt can be copied or printed/saved, with a visible fallback when copy is unavailable.
- `npm test`, `npm run test:browser`, `npm run check`, and `git diff --check` pass.
- Protected `main` accepts only passing PRs from `dev`.

## Open questions

- Is one polished preset mission sufficient for the submission, or is a second mission required?
- Which static host will publish the demo?
- Should the future GPT-5.6 Mission Director be implemented during this hackathon, or remain an accurately documented next step?

## Approval gate

This is the baseline specification for subsequent work. Do not add new features, dependencies, deployment, or live AI integration until the project owner approves this spec and answers the relevant open questions.
