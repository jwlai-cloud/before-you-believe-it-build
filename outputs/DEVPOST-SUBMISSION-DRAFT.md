# Before You Believe It — Devpost submission draft

**Status:** Human-review draft. Keep the judge access code and the Codex `/feedback` Session ID out of Git; paste them only into the appropriate Devpost fields when submitting.

## Project basics

- **Project name:** Before You Believe It
- **Tagline (115 characters):** A 5-minute parent-child activity helping kids question confident AI claims and build answers they can own together.
- **Category:** Education
- **Public project link:** https://before-you-believe-it-build.vercel.app/
- **Public code:** https://github.com/jwlai-cloud/before-you-believe-it-build
- **Demo video:** _Add the **public** (not unlisted) YouTube URL after upload; it must be less than three minutes._

## Inspiration

AI can give a child a polished answer in seconds. The harder—and more important—skill is knowing how to pause before accepting it. Parents also need a way to see *how* their child is working with AI, without turning family time into a lesson, a surveillance tool, or a test.

We built Before You Believe It as a small weekend ritual: parent and child sit together, bring a claim into the room, ask what it assumes, look for another perspective, and make a provisional answer in the child’s own words. The aim is not to prove AI wrong. It is to practise steering a conversation toward better questions, evidence, and uncertainty.

## What it does

Before You Believe It is a 5–7 minute, five-step reasoning canvas: **Think → Push Back → Check → Make → Own**.

- A child begins with a plausible AI-style claim and chooses the question that makes them pause.
- The family reveals a hidden assumption, compares counter-perspectives and evidence clues, and connects a clue to the claim.
- The child writes a working answer; AI never grades, scores, diagnoses, ranks, or judges it.
- A calm Learning Receipt separates the child’s contribution, limited AI help, evidence checked, uncertainty, and a parent’s next question. The child’s work stays in the browser session.
- A complete, bundled Floating City mission works without a key or live model.
- In the optional reviewer demo, a parent provides a general topic. GPT-5.6 prepares a schema-constrained claim, assumption, clues, parent prompt, and “still open” uncertainty. It prepares material to question—not a recommendation or final answer.

## How we built it

The prototype uses static HTML, CSS, and modern browser JavaScript for a responsive, accessible 2D reasoning canvas. The core mission is a deterministic bundled MissionPack, so the activity remains reliable without a network call.

The live path is a Vercel serverless `POST /api/live-challenge` boundary. A reviewer code is exchanged for a signed, HTTP-only cookie before the server calls the OpenAI Responses API with **GPT-5.6**. The request accepts only a general parent topic and age band; it excludes the child’s answer. Strict JSON Schema plus server-side validation constrain the material that reaches the browser, which renders it as text rather than generated HTML.

We used **Codex** throughout development to accelerate the accessible canvas, deterministic state and Learning Receipt, signed access boundary, GPT-5.6 schema validation, Node and Playwright checks, documentation, review follow-ups, and demo artifacts. The product owner made the key calls to keep the interaction non-judgmental, preserve a static fallback, keep child work local, and make the parent-child conversation—not a model verdict—the centre of the experience.

The repository includes the architecture, ADRs, test commands, evidence map, exact demo script, capture plan, and reviewable still frames.

## Challenges we ran into

The product needed to demonstrate real GPT-5.6 use without making the demo fragile or inviting a child to treat the model as an authority. We solved this by retaining a complete preset mission, limiting live GPT-5.6 to challenge material, constraining its output with a schema, and keeping the child’s answer local.

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

The public static Floating City mission is complete without any login, API key, or special access. For the optional live GPT-5.6 reviewer flow, enter the current judge access code in **Live demo access**, then submit a general topic and age band. Use no child names or private details. The server calls GPT-5.6 only after signed reviewer access; the child’s working answer is not sent.

**Judge access code:** `PASTE_CURRENT_CODE_HERE`

Keep `OPENAI_API_KEY`, `DEMO_ACCESS_TOKEN`, and model access configured through the end of the judging period. Do not publish the code, commit it to this repository, or include it in the video.

## Production access plan

The temporary `BEFORE_YOU_BELIEVE_PRODUCTION_CAPTURE_BYPASS` exists only to record a live request without revealing a code. Before publishing the submission, remove that variable from Production and redeploy. Restore the normal signed judge-code gate, then put the current code in Devpost’s private judge-instructions field above. This keeps the full static mission openly testable and lets reviewers exercise the live GPT-5.6 path without exposing a paid endpoint to the public.

## Required Devpost checklist

- [ ] Choose **Education**.
- [ ] Add a **public, not unlisted** YouTube video URL (less than 3 minutes; audio names both Codex and GPT-5.6).
- [ ] Add the repository URL above.
- [ ] Paste the current Codex `/feedback` Session ID in the required field.
- [ ] Select submitter type and country.
- [ ] Replace `PASTE_CURRENT_CODE_HERE` only in Devpost’s private judge-instructions field; do not save the code in Git.
- [ ] Remove the production capture bypass, confirm the normal code gate works, and keep the API key/model access funded through judging.
