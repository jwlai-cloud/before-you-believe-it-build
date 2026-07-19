# Before You Believe It UI review — 2026-07-19

## Production check

**Target:** `https://before-you-believe-it-build.vercel.app/`

The public opening is visually polished and its core proposition is understandable:

- a persistent five-step path communicates the activity’s shape;
- the first claim is explicitly framed as plausible but unproven;
- the child is invited to choose a question, rather than produce a correct answer;
- the path promises “No scores here. Just a trail you can retrace.”

The static Think → Push Back transition was exercised in a real browser. Choosing a question produced an affirming, non-evaluative acknowledgement; the next stage exposed a hidden assumption and supplied a parent nudge. The public browser showed no site-originated errors. Warnings were emitted only by the installed 1Password extension.

## Revision on `dev` (not deployed yet)

The first stage now adds a paper-cut “two people, one question” visual and this explicit purpose:

> One small pause to practise thinking together.

> For parents and kids: read an AI claim, notice a question, check a clue, and make something that is true to the child’s own thinking.

The live GPT panel is moved after the bundled claim and child-choice activity. It is relabelled **Live GPT · reviewer demo** and explains that GPT prepares claim material and reasoning clues for an adult and child to question together. It does not present GPT as the answer engine.

## Responsive and motion review

- Existing automated browser coverage exercises 320px, 768px, 1024px, and 1440px with no horizontal overflow.
- The purpose visual uses a subtle question-card bob and staged entrance; the existing reduced-motion rule disables this animation.
- Image generation was unavailable during this pass, so the visual is an original code-native paper-cut illustration rather than an unreviewed stock or externally hosted asset.

## Live demo status

The reviewer access form is present in production. A real GPT generation has **not** been submitted in this review because it requires the judge access code and creates a paid model request. The static mission remains fully usable without it.
