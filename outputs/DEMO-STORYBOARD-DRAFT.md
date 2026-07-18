# Demo storyboard draft — Before You Believe It

**Status:** Human-review draft. Use only if Before You Believe It remains the submission product.

## Single differentiation claim

Before You Believe It turns a short weekend parent-and-child moment with AI into a visible reasoning practice: the child forms the answer while AI supplies bounded challenge material and never becomes the grader.

## Planned 2:40 demo

| Time | Screen | Narration draft | Edit note |
| --- | --- | --- | --- |
| 0:00–0:15 | Title card, then a parent and child opening the mission | “When AI is in the room, family time should not become a moment where a child simply accepts its answer. It can become a five-minute practice in asking better questions.” | Calm title reveal; no generic AI montage. |
| 0:15–0:32 | Think — claim and child-selected question | “We begin with a plausible claim. The child chooses what they want to ask before AI tells them what to think.” | Cursor follows the child’s choice. |
| 0:32–0:50 | Push Back — assumption card | “Next, we make a hidden assumption visible. The point is not to defeat AI; it is to notice what the claim needs to be true.” | Zoom into the assumption split. |
| 0:50–1:10 | Check — evidence and counter-perspective cards | “Together, parent and child connect a clue, a counter-perspective, and the uncertainty that remains.” | Highlight the evidence link. |
| 1:10–1:28 | Make — child writes a working answer | “The child makes a working answer in their own words. That answer stays in the browser; it is not sent to the model.” | Let the sentence appear naturally. |
| 1:28–1:45 | Own — Learning Receipt | “The receipt separates what the child contributed, what AI prepared, what was checked, and the next parent question.” | Hold long enough to read the four sections. |
| 1:45–2:08 | Optional live GPT challenge | “For a live demo, a parent enters only a general topic and age band. GPT-5.6 prepares a bounded claim, assumption, and clues—not a verdict or grade.” | Record one successful generation after explicit approval. |
| 2:08–2:27 | Architecture/sequence visual | “A signed judge-access cookie gates the server-side call. Structured output is validated before it reaches the canvas, and the child’s answer never crosses that boundary.” | Animated request path; show no secrets. |
| 2:27–2:40 | Preset fallback and final card | “If the live model is unavailable, the complete preset mission still works. Before You Believe It helps families practise thinking with AI, not outsourcing it to AI.” | End card with live URL and repository. |

## Evidence cards for the final video

Use only measured or directly verifiable facts:

- Five visible reasoning stages: Think → Push Back → Check → Make → Own.
- 25 Node tests passing at the last recorded check.
- One browser smoke test covering the core static mission flow.
- A static MissionPack remains available without live model access.

Do not show latency, costs, model quality, or safety-rate numbers until they have been measured.

## Capture plan

1. Use the browser automation surface to rehearse each state, capture stills, verify the console, and prepare exact UI inputs.
2. Use Computer Use to operate a clean browser window and macOS screen recording for separate clips: intro, static mission, live generation, and receipt.
3. Assemble clips with `ffmpeg`: concise hard cuts, restrained zooms, readable captions, a single architecture card, and a final CTA.
4. Generate the premium voice-over only after narration timing is locked. The voice should be warm, calm, and conversational; it must not imitate a real person or use a clone without their permission.

## Pending human decisions

1. Confirm the submission product: Before You Believe It or Choice Atlas.
2. Approve one real hosted GPT request for the capture.
3. Choose the target video duration and submission platform limit.
4. Choose/approve the licensed TTS voice and service for final narration.
