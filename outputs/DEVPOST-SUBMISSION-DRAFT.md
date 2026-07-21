# Before You Believe It — Devpost submission draft

**Status:** Human-review draft. Keep the judge access code and the Codex `/feedback` Session ID out of Git; paste them only into the appropriate Devpost fields when submitting.

## Project basics

- **Project name:** Before You Believe It
- **Tagline (115 characters):** A 5-minute parent-child activity helping kids question confident AI claims and build answers they can own together.
- **Category:** Education
- **Public project link:** https://before-you-believe-it-build.vercel.app/
- **Public code:** https://github.com/jwlai-cloud/before-you-believe-it-build
- **Demo video:** _Add the YouTube URL (public, or unlisted is OK) after upload; it must be under three minutes. Current 1080p cut: `outputs/video/before-you-believe-it-demo-1080p-v4.mp4` (1:40)._

## Inspiration

My kids can get a confident-sounding answer from AI in seconds. What they can't get from it is the pause before believing it — the habit of thinking critically and independently instead of just accepting what they're told. I didn't want a filter or a lecture. I wanted a way to sit beside my child and practise that questioning together, without turning family time into a test. So I built a small weekend ritual instead of another chatbot.

## What it does

Before You Believe It is a 5–7 minute, five-step reasoning canvas: **Think → Push Back → Check → Make → Own**.

- **Live GPT-5.6 builds the mission.** A parent enters any general topic and age band, and GPT-5.6 generates a complete reasoning mission in real time — reshaping all five steps: the claim, the questions worth pausing on, the hidden assumptions, the evidence clues, and the answer scaffolds. It prepares material to question, never a verdict.
- The child chooses the question that makes them pause, reveals a hidden assumption, compares evidence clues, and writes a working answer in their own words. AI never grades, scores, diagnoses, ranks, or judges it.
- A calm Learning Receipt separates the child’s contribution, AI’s help, the evidence checked, and what is still uncertain. The child’s work stays in the browser session and is never sent to the model.
- A bundled Floating City mission keeps the activity working if the model is momentarily unavailable, so a live demo never breaks.

## How we built it

The prototype uses static HTML, CSS, and modern browser JavaScript for a responsive, accessible 2D reasoning canvas. The core mission is a deterministic bundled MissionPack, so the activity remains reliable without a network call.

The live path is a Vercel serverless `POST /api/live-challenge` boundary. A reviewer code is exchanged for a signed, HTTP-only cookie before the server calls the OpenAI Responses API with **GPT-5.6** (`reasoning: { effort: 'low' }`, strict `json_schema`). The request accepts only a general parent topic and age band; it excludes the child’s answer. The schema-validated result — claim, three pause questions, three claim parts with hidden assumptions, three evidence clues, answer scaffolds, a parent prompt, and an uncertainty — **reshapes all five stages** of the canvas, rendered as text rather than generated HTML.

We used **Codex** throughout development to accelerate the accessible canvas, deterministic state and Learning Receipt, signed access boundary, GPT-5.6 schema validation, Node and Playwright checks, documentation, review follow-ups, and demo artifacts. The product owner made the key calls to keep the interaction non-judgmental, preserve a static fallback, keep child work local, and make the parent-child conversation—not a model verdict—the centre of the experience.

The repository includes the architecture, ADRs, test commands, evidence map, exact demo script, capture plan, and reviewable still frames.

## Challenges we ran into

The product needed to demonstrate real GPT-5.6 use without making the demo fragile or inviting a child to treat the model as an authority. We solved this by constraining GPT-5.6's output with a strict schema, keeping the child's answer local, and keeping a complete bundled mission as a reliability fallback so a live demo never dead-ends. The richer full-mission generation takes ~15 seconds, so the serverless function's timeout was widened and the model timeout raised to match.

We also needed a credible boundary around a paid model endpoint without adding a database or paid service. The demo uses a private reviewer code and a short-lived signed cookie. It intentionally does not claim durable global rate limiting; the repository documents that limitation and the production path needed before wider public access.

## Accomplishments that we’re proud of

- A working family activity that treats uncertainty as a visible, healthy part of reasoning.
- A non-chat interaction that makes a child’s thought process more inspectable to both child and parent.
- A real GPT-5.6 feature that is useful precisely because it is bounded: it creates prompts to question, not answers to obey.
- A no-key static fallback, privacy-respecting client boundary, accessible controls, and a Learning Receipt that supports a follow-up conversation.

## What we learned

The most meaningful AI education interaction may be the one that slows a model down. Clear boundaries—what AI contributes, what the child contributes, what evidence was checked, and what remains unknown—make the experience more trustworthy without pretending it can deliver certainty.

We also learned that a demo can show real model capability while still designing for failure: reliable bundled content, structured output, and honest limitations make live AI safer and easier to evaluate.

## What’s next for Before You Believe It

Next we would add human-reviewed, source-aware MissionPacks and a server-side GPT-5.6 Agents SDK manager flow: a Mission Director would coordinate an Inquiry Designer, Skeptic, and Evidence Guardian, then validate the result before it ever reaches the canvas. We would also conduct parent-and-child usability sessions and add durable rate limiting before making live generation broadly available.

## Built with

OpenAI GPT-5.6, OpenAI Responses API, OpenAI Codex, Vercel Serverless Functions, HTML, CSS, JavaScript, Node.js, Playwright.

## Judge instructions (paste into Devpost’s private optional field)

The static Floating City mission is complete with no login or code. To try the live path, enter the current judge access code in **Live demo access**, then submit any general topic and age band — GPT-5.6 builds a fresh five-step mission on that topic in ~15 seconds. Use no child names or private details. The server calls GPT-5.6 only after signed reviewer access; the child’s working answer is never sent.

**Judge access code:** `PASTE_CURRENT_CODE_HERE`

Keep `OPENAI_API_KEY`, `DEMO_ACCESS_TOKEN`, and model access configured through the end of the judging period. Do not publish the code, commit it to this repository, or include it in the video.

## Production access plan

The temporary `BEFORE_YOU_BELIEVE_PRODUCTION_CAPTURE_BYPASS` exists only to record a live request without revealing a code. Before publishing the submission, remove that variable from Production and redeploy. Restore the normal signed judge-code gate, then put the current code in Devpost’s private judge-instructions field above. This keeps the full static mission openly testable and lets reviewers exercise the live GPT-5.6 path without exposing a paid endpoint to the public.

## Required Devpost checklist

- [ ] Choose **Education**.
- [ ] Add a YouTube video URL — public, or unlisted is OK (under 3 minutes; audio names both Codex and GPT-5.6).
- [ ] Add the repository URL above.
- [ ] Paste the current Codex `/feedback` Session ID in the required field.
- [ ] Select submitter type and country.
- [ ] Replace `PASTE_CURRENT_CODE_HERE` only in Devpost’s private judge-instructions field; do not save the code in Git.
- [ ] Remove the production capture bypass, confirm the normal code gate works, and keep the API key/model access funded through judging.
