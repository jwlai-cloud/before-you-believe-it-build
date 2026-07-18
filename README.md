# Before You Believe It

A judge-ready, no-login Build Week prototype for a 5–7 minute parent-and-child reasoning activity. It is deliberately a canvas, not a chat: the child moves through **Think → Push back → Check → Make → Own**, while the parent stays alongside as a calm co-investigator.

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
2. In **Project Settings → Environment Variables**, add `OPENAI_API_KEY` for the Preview and Production environments. Optionally set `OPENAI_MODEL=gpt-5.6` (the default).
3. Redeploy. Vercel serves `api/live-challenge.js`; the browser calls it at `/api/live-challenge` and never sees the key.

Use a general topic, not a child’s name, answer, or other personal information. If the key, model access, or network is unavailable, the interface explains that the live challenge is unavailable and the complete preset mission still works.

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
- `api/live-challenge.js` — Vercel serverless live-GPT boundary
- `live-challenge.js` — server-side input, schema, and output validation
- `mission-state.js` — testable mission-state transitions and receipt transforms
- `test/` — unit tests and a self-contained browser smoke test
- `check.js` — lightweight structural regression check
