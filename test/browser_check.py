from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]

LIVE_PACK = '''{"challenge":{
"topic":"School gardens",
"claim":"Every school should turn its oval into a food garden because gardens always help students and nature.",
"claim_label":"Gardens always help",
"pause_questions":["What would need to be true for always help to make sense?","Who would look after the garden over the holidays?","What else could the same space be used for?"],
"claim_parts":[
{"fragment":"Every school","hint":"Do all schools have the same space and budget?","assumption_title":"Every school faces the same conditions.","assumption_note":"Schools differ in space, water, time, budget and community needs."},
{"fragment":"always help","hint":"Is always doing too much work?","assumption_title":"Always leaves no room for trade-offs.","assumption_note":"A garden can help some goals while costing time or money for others."},
{"fragment":"students and nature","hint":"Help which students, and how?","assumption_title":"Every student benefits the same way.","assumption_note":"Some students may take part while others rarely use the garden."}
],
"evidence_cards":[
{"label":"SYSTEMS CLUE","title":"Gardens need care","detail":"A garden needs water, tools, time and people to look after it.","check_note":"A garden needs ongoing care, not just planting."},
{"label":"ANOTHER VIEW","title":"Space can be shared","detail":"A school oval can be used for sport, play, shade or growing food.","check_note":"The same space has several possible uses."},
{"label":"QUESTION","title":"Helpful for whom?","detail":"Different students and families may value different uses of the space.","check_note":"People may weigh the benefits differently."}
],
"answer_openings":["I am not sure a school garden always helps because...","A school garden could help in some ways, but...","I would need more information before I said..."],
"answer_reasons":["it needs steady care that someone has to give.","always ignores schools with different needs.","the space could serve other useful purposes too."],
"default_question":"Who would care for it, and who might miss out?",
"parent_prompt":"What would we want to learn before deciding?",
"uncertainty":"Which choice would be fairest for this particular school?"
}}'''


def assert_no_horizontal_overflow(page):
    width = page.evaluate("document.documentElement.scrollWidth")
    viewport = page.evaluate("window.innerWidth")
    assert width <= viewport, f"horizontal overflow: content {width}px, viewport {viewport}px"


def start_server():
    handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, thread, f"http://127.0.0.1:{server.server_address[1]}"


