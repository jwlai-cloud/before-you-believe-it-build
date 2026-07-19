from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]


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
        context.route("**/api/live-challenge", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='''{"challenge":{"topic":"School gardens","claim":"Every school should turn its oval into a food garden because gardens always help students and nature.","pause_question":"What would need to be true for always help to make sense?","assumption_label":"Every school faces the same conditions.","assumption_note":"Schools can have different space, water, time and community needs.","evidence_cards":[{"label":"SYSTEMS CLUE","title":"Gardens need care","detail":"A garden needs water, tools, time and people to look after it."},{"label":"ANOTHER VIEW","title":"Space can be shared","detail":"A school oval can be used for sport, play, shade or growing food."},{"label":"QUESTION","title":"Helpful for whom?","detail":"Different students may value different uses of the space."}],"parent_prompt":"What would we want to learn before deciding?","uncertainty":"Which choice would be fairest for this particular school?"}}'''
        ))
        access_authorized = [False]

        def handle_demo_access(route):
            if route.request.method == "POST":
                access_authorized[0] = True
            route.fulfill(status=200, content_type="application/json", body=f'{{"authorized":{str(access_authorized[0]).lower()}}}')

        context.route("**/api/demo-access", handle_demo_access)
        page.goto(base_url, wait_until="networkidle")

        assert page.locator("#mission-title").is_visible()
        assert page.locator("#judge-access-form").is_visible()
        assert page.locator("#live-mission-form").is_hidden()
        page.locator("#judge-access-code").fill("judge-demo-token")
        page.locator("#judge-access-form button").click()
        page.wait_for_function("document.querySelector('#live-mission-form').hidden === false")
        assert page.locator("#live-mission-form").is_visible()
        page.locator("#live-topic").fill("School gardens")
        page.locator("#live-mission-form button").click()
        page.wait_for_function("document.querySelector('#live-mission-result').hidden === false")
        assert "Every school should" in page.locator("#live-claim").inner_text()
        assert page.locator("#live-evidence-list li").count() == 3
        context.unroute("**/api/live-challenge")
        context.route("**/api/live-challenge", lambda route: route.fulfill(
            status=401,
            content_type="application/json",
            body='{"error":"Judge access is required to prepare a live challenge."}'
        ))
        page.locator("#live-topic").fill("School gardens again")
        page.locator("#live-mission-form button").click()
        page.wait_for_function("document.querySelector('#live-mission-status').textContent.includes('expired')")
        assert page.locator("#live-mission-result").is_hidden()
        assert page.locator("#judge-access-form").is_visible()
        assert page.locator("#live-mission-form").is_hidden()
        page.locator("#judge-access-code").fill("judge-demo-token")
        page.locator("#judge-access-form button").click()
        page.wait_for_function("document.querySelector('#live-mission-form').hidden === false")
        context.unroute("**/api/live-challenge")
        context.route("**/api/live-challenge", lambda route: route.fulfill(
            status=503,
            content_type="application/json",
            body='{"error":"Live GPT is unavailable. The preset mission is ready to use."}'
        ))
        page.locator("#live-topic").fill("School gardens again")
        page.locator("#live-mission-form button").click()
        page.wait_for_function("document.querySelector('#live-mission-status').textContent.includes('unavailable')")
        assert page.locator("#mission-title").is_visible()
        assert page.locator("[aria-live='polite']").count() >= 3
        assert page.locator(".path-step[aria-current='step']").inner_text().startswith("01")
        assert_no_horizontal_overflow(page)

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
