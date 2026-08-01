#!/usr/bin/env python3
"""QA visual del contrato público con una oportunidad de mercado simulada."""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3122").rstrip("/")
SHOTS = Path(__file__).parent / "screenshots"
SHOTS.mkdir(exist_ok=True)


def main() -> int:
    failures: list[str] = []
    page_errors: list[str] = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)

        desktop = browser.new_context(viewport={"width": 1440, "height": 1000})
        page = desktop.new_page()
        page.on("pageerror", lambda exc: page_errors.append(str(exc)))
        response = page.goto(BASE_URL + "/propiedades", wait_until="domcontentloaded", timeout=40_000)
        page.get_by_text("Mercado verificado", exact=True).first.wait_for(timeout=30_000)
        if not response or response.status >= 400:
            failures.append(f"listado desktop respondió {response.status if response else 0}")

        # Selector experto: arma una búsqueda exigente y verifica que la
        # oportunidad quede explicada, no solo filtrada.
        page.get_by_role("button", name="Personalizar").click()
        page.get_by_role("heading", name=re.compile("No buscamos")).wait_for()
        page.screenshot(path=str(SHOTS / "selector_experto_desktop.png"), full_page=True)
        page.get_by_role("button", name=re.compile("Oportunidad")).click()
        page.get_by_role("button", name="Funes", exact=True).click()
        page.get_by_role("button", name="Casa", exact=True).click()
        page.get_by_label("Presupuesto máximo").fill("260000")
        page.get_by_role("button", name="Armar mi selección").click()
        page.get_by_text("Tu selección SI · 1 opción", exact=True).wait_for(timeout=10_000)
        page.get_by_text(re.compile(r"\d+%"), exact=True).first.wait_for(timeout=10_000)
        page.screenshot(path=str(SHOTS / "catalogo_mercado_desktop.png"), full_page=True)

        page.locator('a[href^="/propiedades/8772345678901-"]').first.click()
        page.get_by_text("Es una propiedad de otro participante del mercado", exact=False).first.wait_for(timeout=30_000)
        page.screenshot(path=str(SHOTS / "catalogo_mercado_ficha_desktop.png"), full_page=True)
        if page.get_by_text("Crear placa", exact=True).count() > 0:
            failures.append("la ficha de mercado ofrece crear placa")

        mobile = browser.new_context(viewport={"width": 390, "height": 844})
        page_mobile = mobile.new_page()
        page_mobile.on("pageerror", lambda exc: page_errors.append(str(exc)))
        page_mobile.goto(BASE_URL + "/propiedades", wait_until="domcontentloaded", timeout=40_000)
        page_mobile.get_by_text("Mercado verificado", exact=True).first.wait_for(timeout=30_000)
        page_mobile.get_by_role("button", name="Personalizar").click()
        page_mobile.get_by_role("heading", name=re.compile("No buscamos")).wait_for()
        page_mobile.screenshot(path=str(SHOTS / "selector_experto_mobile.png"), full_page=True)
        modal_overflow = page_mobile.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
        if modal_overflow:
            failures.append("el selector experto mobile tiene overflow horizontal")
        page_mobile.get_by_role("button", name="Cerrar selector experto").click()
        page_mobile.locator('a[href^="/propiedades/8772345678901-"]').first.click()
        page_mobile.wait_for_url("**/propiedades/8772345678901-*", timeout=30_000)
        page_mobile.get_by_text("Consultar disponibilidad", exact=True).wait_for(timeout=30_000)
        page_mobile.screenshot(path=str(SHOTS / "catalogo_mercado_ficha_mobile.png"), full_page=True)
        overflow = page_mobile.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
        if overflow:
            failures.append("la ficha mobile tiene overflow horizontal")

        failures.extend(f"pageerror: {error}" for error in page_errors[:5])
        browser.close()

    if failures:
        print("QA catálogo público FALLÓ:")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("QA catálogo público OK — listado y ficha desktop/mobile")
    return 0


if __name__ == "__main__":
    sys.exit(main())
