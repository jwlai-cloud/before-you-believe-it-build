# Before You Believe It — Devpost story

> One-line: Kids get AI answers in seconds; parents worry it dulls critical thinking. This family app guides them to pause, spot assumptions, weigh evidence, own the answer — with live GPT-5.6 generating a fresh claim to question every time. No judgement, no wrong questions.

## Inspiration

My kids can get a confident-sounding answer from AI in seconds. What they can't get from it is the pause before believing it — the habit of thinking critically and independently instead of just accepting what they're told. I didn't want a filter or a lecture. I wanted a way to sit beside my child and practise that questioning together, without turning family time into a test. So I built a small weekend ritual instead of another chatbot.

## What it does

Before You Believe It is a 5–7 minute parent-and-child reasoning canvas — **not a chat**. A claim moves through five steps: **Think → Push Back → Check → Make → Own**.

- **Live GPT-5.6 is the engine.** A parent enters any general topic and age band, and GPT-5.6 generates a complete reasoning mission **live, in real time** — reshaping all five steps: the claim, the questions that make a child pause, the hidden assumptions, the evidence clues, and the answer scaffolds. **Material to question, never a verdict to obey.** Nothing is pre-scripted: every topic produces a genuinely new mission, and the demo shows the real request running on screen.
- The child chooses the question that makes them pause, weighs the clues, and writes a working answer in their own words. **AI never grades, scores, ranks, or judges it.**
- A Learning Receipt separates four things: what the child thought, what AI helped with, what evidence was checked, and what's still unknown. **The child's answer stays in the browser — it is never sent to the model.**
- A bundled Floating City mission keeps the activity working even if the model is momentarily unavailable, so a live demo never breaks.

The difference: most "AI + kids" tools make the model the authority. This one deliberately **slows the model down** — GPT-5.6 generates the *material to question*, and the family does the reasoning.

## How GPT-5.6 and Codex power the app

**GPT-5.6 — the live reasoning engine (runtime).** When a parent submits a topic, a Vercel serverless function calls the OpenAI **Responses API** with `gpt-5.6`. The request is deliberately constrained: `reasoning: { effort: 'low' }`, `max_output_tokens: 1600`, and a strict `json_schema` (`strict: true`) whose fields drive the entire five-step mission — the claim, three pause questions, three claim parts with their hidden assumptions, three evidence clues, three answer scaffolds, a parent prompt, and one remaining uncertainty. A developer instruction forbids grading, scoring, diagnosis, ranking, persuasion, verdicts, invented citations, and any request for personal data. The server verifies a signed, HTTP-only judge cookie before any model call, times out generously, and re-validates the model's JSON against the schema before the browser renders it as **text nodes only** — never injected HTML. The child's working answer is never included in the request. GPT-5.6 is what makes the activity endlessly replayable: every topic reshapes the whole Think→Own mission into a genuinely new one to question together.

**Codex — the build partner (development).** Codex was hands-on across the whole build: the accessible Think→Push Back→Check→Make→Own canvas, the deterministic mission-state transitions and Learning Receipt transforms (`mission-state.js`), the signed HTTP-only judge-access boundary (`demo-access.js`), the GPT-5.6 request/response validation (`live-challenge.js`), the 35-test Node suite plus a Playwright browser smoke test, the architecture/ADR docs, and the demo artifacts. I made the product calls — keep the interaction non-judgmental, keep the child's work local, and keep the parent-child conversation (not a model verdict) at the centre.

See [`docs/OPENAI-BUILD-WEEK-EVIDENCE.md`](../docs/OPENAI-BUILD-WEEK-EVIDENCE.md) for a claim-to-code map for judges.

## How we built it

Static HTML, CSS, and modern browser JavaScript render a responsive, accessible 2D reasoning canvas. The live path is a Vercel serverless boundary, `POST /api/live-challenge`: a private reviewer code is exchanged for a signed, HTTP-only cookie (2-hour scope) before the server calls GPT-5.6 through the Responses API. The API key lives only in Vercel environment variables and never reaches the browser. Strict JSON Schema plus server-side validation constrain everything the browser receives.

## Challenges we ran into

Showing real GPT-5.6 without making the demo fragile *or* inviting a child to treat the model as an authority. Fix: limit live GPT to challenge *material*, constrain its output with a schema, keep the child's answer local, and keep a bundled mission as a reliability floor so a live demo never dead-ends.

Guarding a paid model endpoint with no database or auth service. Fix: a private reviewer code + short-lived signed cookie. I don't pretend it's durable rate limiting — the repo documents the replay limit and the production path openly, rather than overclaiming.

## Accomplishments that we're proud of

- **Live GPT-5.6, bounded on purpose:** a real model feature that's useful *because* it's constrained — prompts to question, not answers to obey.
- **35 passing Node unit tests + a Playwright browser smoke test** covering full mission flow, session restore, reset, copy fallback, reduced motion, console errors, and responsive overflow at 320 / 768 / 1024 / 1440px.
- **Zero child data leaves the browser** — the child's answer is never sent to GPT-5.6.
- A graceful fallback so the live demo degrades instead of breaking under a flaky network.

## What we learned

The most valuable AI-education interaction may be the one that *slows the model down*. Drawing clear lines — what AI gave, what the child gave, what evidence was checked, what's still open — makes the experience more trustworthy precisely because it stops pretending to be certain. A demo can prove real model capability while designing for failure at the same time.

## What's next for Before You Believe

- Human-reviewed, source-aware GPT-5.6 challenge packs.
- A server-side GPT-5.6 Agents SDK flow: a Mission Director coordinating an Inquiry Designer, Skeptic, and Evidence Guardian, validating output before it ever reaches the canvas.
- Parent-and-child usability sessions, and durable rate limiting before opening live generation to the public.

## Built with

OpenAI GPT-5.6, OpenAI Responses API, OpenAI Codex, Vercel Serverless Functions, HTML, CSS, JavaScript, Node.js, Playwright.