def run_browser_checks(base_url):
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        context = browser.new_context()
        console_errors = []
        page = context.new_page()
        page.set_viewport_size({"width": 1024, "height": 900})
        expected_console_errors = {
            "Failed to load resource: the server responded with a status of 401 (Unauthorized)",
            "Failed to load resource: the server responded with a status of 503 (Service Unavailable)"
        }
        page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" and message.text not in expected_console_errors else None)

        access_authorized = [False]

        def handle_demo_access(route):
            if route.request.method == "POST":
                access_authorized[0] = True
            route.fulfill(status=200, content_type="application/json", body=f'{{"authorized":{str(access_authorized[0]).lower()}}}')

        context.route("**/api/demo-access", handle_demo_access)
        page.goto(base_url, wait_until="networkidle")

        # --- Baseline: the preset Floating City mission works with no live GPT. ---
        assert page.locator("#mission-title").is_visible()
        openai_evidence = page.locator("[data-openai-build-week-evidence]")
        assert openai_evidence.count() == 1
        assert "GPT-5.6" in openai_evidence.inner_text()
        assert "Codex" in openai_evidence.inner_text()
        assert page.locator("#judge-access-form").is_visible()
        assert page.locator("#live-mission-form").is_hidden()
        assert page.locator("[aria-live='polite']").count() >= 3
        assert page.locator(".path-step[aria-current='step']").inner_text().startswith("01")
        assert "Floating cities" in page.locator("#claim-text").inner_text()
        assert_no_horizontal_overflow(page)

        # Work the full preset mission end to end.
        page.locator("[data-think]").nth(1).click()
        assert page.locator("[data-think]").nth(1).get_attribute("aria-pressed") == "true"
        assert page.locator("[data-think]").nth(0).get_attribute("aria-pressed") == "false"
        assert "Would it really leave the land below untouched?" in page.locator("#think-note").inner_text()
        page.locator("#next").click()

        assert page.locator("[data-stage='1']").is_visible()
        page.locator("[data-assumption='untouched']").click()
        assert page.locator("#assumption-card h3").inner_text() == "“Untouched” means no effects at all."
        page.locator("#next").click()

        assert page.locator("[data-stage='2']").is_visible()
        page.locator("[data-evidence]").nth(1).click()
        assert "people and ecosystems" in page.locator("#check-note").inner_text()
        page.locator("#next").click()

        assert page.locator("[data-stage='3']").is_visible()
        page.locator("#opening").select_option(index=1)
        page.locator("#reason").select_option(index=2)
        page.locator("#question").fill("Where would the energy come from?")
        assert "Where would the energy come from?" in page.locator("#answer-text").inner_text()

        page.reload(wait_until="networkidle")
        assert page.locator("[data-stage='3']").is_visible()
        assert page.locator("#question").input_value() == "Where would the energy come from?"
        page.locator("#next").click()

        assert page.locator("[data-stage='4']").is_visible()
        assert "Would it really leave the land below untouched?" in page.locator("#receipt-think").inner_text()
        assert "people and ecosystems" in page.locator("#receipt-evidence").inner_text()
        assert "Where would the energy come from?" in page.locator("#receipt-answer-text").inner_text()
        assert page.locator("#copy-receipt").is_visible()
        assert page.locator("#print-receipt").is_visible()
        page.evaluate("window.__printCalled = false; window.print = () => { window.__printCalled = true; };")
        page.locator("#print-receipt").click()
        assert page.evaluate("window.__printCalled")
        page.locator("#copy-receipt").click()
        page.wait_for_function("document.querySelector('#receipt-action-status').textContent.trim().length > 0")
        assert page.locator("#receipt-action-status").inner_text()
        page.evaluate("""() => Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { writeText: () => Promise.reject(new Error('copy failed')) }
        })""")
        page.locator("#copy-receipt").click()
        page.wait_for_function("document.querySelector('#receipt-action-status').textContent.includes('Copy is unavailable here')")
        assert "Copy is unavailable here" in page.locator("#receipt-action-status").inner_text()

        page.locator("#restart").click()
        assert page.locator("[data-stage='0']").is_visible()
        assert page.locator("[data-think].selected").count() == 0
        assert page.locator("[data-think][aria-pressed='true']").count() == 0

        # --- Live GPT: unlock, tolerate failures, then drive the whole mission. ---
        page.locator("#judge-access-code").fill("judge-demo-token")
        page.locator("#judge-access-form button").click()
        page.wait_for_function("document.querySelector('#live-mission-form').hidden === false")

        # A 503 leaves the preset mission intact.
        context.route("**/api/live-challenge", lambda route: route.fulfill(
            status=503, content_type="application/json",
            body='{"error":"Live GPT is unavailable. The preset mission is ready to use."}'))
        page.locator("#live-topic").fill("School gardens")
        page.locator("#live-mission-form button").click()
        page.wait_for_function("document.querySelector('#live-mission-status').textContent.includes('unavailable')")
        assert "Floating cities" in page.locator("#claim-text").inner_text()
        context.unroute("**/api/live-challenge")

        # A 401 sends the reviewer back to the access gate.
        context.route("**/api/live-challenge", lambda route: route.fulfill(
            status=401, content_type="application/json",
            body='{"error":"Judge access is required to prepare a live challenge."}'))
        page.locator("#live-topic").fill("School gardens")
        page.locator("#live-mission-form button").click()
        page.wait_for_function("document.querySelector('#live-mission-status').textContent.includes('expired')")
        assert page.locator("#judge-access-form").is_visible()
        context.unroute("**/api/live-challenge")

        # Re-unlock and generate a real (mocked) pack that reshapes every step.
        page.locator("#judge-access-code").fill("judge-demo-token")
        page.locator("#judge-access-form button").click()
        page.wait_for_function("document.querySelector('#live-mission-form').hidden === false")
        context.route("**/api/live-challenge", lambda route: route.fulfill(
            status=200, content_type="application/json", body=LIVE_PACK))
        page.locator("#live-topic").fill("School gardens")
        page.locator("#live-mission-form button").click()

        # Stage 0 — Think now shows the generated claim and questions.
        page.wait_for_function("document.querySelector('#claim-text').textContent.includes('food garden')")
        assert page.locator("[data-stage='0']").is_visible()
        assert "always help" in page.locator("[data-think]").nth(0).inner_text()
        assert page.locator("[data-think].selected").count() == 0
        assert_no_horizontal_overflow(page)

        # Stage 1 — Push back shows the generated claim parts and assumptions.
        page.locator("#next").click()
        assert page.locator("[data-stage='1']").is_visible()
        assert "Every school" in page.locator("[data-assumption]").nth(0).inner_text()
        page.locator("[data-assumption]").nth(0).click()
        assert page.locator("#assumption-card h3").inner_text() == "Every school faces the same conditions."
        assert "What would we want to learn" in page.locator("#push-parent-prompt").inner_text()

        # Stage 2 — Check shows the generated evidence clues.
        page.locator("#next").click()
        assert page.locator("[data-stage='2']").is_visible()
        assert "Gardens need care" in page.locator("[data-evidence]").nth(0).inner_text()
        assert "Gardens always help" in page.locator("#mini-claim-text").inner_text()

        # Stage 3 — Make offers the generated answer scaffolds.
        page.locator("#next").click()
        assert page.locator("[data-stage='3']").is_visible()
        opening_options = page.locator("#opening option").all_inner_texts()
        assert any("A school garden could help in some ways" in text for text in opening_options)

        # Stage 4 — Own reflects the topic and its uncertainty.
        page.locator("#next").click()
        assert page.locator("[data-stage='4']").is_visible()
        assert "School gardens" in page.locator("#receipt-title").inner_text()
        assert "fairest for this particular school" in page.locator("#receipt-uncertain").inner_text()

        # Starting over keeps the live topic and clears selections.
        page.locator("#restart").click()
        assert page.locator("[data-stage='0']").is_visible()
        assert "food garden" in page.locator("#claim-text").inner_text()
        assert page.locator("[data-think].selected").count() == 0
        context.unroute("**/api/live-challenge")

        assert console_errors == [], f"console errors: {console_errors}"

        for width in (320, 768, 1024, 1440):
            responsive_page = context.new_page()
            responsive_page.set_viewport_size({"width": width, "height": 900})
            responsive_page.goto(base_url, wait_until="networkidle")
            assert responsive_page.locator("#mission-title").is_visible()
            assert_no_horizontal_overflow(responsive_page)
            responsive_page.close()

        reduced_context = browser.new_context(viewport={"width": 1024, "height": 900}, reduced_motion="reduce")
        reduced_context.route("**/api/demo-access", lambda route: route.fulfill(status=200, content_type="application/json", body='{"authorized":false}'))
        reduced_motion = reduced_context.new_page()
        reduced_motion.goto(base_url, wait_until="networkidle")
        animation_duration = reduced_motion.locator(".stage.active").evaluate("element => getComputedStyle(element).animationDuration")
        animation_seconds = float(animation_duration.removesuffix("s"))
        assert animation_seconds <= 0.01, f"reduced motion animation duration: {animation_duration}"
        reduced_motion.close()
        reduced_context.close()
        context.close()
        browser.close()


if __name__ == "__main__":
    server, thread, base_url = start_server()
    try:
        run_browser_checks(base_url)
    finally:
        server.shutdown()
        server.server_close()
        thread.join()
