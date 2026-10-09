from playwright.sync_api import sync_playwright,expect
from pathlib import Path
import json,re,os
base=os.environ.get('SI_TEST_URL', 'http://localhost:3108')
out=Path(__file__).resolve().parents[1]/'audit/contenidos';out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(headless=True);page=b.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append({'message':str(e),'stack':e.stack,'url':page.url}))
 page.goto(base+'/contenidos',wait_until='networkidle',timeout=120000)
 assert page.locator('iframe').count()==0,'Players must stay lazy'
 expect(page.get_by_role('heading',name=re.compile('Gonzalo Sánchez'))).to_be_visible()
 expect(page.get_by_role('heading',name=re.compile('Carlos Olmedo'))).to_be_visible()
 assert page.get_by_role('heading',name=re.compile('Hipólito|Hipolito|Oficina')).count()==0
 assert page.locator('img[src*="tiktok.svg"]').count()>=2
 assert page.locator('img[src*="youtube.svg"]').count()>=2
 assert page.locator('img[src*="instagram.svg"]').count()>=2
 assert page.locator('h1').evaluate("e=>getComputedStyle(e).fontFamily").lower().find('raleway')>=0
 assert page.locator('h1').evaluate("e=>getComputedStyle(e.closest('section').parentElement).backgroundColor")=='rgb(255, 255, 255)'
 page.get_by_role('button',name='Reproducir: Los Robles 210, Funes · placa con voz',exact=True).click()
 expect(page.locator('dialog video')).to_be_visible()
 page.wait_for_function("document.querySelector('dialog video')?.currentTime > 0",timeout=15000)
 print('IA native playback confirmed')
 page.get_by_role('button',name='Cerrar video').click()
 page.get_by_role('button',name='Reproducir: Una casa donde cada detalle está pensado',exact=True).click()
 expect(page.locator('dialog iframe')).to_have_attribute('src',re.compile('tiktok.com/player/v1/7605940004627467532'))
 tt=page.frame_locator('dialog iframe').locator('video')
 expect(tt).to_be_visible(timeout=15000)
 for _ in range(20):
  if tt.evaluate('(v)=>v.currentTime>0 && !v.error'): break
  page.wait_for_timeout(500)
 assert tt.evaluate('(v)=>v.currentTime>0 && !v.error'), 'TikTok playback did not start'
 print('TikTok iframe:',[(f.url,f.locator('body').inner_text()[:450]) for f in page.frames[1:] if 'tiktok' in f.url])
 page.screenshot(path=str(out/'tiktok-player.png'))
 page.get_by_role('button',name='Cerrar video').click()
 for img in page.locator('main img').all():
  img.scroll_into_view_if_needed()
 page.evaluate('window.scrollTo(0,0)')
 page.wait_for_timeout(1000)
 if page.get_by_role('button',name='Cerrar oportunidades',exact=True).is_visible():
  page.get_by_role('button',name='Cerrar oportunidades',exact=True).click()
 page.screenshot(path=str(out/'desktop.png'),full_page=True)
 page.screenshot(path=str(out/'portada.png'))
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
  for img in page.locator('main img').all():
   img.scroll_into_view_if_needed()
  page.evaluate('window.scrollTo(0,0)')
  page.wait_for_timeout(700)
  page.screenshot(path=str(out/f'width-{width}.png'),full_page=True)
 # TikTok may reject one codec and recover with another. Playback is independently asserted above.
 external=[e for e in errors if e['message']=='Failed to load because no supported source was found.' and 'ttwstatic.com/obj/tiktok_web_login_static/tiktok_4d_playback/' in e['stack']]
 application=[e for e in errors if e not in external]
 print('Third-party TikTok codec recovery notices:',external)
 assert not application, application
 print('PASS: branding, featured talks, TikTok/native playback, filters, search, pagination, back, details, canonical, blog, lazy players, dialog close/focus, 390/768/1920 layouts.')
 b.close()
