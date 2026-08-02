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
        response = page.goto(BASE_URL + "/propiedades?demo=catalogo-experto", wait_until="domcontentloaded", timeout=40_000)
        page.get_by_text("Del mercado", exact=True).first.wait_for(timeout=30_000)
        if not response or response.status >= 400:
            failures.append(f"listado desktop respondió {response.status if response else 0}")

        # Preferencias: arma una búsqueda exigente sin exponer scoring ni
        # lenguaje técnico en la experiencia pública.
        page.get_by_role("button", name="Personalizar").click()
        page.get_by_role("heading", name="¿Qué propiedad estás buscando?").wait_for()
        page.screenshot(path=str(SHOTS / "preferencias_busqueda_desktop.png"), full_page=True)
        page.get_by_role("button", name=re.compile("Mejor alternativa")).click()
        page.get_by_role("button", name="Funes", exact=True).click()
        page.get_by_role("button", name="Roldán", exact=True).click()
        page.get_by_role("button", name="Casa", exact=True).click()
        page.get_by_label("Presupuesto máximo").fill("400000")
        page.get_by_role("button", name="Ver resultados").click()
        page.get_by_text("Tu búsqueda · 4 propiedades", exact=True).wait_for(timeout=10_000)
        own_heading = page.locator("h2:visible", has_text="Propiedades de SI INMOBILIARIA").first
        market_heading = page.locator("h2:visible", has_text="Otras propiedades del mercado").first
        own_heading.wait_for(timeout=10_000)
        market_heading.wait_for(timeout=10_000)
        if own_heading.bounding_box()["y"] >= market_heading.bounding_box()["y"]:
            failures.append("el stock de SI no aparece antes que las propiedades del mercado")
        if page.get_by_text(re.compile(r"bajo mercado|debajo de la mediana|Oportunidad excepcional"), exact=False).count() > 0:
            failures.append("el listado expone comparaciones de precio que debían quedar internas")
        page.screenshot(path=str(SHOTS / "catalogo_discreto_desktop.png"), full_page=True)

        page.locator('a[href^="/propiedades/8990000001-"]').first.click()
        page.get_by_text("Propiedad del mercado", exact=True).first.wait_for(timeout=30_000)
        page.get_by_role("link", name="Consultar esta propiedad").wait_for(timeout=30_000)
        page.wait_for_timeout(350)  # termina el slide-in antes de la captura visual
        page.screenshot(path=str(SHOTS / "ficha_mercado_discreta_desktop.png"), full_page=True)
        if page.get_by_text(re.compile(r"debajo de la mediana|Oportunidad excepcional|Muy buen valor"), exact=False).count() > 0:
            failures.append("la ficha de mercado expone comparaciones de precio")
        if page.get_by_text("Crear placa", exact=True).count() > 0:
            failures.append("la ficha de mercado ofrece crear placa")

        mobile = browser.new_context(viewport={"width": 390, "height": 844})
        page_mobile = mobile.new_page()
        page_mobile.on("pageerror", lambda exc: page_errors.append(str(exc)))
        page_mobile.goto(BASE_URL + "/propiedades?demo=catalogo-experto", wait_until="domcontentloaded", timeout=40_000)
        page_mobile.get_by_text("Del mercado", exact=True).first.wait_for(timeout=30_000)
        own_mobile = page_mobile.locator("h2:visible", has_text="Propiedades de SI INMOBILIARIA").first
        market_mobile = page_mobile.locator("h2:visible", has_text="Otras propiedades del mercado").first
        if own_mobile.bounding_box()["y"] >= market_mobile.bounding_box()["y"]:
            failures.append("en mobile el stock de SI no aparece antes que el mercado")
        # La etiqueta anterior viene del HTML del servidor; esperamos la
        # hidratación antes de exigir una interacción React.
        page_mobile.wait_for_timeout(1_000)
        page_mobile.get_by_role("button", name="Personalizar").click()
        page_mobile.get_by_role("heading", name="¿Qué propiedad estás buscando?").wait_for()
        page_mobile.screenshot(path=str(SHOTS / "preferencias_busqueda_mobile.png"), full_page=True)
        modal_overflow = page_mobile.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
        if modal_overflow:
            failures.append("el selector experto mobile tiene overflow horizontal")
        page_mobile.get_by_role("button", name="Cerrar preferencias de búsqueda").click()
        page_mobile.locator('a[href^="/propiedades/8990000001-"]').first.click()
        page_mobile.wait_for_url("**/propiedades/8990000001-*", timeout=30_000)
        page_mobile.get_by_text("Consultar disponibilidad", exact=True).wait_for(timeout=30_000)
        page_mobile.screenshot(path=str(SHOTS / "ficha_mercado_discreta_mobile.png"), full_page=True)
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
