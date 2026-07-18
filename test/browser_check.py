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
        console_errors = []
        page = browser.new_page(viewport={"width": 1024, "height": 900})
        page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
        page.goto(base_url, wait_until="networkidle")

        assert page.locator("#mission-title").is_visible()
        assert page.locator("[aria-live='polite']").count() >= 3
        assert page.locator(".path-step[aria-current='step']").inner_text().startswith("01")
        assert_no_horizontal_overflow(page)

        page.locator("[data-think]").nth(1).click()
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
        page.locator("#copy-receipt").click()
        page.wait_for_function("document.querySelector('#receipt-action-status').textContent.trim().length > 0")
        assert page.locator("#receipt-action-status").inner_text()

        page.locator("#restart").click()
        assert page.locator("[data-stage='0']").is_visible()
        assert page.locator("[data-think].selected").count() == 0
        assert console_errors == [], f"console errors: {console_errors}"

        for width in (320, 768, 1024, 1440):
            responsive_page = browser.new_page(viewport={"width": width, "height": 900})
            responsive_page.goto(base_url, wait_until="networkidle")
            assert responsive_page.locator("#mission-title").is_visible()
            assert_no_horizontal_overflow(responsive_page)
            responsive_page.close()

        reduced_motion = browser.new_page(viewport={"width": 1024, "height": 900}, reduced_motion="reduce")
        reduced_motion.goto(base_url, wait_until="networkidle")
        animation_duration = reduced_motion.locator(".stage.active").evaluate("element => getComputedStyle(element).animationDuration")
        animation_seconds = float(animation_duration.removesuffix("s"))
        assert animation_seconds <= 0.01, f"reduced motion animation duration: {animation_duration}"
        reduced_motion.close()
        browser.close()


if __name__ == "__main__":
    server, thread, base_url = start_server()
    try:
        run_browser_checks(base_url)
    finally:
        server.shutdown()
        server.server_close()
        thread.join()
