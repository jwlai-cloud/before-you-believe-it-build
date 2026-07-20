# Before You Believe It

A judge-ready, no-login Build Week prototype for a 5–7 minute parent-and-child reasoning activity. It is deliberately a canvas, not a chat: the child moves through **Think → Push back → Check → Make → Own**, while the parent stays alongside as a calm co-investigator.

## OpenAI Build Week evidence

This project was built with **Codex using GPT-5.6**, and has two deliberately distinct OpenAI roles:

- **GPT-5.6 at runtime:** the optional reviewer-only live path makes one server-side Responses API request to `gpt-5.6`. It uses strict JSON Schema output to prepare a claim, hidden assumption, three reasoning clues, a parent prompt, and an uncertainty. The browser validates and renders that bounded material. GPT-5.6 never receives the child’s answer and is instructed never to grade, diagnose, rank, recommend, persuade, or decide what the child should believe. See [`live-challenge.js`](live-challenge.js) and [`api/live-challenge.js`](api/live-challenge.js).
- **Codex in development:** Codex accelerated the implementation and refinement of the accessible five-stage canvas, session-only Learning Receipt, signed judge-access boundary, live GPT validation, Node test suite, Playwright browser smoke test, deployment documentation, and demo artifacts. Key implementation decisions—including why the reliable static MissionPack remains available and why the live path is server-side—are recorded in [`docs/adr`](docs/adr) and [`docs/OPENAI-BUILD-WEEK-EVIDENCE.md`](docs/OPENAI-BUILD-WEEK-EVIDENCE.md).

The judge-facing UI includes the same plain-language evidence card. The demo video will show the real live GPT-5.6 generation, the captioned wait, and this architecture boundary; its narration names both GPT-5.6 and Codex.

## How we collaborated with Codex

Codex was a hands-on build partner throughout the project, while the product owner made the final product, engineering, and design calls.

- **Product direction:** Together, we turned the brief into a short family ritual rather than another chatbot. The product owner chose the central promise: children should practise questioning confident AI responses with a parent, not be trained to accept them. That led to the five-step path, no points or “right answers,” and a Learning Receipt that creates a calm prompt for a parent-and-child conversation.
- **Design decisions:** Codex helped turn that promise into a responsive two-dimensional reasoning canvas with a persistent path, evidence links, purposeful motion, and a child-owned working answer. The product owner directed the visual tone and the emphasis on making the purpose legible before the interaction begins.
- **Engineering decisions:** Codex accelerated the static MissionPack, deterministic state model, accessible controls, session-only receipt, tests, deployment configuration, and documentation. Together we chose a server-side GPT-5.6 boundary with schema validation and signed reviewer access so the child’s answer never reaches the model or browser-visible credentials.
- **Quality loop:** Codex helped run unit, structural, and browser checks; prepare reviewable capture artifacts; and address scoped code-review feedback. The product owner reviewed the trade-offs, approved the live path, and retained the static activity as the reliable no-key experience.

GPT-5.6 is therefore part of the live product experience—preparing bounded material a family can interrogate—while Codex accelerated the design, implementation, verification, and submission workflow that made that experience shippable.

## Run it

No install or API key is required.

```bash
npm run start
# Open http://localhost:4173
```

```bash
npm run check
```

For the full test suite, install the browser-test dependency once, then run:

```bash
python3 -m pip install -r requirements-dev.txt
playwright install chromium
npm test
npm run test:browser
```

## Show live GPT on Vercel

The default Floating City mission works without a key. For the hackathon demo, the first stage also includes **Live GPT Mission Lab**: a parent can enter a general topic and GPT-5.6 prepares a structured claim, hidden assumption, and three reasoning clues.

1. Import the repository in Vercel and deploy the `dev` branch for a preview.
2. In **Project Settings → Environment Variables**, add `OPENAI_API_KEY` and a unique `DEMO_ACCESS_TOKEN` (16+ characters) for the Preview and Production environments. Optionally set `OPENAI_MODEL=gpt-5.6` (the default).
3. Redeploy. Vercel serves `api/demo-access.js` and `api/live-challenge.js`; the browser never sees the API key or the judge access code.
4. Share the judge access code only with hackathon reviewers. It unlocks live GPT for two hours in that browser through a signed, HTTP-only cookie. The preset Floating City mission remains public and complete.

