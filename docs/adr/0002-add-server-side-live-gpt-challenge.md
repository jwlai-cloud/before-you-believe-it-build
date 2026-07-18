# 0002. Add a server-side live GPT challenge path

Date: 2026-07-18

Status: Accepted — supersedes the runtime-only part of ADR 0001

## Context

The static Floating City mission is dependable, but the hackathon demonstration also needs to show real GPT participation. The API key must never reach a browser, and the model must not grade or judge a child.

## Decision

Add an optional Vercel serverless endpoint, `POST /api/live-challenge`, that calls the Responses API with `OPENAI_API_KEY` held in the deployment environment. GPT-5.6 receives only a parent-supplied topic and age band, then returns a schema-constrained reasoning challenge. The browser renders the result through DOM `textContent` operations, never injected HTML.

The generated challenge is a live companion to the bundled five-step mission rather than a replacement for it. If the endpoint, key, network, or model access is unavailable, the UI tells the parent and retains the complete static mission.

## Alternatives considered

- **Direct browser calls:** rejected because they expose credentials and blur the boundary around a child’s data.
- **Unstructured model text:** rejected because the browser needs bounded fields and must reject malformed output.
- **Replacing the preset mission completely:** deferred until the Mission Director’s multi-agent output and evidence validation pipeline are production-ready.

## Consequences

The submission can visibly demonstrate live GPT while keeping the child’s answer local and preserving a no-key fallback. Deployments must configure `OPENAI_API_KEY`, and the parent should enter only a general topic, never personal information. The initial live path uses one structured Responses API call; the documented Agents SDK manager remains the next orchestration step.
