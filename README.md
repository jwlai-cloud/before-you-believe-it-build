# Before You Believe It

A five-to-seven-minute parent-and-child activity for practising how to question confident AI answers together. It is a reasoning canvas—not a chat—and follows **Think → Push Back → Check → Make → Own**.

The aim is not to prove AI wrong. It is to help a child pause, spot an assumption, consider a clue or another view, and make a working answer they can own with a parent beside them.

## What it does

- Runs a complete, bundled Floating City mission without a login, API key, or network request.
- Keeps the child’s question, clue choice, working answer, and Learning Receipt in browser session storage only.
- Separates child contribution, AI help, evidence considered, uncertainty, and a parent’s next question.
- Offers an optional live GPT‑5.6 challenge: a parent submits only a general topic and age band, and receives bounded material to question together.

GPT‑5.6 prepares a claim, hidden assumption, three clues, a parent prompt, and uncertainty. It never receives the child’s answer and is instructed not to grade, score, diagnose, rank, persuade, recommend, or decide what a child should believe.

## Run locally

No install or API key is required for the complete preset mission.

```bash
npm run start
# Open http://localhost:4173
```

```bash
npm run check
npm test
```

For browser verification, install the one development dependency first:

```bash
python3 -m pip install -r requirements-dev.txt
playwright install chromium
npm run test:browser
```

## Optional live GPT‑5.6

The live route is served by Vercel. Configure these server-side environment variables:

```text
OPENAI_API_KEY=...
DEMO_ACCESS_TOKEN=use-a-unique-16-character-or-longer-value
OPENAI_MODEL=gpt-5.6
```

The browser never receives the API key or access token. A signed HTTP-only cookie authorizes the optional live route; the static mission remains fully usable when live generation is unavailable.

## How we collaborated with Codex

Codex was a hands-on build partner throughout the project, while the product owner made the final product, engineering, and design calls.

- **Product direction:** The product owner chose a short family ritual rather than another chatbot: children practise questioning confident AI responses with a parent, with no points or “right answers.”
- **Design decisions:** Codex helped implement the responsive two-dimensional canvas, persistent five-step path, evidence links, purposeful motion, and child-owned Learning Receipt. The product owner directed the visual tone and purpose-led interaction.
- **Engineering decisions:** Codex accelerated the static MissionPack, deterministic state model, accessibility work, session-only receipt, test suite, signed server boundary, and GPT‑5.6 schema validation. Together we chose to keep child work local and preserve a reliable static fallback.
- **Quality loop:** Codex helped run structural, unit, and browser checks, prepare reviewable artifacts, and address scoped code-review feedback. The product owner reviewed trade-offs and approved the live path.

## Project structure

- `app.js` — interaction state, receipt assembly, session-only persistence, and safe live rendering
- `mission-state.js` — testable state transitions and receipt transforms
- `live-challenge.js` — server-side input, schema, and model-output validation
- `api/` — Vercel functions for signed access and live GPT‑5.6
- `docs/` — architecture, decisions, specification, and learning notes
- `test/` — Node unit tests and Playwright browser smoke test

See [Architecture](docs/ARCHITECTURE.md) for the runtime boundary and [Learning notes](docs/LEARNING.md) for implementation details.
