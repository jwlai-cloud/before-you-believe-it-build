# Before You Believe It

A five-to-seven-minute parent-and-child activity for practising how to question confident AI answers together. It is a reasoning canvas—not a chat—and follows **Think → Push Back → Check → Make → Own**.

The aim is not to prove AI wrong. It is to help a child pause, spot an assumption, consider a clue or another view, and make a working answer they can own with a parent beside them.

## What it does

- **Live GPT‑5.6 challenge:** a parent submits any general topic and age band, and GPT‑5.6 builds a complete reasoning mission from it — reshaping all five steps (the claim, the “what makes you pause?” questions, the hidden assumptions, the evidence clues, and the answer scaffolds). It prepares material to question, never a verdict.
- Walks that claim through **Think → Push Back → Check → Make → Own**, keeping the child’s contribution, AI’s help, the evidence considered, and what is still uncertain visibly separate.
- Keeps the child’s question, clue choice, working answer, and Learning Receipt in browser session storage only — the child’s answer is never sent to the model.
- A bundled Floating City mission keeps the activity working if the model is momentarily unavailable, so a live demo never breaks.

GPT‑5.6 never receives the child’s answer and is instructed not to grade, score, diagnose, rank, persuade, recommend, or decide what a child should believe.

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

## Live GPT‑5.6

The live route is served by Vercel. Configure these server-side environment variables:

```text
OPENAI_API_KEY=...
DEMO_ACCESS_TOKEN=use-a-unique-16-character-or-longer-value
OPENAI_MODEL=gpt-5.6
```

The browser never receives the API key or access token. A signed HTTP-only cookie authorizes the live route; the bundled mission remains fully usable when live generation is unavailable.

## How we collaborated with Codex

Codex was a hands-on build partner throughout the project, while the product owner made the final product, engineering, and design calls.

- **Product direction:** The product owner chose a short family ritual rather than another chatbot: children practise questioning confident AI responses with a parent, with no points or “right answers.”
- **Design decisions:** Codex helped implement the responsive two-dimensional canvas, persistent five-step path, evidence links, purposeful motion, and child-owned Learning Receipt. The product owner directed the visual tone and purpose-led interaction.
- **Engineering decisions:** Codex accelerated the static MissionPack, deterministic state model, accessibility work, session-only receipt, test suite, signed server boundary, and GPT‑5.6 schema validation. Together we chose to keep child work local and preserve a reliable static fallback.
- **Quality loop:** Codex helped run structural, unit, and browser checks, prepare reviewable artifacts, and address scoped code-review feedback. The product owner reviewed trade-offs and approved the live path.

## How GPT‑5.6 is used (runtime)

The live reviewer path calls **`gpt-5.6`** through the OpenAI **Responses API**. It receives only a parent-supplied topic and age band—never the child's working answer—and generates a complete, schema-bound reasoning mission that reshapes all five steps, as material *to question* rather than an answer to obey:

- Request: `reasoning: { effort: 'low' }`, `max_output_tokens: 1600`, and a strict `json_schema` (`strict: true`) whose fields drive every stage — the claim and claim label, three pause questions, three claim parts (each with its hidden assumption), three evidence clues, three answer openings and reasons, a default question, a parent prompt, and one remaining uncertainty (`live-challenge.js`).
- A developer instruction forbids grading, scoring, diagnosis, ranking, persuasion, verdicts, invented citations, and any request for personal data.
- The server verifies a signed, HTTP-only judge cookie before any model request, applies a 15-second timeout, and re-validates the model output against the schema before the browser renders it as text nodes only (`api/live-challenge.js`, `app.js`).
- If the model, network, or access code is unavailable, the complete static Floating City `MissionPack` remains fully usable.

See [`docs/OPENAI-BUILD-WEEK-EVIDENCE.md`](docs/OPENAI-BUILD-WEEK-EVIDENCE.md) for a claim-to-code map for judges.

## Project structure

- `app.js` — interaction state, receipt assembly, session-only persistence, and safe live rendering
- `mission-state.js` — testable state transitions and receipt transforms
- `live-challenge.js` — server-side input, schema, and model-output validation
- `api/` — Vercel functions for signed access and live GPT‑5.6
- `docs/` — architecture, decisions, specification, and learning notes
- `test/` — Node unit tests and Playwright browser smoke test

See [Architecture](docs/ARCHITECTURE.md) for the runtime boundary and [Learning notes](docs/LEARNING.md) for implementation details.
