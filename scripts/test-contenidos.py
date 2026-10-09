from playwright.sync_api import sync_playwright,expect
from pathlib import Path
import json,re,os
base=os.environ.get('SI_TEST_URL', 'http://localhost:3108')
out=Path(__file__).resolve().parents[1]/'audit/contenidos';out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(headless=True);page=b.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(base+'/contenidos',wait_until='networkidle',timeout=120000)
 assert page.locator('iframe').count()==0,'Players must stay lazy'
 page.screenshot(path=str(out/'desktop.png'),full_page=True)
 page.get_by_role('button',name='Reproducir: Charlas que si con Colegas 1',exact=True).first.click()
 expect(page.get_by_role('dialog')).to_be_visible()
 expect(page.locator('dialog iframe')).to_have_attribute('src','https://www.youtube-nocookie.com/embed/XyITUD7dYNU?autoplay=1&rel=0&playsinline=1')
 page.wait_for_timeout(2500)
 print('YouTube iframe:',[(f.url,f.locator('body').inner_text()[:400]) for f in page.frames[1:] if 'youtube' in f.url])
 page.screenshot(path=str(out/'player.png'))
 page.get_by_role('button',name='Cerrar video').press('Escape');expect(page.get_by_role('dialog')).to_have_count(0)
 assert page.evaluate('document.activeElement.getAttribute("aria-label")')=='Reproducir: Charlas que si con Colegas 1'
 page.get_by_role('button',name='Reproducir: Open house en Vida, Funes',exact=True).click()
 expect(page.get_by_role('dialog')).to_be_visible();page.wait_for_timeout(2500)
 print('Instagram iframe:',[(f.url,f.locator('body').inner_text()[:350]) for f in page.frames[1:] if 'instagram' in f.url])
 page.get_by_role('button',name='Cerrar video').click()
 page.get_by_role('navigation',name='Tipos de contenido').get_by_role('link',name='Videos cortos',exact=True).click();page.wait_for_load_state('networkidle')
 expect(page.get_by_role('heading',name='Videos cortos',exact=True)).to_be_visible();assert page.locator('article').count()==24
 page.get_by_role('link',name='Siguiente →',exact=True).click();expect(page).to_have_url(re.compile('pagina=2'));page.wait_for_load_state('networkidle')
 page.go_back(wait_until='networkidle');assert 'pagina=2' not in page.url
 page.get_by_label('Buscar contenidos',exact=True).fill('inexistentezzzz');page.get_by_role('button',name='Buscar',exact=True).click();page.wait_for_load_state('networkidle')
 expect(page.get_by_role('heading',name='No encontramos videos con esa búsqueda.')).to_be_visible()
 page.goto(base+'/contenidos?q=Susana',wait_until='networkidle');expect(page.get_by_role('heading',name='Susana Ippoliti: 43 años de experiencia en el mercado inmobiliario | Charlas Que Si',exact=True)).to_be_visible()
 page.get_by_role('heading',name='Susana Ippoliti: 43 años de experiencia en el mercado inmobiliario | Charlas Que Si',exact=True).get_by_role('link').click();expect(page).to_have_url(re.compile('/hx7wlATWXT0$'));page.wait_for_load_state('networkidle')
 assert page.locator('link[rel="canonical"]').get_attribute('href')=='https://siinmobiliaria.com/contenidos/hx7wlATWXT0'
 page.goto(base+'/contenidos?categoria=blog',wait_until='networkidle');assert page.locator('article').count()>0
 for width in [390,768,1920]:
  page.set_viewport_size({'width':width,'height':844 if width==390 else 1000});page.goto(base+'/contenidos',wait_until='networkidle')
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),f'Overflow {width}'
  page.screenshot(path=str(out/f'width-{width}.png'),full_page=True)
 print('PASS: filters, search, pagination, back, details, canonical, blog, lazy players, dialog close/focus, 390/768/1920 layouts. Errors:',errors)
 assert not errors
 b.close()
