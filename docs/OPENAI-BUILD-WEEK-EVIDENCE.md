# OpenAI Build Week evidence

This note maps the submission’s OpenAI claims to the working repository. It is intended for judges who want to verify the implementation quickly.

## GPT-5.6: runtime role

The live reviewer demo uses `gpt-5.6` through the OpenAI Responses API. The model receives only a general parent-supplied topic and age band. It builds a complete, schema-bound five-step reasoning mission — material to question, not an answer for a child:

1. [`live-challenge.js`](../live-challenge.js) builds the request with `model: 'gpt-5.6'`, `reasoning: { effort: 'low' }`, and strict JSON Schema output.
2. The developer instruction prohibits grading, scoring, diagnosis, ranking, persuasion, answer judgment, personal-data requests, and invented citations.
3. [`api/live-challenge.js`](../api/live-challenge.js) checks signed judge access before making any model request by default; capture bypasses are explicit and documented below.
4. The response is schema-validated again before the browser renders it. A malformed result is rejected; [`app.js`](../app.js) renders only validated text nodes.
5. The child’s selected question, evidence choice, and working answer stay in session-only browser storage and are never sent to GPT-5.6.

The static Floating City `MissionPack` remains fully usable if the model, access code, or network is unavailable. That makes the live path an honest enhancement rather than a prerequisite for the educational experience.

For a time-limited recording only, the server supports `BEFORE_YOU_BELIEVE_DEMO_BYPASS=true` when—and only when—Vercel supplies `VERCEL_ENV=preview`. If a protected Preview cannot be recorded, `BEFORE_YOU_BELIEVE_PRODUCTION_CAPTURE_BYPASS=true` is a separate, explicit Production-only switch. It permits unauthenticated live-generation requests and must be removed with a Production redeploy immediately after capture. Neither switch bypasses the API-key requirement.

## Codex: development role

Codex was used to build and refine the production prototype, including:

- the accessible and responsive Think → Push Back → Check → Make → Own canvas;
- deterministic state and Learning Receipt transforms in [`mission-state.js`](../mission-state.js);
- signed, HTTP-only reviewer access in [`demo-access.js`](../demo-access.js);
- GPT-5.6 request and response validation in [`live-challenge.js`](../live-challenge.js);
- the 35-test Node suite and Playwright browser smoke test in [`test/`](../test);
- the deployment, review, and demo artifacts in [`docs/`](.) and [`outputs/`](../outputs).

## Key decisions

| Decision | Why it matters | Evidence |
| --- | --- | --- |
| Keep one complete static MissionPack | A family can always complete the activity; judges do not depend on paid model availability. | [ADR 0001](adr/0001-use-a-static-mission-pack-for-the-demo.md) |
| Put GPT-5.6 behind a server-side boundary | No API key or judge code reaches browser JavaScript; a child’s answer is excluded. | [ADR 0002](adr/0002-add-server-side-live-gpt-challenge.md), [`api/`](../api) |
| Constrain the model output | The UI receives only a validated reasoning challenge, never arbitrary generated HTML or a grading response. | [`live-challenge.js`](../live-challenge.js) |
| Preserve uncertainty in the interface | The product teaches questioning rather than turning the model into an authority. | [`mission-state.js`](../mission-state.js), [`index.html`](../index.html) |

## Video evidence

The submission video uses the same claims and code paths:

- it names **Codex** as the development accelerator and **GPT-5.6** as the runtime challenge-material generator;
- it records a real live GPT-5.6 result after the judge unlock, with a captioned cut during the genuine generation wait;
- it shows the signed access → GPT-5.6 → schema validation → reasoning canvas boundary;
- it never records the judge code, API key, cookie, or a private child response.

See the exact narration and shot list in [`outputs/DEMO-VOICEOVER-SCRIPT-v2.md`](../outputs/DEMO-VOICEOVER-SCRIPT-v2.md) and [`outputs/DEMO-CAPTURE-PLAN-v2.md`](../outputs/DEMO-CAPTURE-PLAN-v2.md).
