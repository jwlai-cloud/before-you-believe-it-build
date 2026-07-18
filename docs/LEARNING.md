# Tech breakdown — what we used and why

## Semantic HTML, CSS, and browser JavaScript

**What it actually does:** The entire product is rendered by the browser from static files. Semantic landmarks, headings, buttons, forms, and live regions give the activity a usable structure before any visual styles load.

**Why we chose it over alternatives:** A static build keeps a judge demo reliable without an API key, dependency install, or server. This follows [ADR 0001](adr/0001-use-a-static-mission-pack-for-the-demo.md).

**The specific parts used:** HTML `button`, `fieldset`, `label`, `select`, `input`, `aria-live`, CSS media queries including `prefers-reduced-motion` and print rules, and DOM event listeners.

**What surprised us / what we'd tell someone learning this:** A polished interaction does not require a framework, but the cost is that state, focus, and accessibility responsibilities are explicit in the application code. For a single deterministic mission, that clarity is useful rather than burdensome.

**Primary sources used while building:**

- [MDN: HTML](https://developer.mozilla.org/en-US/docs/Web/HTML) — semantic elements and form controls.
- [MDN: CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) — responsive, print, and reduced-motion styling.
- [MDN: ARIA live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-live) — announcing state changes without interrupting a child.

---

## Session storage, clipboard, and printing

**What it actually does:** `sessionStorage` retains the in-progress mission only within the current browser session. The Clipboard API copies the working answer after a user action, and `window.print()` hands printing or PDF saving to the browser.

**Why we chose it over alternatives:** The activity benefits from surviving an accidental refresh, but does not need an account or remote persistence. These browser capabilities preserve that privacy boundary.

**The specific parts used:** `sessionStorage.getItem`, `setItem`, and `removeItem`; `navigator.clipboard.writeText`; and `window.print()`.

**What surprised us / what we'd tell someone learning this:** Clipboard access can be unavailable in some browser contexts, so the UI keeps the receipt visible and explains the fallback rather than treating copy failure as an error.

**Primary sources used while building:**

- [MDN: Window sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) — lifetime and browser-session behavior.
- [MDN: Clipboard writeText](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText) — user-action and secure-context behavior.
- [MDN: Window print](https://developer.mozilla.org/en-US/docs/Web/API/Window/print) — browser-managed printing.

---

## Future validated MissionPack pipeline

**What it actually does:** This is an architecture boundary, not a live integration. A future server-side manager would coordinate specialized agents and release only a schema- and policy-validated MissionPack to the static renderer.

**Why we chose it over alternatives:** Separating creation from rendering lets the product remain reliable and makes “AI helps, child owns the reasoning” enforceable in the system design.

**The specific parts used today:** None in runtime code. The shape is documented in `README.md` and `docs/ARCHITECTURE.md` for a future, validated build.

**What surprised us / what we'd tell someone learning this:** The useful technical constraint is not merely “put the model on the server”; it is validating what the model is allowed to produce before the child ever sees it.

---

## Node test runner and Playwright browser checks

**What it actually does:** The Node test runner proves deterministic state behavior in milliseconds. Playwright drives an isolated Chromium browser against an ephemeral local server to verify the actual HTML, CSS, browser storage, and DOM interactions together.

**Why we chose it over alternatives:** The prototype has a small state model that benefits from unit tests, but responsive layouts and browser-only APIs such as the Clipboard API need runtime coverage. This combines both levels without adding a production dependency.

**The specific parts used:** Node's `node:test` and strict assertions; Playwright Python's Chromium launch, locators, responsive viewports, console listener, reduced-motion context, reload, and click/fill/select interactions.

**What surprised us / what we'd tell someone learning this:** Browser engines may serialize the same CSS duration differently (`0.01ms` becomes `1e-05s` in Chromium). Assertions should test the semantic threshold rather than a browser-specific string representation.

**Primary sources used while building:**

- [Node.js test runner](https://nodejs.org/api/test.html) — built-in unit test APIs.
- [Playwright Python: writing tests](https://playwright.dev/python/docs/writing-tests) — isolated browser contexts and locators.
- [Playwright Python: emulation](https://playwright.dev/python/docs/emulation) — viewport and reduced-motion configuration.
