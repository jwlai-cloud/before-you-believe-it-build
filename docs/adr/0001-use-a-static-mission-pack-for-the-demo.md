# 0001. Use a static MissionPack for the demo

Date: 2026-07-18

Status: Accepted

## Context

The Build Week prototype must work reliably in a live judge demo without an API key. The product brief also requires AI to prepare material and critique reasoning moves without becoming an authority or grader for the child.

## Decision

We will ship the first mission as a fully bundled, deterministic MissionPack rendered by static HTML, CSS, and JavaScript. Any future GPT-5.6 Agents SDK orchestration will run server-side, validate output before release, and preserve this static pack as a fallback.

## Alternatives considered

- **Direct browser model calls:** rejected because they require an API key in the client, make demos dependent on network/runtime behavior, and blur the boundary between the child’s work and AI output.
- **Server-side generation in the first demo:** rejected because it adds failure modes and a validation surface that does not improve the core interaction being judged.
- **A chat-first interface:** rejected because the activity needs an inspectable reasoning trail rather than a conversational transcript.

## Consequences

The demo is stable, inexpensive to host, and easy to inspect. It is limited to one mission until a validated server-side MissionPack pipeline is built. Future content generation needs schema, provenance, age-appropriateness, and non-judgement validation before it can replace the preset.
