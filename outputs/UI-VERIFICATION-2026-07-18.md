# UI verification — 2026-07-18

**Target:** `https://choice-atlas-lac.vercel.app/`  
**Method:** real in-app browser, desktop viewport, public page only

## Observed working

1. The page loaded over HTTPS and presented the Choice Atlas landing screen.
2. Both route fields accepted edited values:
   - Route A: “Keep growing the Perth design team”
   - Route B: “Take the Berlin studio role”
3. The preset uncertainty map rendered with the updated route labels.
4. The visible fallback covers knowns, assumptions, unknowns, trade-offs, investigation questions, and a “Not yet” field-test path.
5. The browser console returned no errors or warnings during this static interaction.

## Intentionally not exercised

The page reported “GPT-5.6 mapping unlocked” in the test browser. The **Map the uncertainty** action was not submitted, because it would make a billable external model request. No judge access code, cookie, or other credential material was read or recorded.

## Product-fit finding

The checked UI is an adult decision-support experience. It visibly states that it does not predict or recommend a choice, which is a sound boundary for that product. It is nevertheless not evidence for the separate parent-and-child Before You Believe It flow in this repository.

## Evidence

See [choice-atlas-ui-check.jpg](choice-atlas-ui-check.jpg). The capture shows the edited route fields, selected priorities, time horizon, unlocked live-demo state, and preset refresh status.