Use a general topic, not a child’s name, answer, or other personal information. If the access code, key, model access, or network is unavailable, the interface explains that the live challenge is unavailable and the complete preset mission still works.

### Temporary capture bypasses

For a one-time video capture, set `BEFORE_YOU_BELIEVE_DEMO_BYPASS=true` **only** in Vercel's **Preview** environment, then redeploy the Preview. The server checks both that exact value and Vercel's server-supplied `VERCEL_ENV=preview`; the bypass is inert in Production, even if the variable is mistakenly present there.

If Vercel Deployment Protection prevents recording the Preview, a separate, temporary Production capture switch is available: set `BEFORE_YOU_BELIEVE_PRODUCTION_CAPTURE_BYPASS=true` in **Production** and redeploy. It hides the judge-code form and permits unauthenticated live-generation requests, so enable it only while recording, then remove it and redeploy immediately. It never bypasses `OPENAI_API_KEY` or model availability.

Remove the applicable variable and redeploy its environment immediately after capture. Never commit either value to `.env`, and do not record the bypass state, any access code, cookie, or API key in the video.

## What to demo (about 90 seconds)

1. Open the Floating City mission and read the AI helper’s deliberately plausible claim.
2. Let the child choose the question that pulls at them. Emphasize that there is no score and no correct choice.
3. Move to **Push back**. Tap a phrase to reveal the assumption doing hidden work.
4. In **Check**, link an evidence card to the claim. The cards are prompts to reason with, rather than citations used to settle the child’s answer.
5. In **Make**, assemble a provisional answer in the child’s own words. Show how the preview changes.
6. Open **Own**: the Learning Receipt clearly separates the child’s contribution, the AI’s limited help, the clue considered, and what remains uncertain. End on the parent’s next question.

The product point: AI belongs in the room as a material-preparer and reasoning critic—not as a grader, authority, diagnosis tool, or judge of a child. The live path sends only the parent’s general topic and age band; the child’s answer stays local.

## Design notes

- Keyboard-operable controls, visible focus states, semantic headings/labels, live announcements, responsive layouts, and reduced-motion support are built in.
- The persistent path tracks the activity without points, streaks, levels, or a “correct answer.”
- The current mission is a reliable static `MissionPack`; everything works offline after the first browser font load (and remains usable with system-font fallback). Live GPT is an optional server-side companion, not a replacement.
- The child’s selected question, checked clue, and working answer are held in browser session storage only, so a refresh does not erase the conversation. The receipt can be copied or printed/saved as a PDF.

## Future server-side GPT-5.6 Agents SDK flow

The browser should never call a model directly or receive unvalidated generation. The demo uses one schema-constrained GPT-5.6 Responses API call today; a server-side **Mission Director** can later coordinate a constrained, auditable multi-agent pipeline:

```text
Parent selects age band + topic
            │
            ▼
Mission Director (server-side manager)
 ├── Inquiry Designer → draft claim, child choice, creative Make prompt
 ├── Skeptic → hidden assumption, counter-perspective, reasoning challenge
 └── Evidence Guardian → source-aware evidence cards, uncertainty bounds
            │
            ▼
MissionPack validator
 ├── schema + age/reading-level checks
 ├── provenance and evidence requirements
├── forbid scoring, diagnosis, persuasion, and answer judgment
 └── apply human-reviewed safety/editorial rules
            │
            ▼
Cache approved MissionPack → static canvas renderer
```

Suggested `MissionPack` contract: `mission`, `claim`, `choicePrompts`, `assumption`, `evidenceCards` (claim/source/limits), `makeScaffold`, `parentPrompt`, and `receiptTemplate`. The Director can retry narrowly scoped agents when validation fails, log the agent trace server-side, and only release a pack after the validator passes. The activity renderer should use the same contract as this demo, with a bundled fallback pack whenever generation is unavailable.

## Project files

- `index.html` — accessible activity structure
- `styles.css` — responsive canvas and purposeful CSS motion
- `app.js` — deterministic mission state and receipt assembly
- `api/demo-access.js` — Vercel serverless judge-access boundary
- `api/live-challenge.js` — Vercel serverless live-GPT boundary (requires judge access)
- `demo-access.js` — signed, HTTP-only judge-access cookie helpers
- `live-challenge.js` — server-side input, schema, and output validation
- `mission-state.js` — testable mission-state transitions and receipt transforms
- `test/` — unit tests and a self-contained browser smoke test
- `check.js` — lightweight structural regression check
