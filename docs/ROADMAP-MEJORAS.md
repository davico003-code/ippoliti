# Roadmap de mejoras — siinmobiliaria.com

Documento de trabajo con ideas priorizadas por **impacto** vs **esfuerzo**.
Esfuerzo: **S** (≤ 1 día) · **M** (2‑5 días) · **L** (> 1 semana).
Impacto: alto · medio · bajo.

---

## Prioridad ALTA (quick wins, listos para empezar)

### 1. Calculadora de hipoteca/financiamiento embebida en la ficha
- **Qué**: panel lateral o colapsable con sliders de precio, pago inicial %, plazo, tasa. Muestra cuota mensual estimada. Puede disparar un lead "Quiero hablar con David sobre financiamiento".
- **Por qué suma**: diferencia vs Zonaprop/Argenprop. Compradores primerizos lo valoran mucho. Lead magnet.
- **Esfuerzo**: S · **Impacto**: alto
- **Presupuesto externo**: ninguno. Fórmula estándar de anualidad.

### 2. Sistema de favoritos (sin cuenta — localStorage + cookie)
- **Qué**: corazón en cada card que guarda IDs favoritos en localStorage. Nueva página `/favoritos` lista lo guardado. Sin login.
- **Por qué suma**: retención. Gente vuelve a ver las guardadas. Sin fricción.
- **Esfuerzo**: S · **Impacto**: alto
- **Presupuesto externo**: ninguno.

### 3. Comparador de propiedades
- **Qué**: seleccionar hasta 3 y ver una tabla side-by-side (precio, m², dorm, baños, ubicación, specs, amenities). URL compartible (`/comparar?ids=1,2,3`).
- **Por qué suma**: ayuda la decisión final, cierra más ventas. Ya existe la base (`compareUrl` en `SimilarProperties.tsx`).
- **Esfuerzo**: M · **Impacto**: alto
- **Presupuesto externo**: ninguno.

### 4. Alertas por email "propiedades nuevas que matcheen mis criterios"
- **Qué**: form "Guardar esta búsqueda" → guarda filtros + email en Redis. Cron diario compara con las nuevas de Tokko y manda un email con matches.
- **Por qué suma**: lead-gen continuo, retención 30/60/90 días. Zillow y Idealista lo hacen.
- **Esfuerzo**: M · **Impacto**: alto
- **Presupuesto externo**: Resend o Postmark (~US$10/mes para volumen chico).

### 5. "¿Cuánto vale mi casa?" (lead magnet para vendedores)
- **Qué**: landing `/cuanto-vale-mi-casa` con form estilo Zillow Zestimate. Capta datos (dirección, m², dorm, estado) + nombre/email/tel. No da número automático — el lead va a David para tasación personalizada en 24h.
- **Por qué suma**: capta vendedores (mejor margen que compradores). Contenido SEO para "tasación funes/roldán/rosario".
- **Esfuerzo**: S · **Impacto**: alto
- **Presupuesto externo**: ninguno.

### 6. Reviews/testimonios de clientes en home y landings
- **Qué**: sección con 6‑10 testimonios reales con foto, nombre, ubicación, estrellas. Schema.org `Review` para rich snippets de Google.
- **Por qué suma**: confianza instantánea + rich snippets (estrellas en resultados de búsqueda).
- **Esfuerzo**: S · **Impacto**: medio-alto
- **Presupuesto externo**: ninguno (requiere pedirles los testimonios a los clientes).

---

## Prioridad MEDIA

### 7. Landings específicas por barrio con contenido (no solo listado)
- **Qué**: además de `/casas-en-venta-funes` (que ya existe), agregar contenido editorial: "Por qué vivir en Funes", tiempos de viaje, escuelas, servicios, precios promedio, propiedades destacadas. Cada landing 800‑1200 palabras.
- **Por qué suma**: long-tail SEO ("vivir en funes", "barrios de roldán"). Genera links internos. Diferencia de competidores que solo listan.
- **Esfuerzo**: M · **Impacto**: alto (3‑6 meses)
- **Presupuesto externo**: opcional un copywriter inmobiliario (~US$50‑100 por landing).

### 8. Video tours embebidos en fichas (más allá de YouTube)
- **Qué**: soporte a videos autohospedados + poster, con `<video preload="metadata">`. Integración con Vimeo si se necesita calidad pro.
- **Por qué suma**: aumenta tiempo en página, conversiones. Zillow y Compass usan video-first.
- **Esfuerzo**: S · **Impacto**: medio
- **Presupuesto externo**: grabación de videos (ya hay producción audiovisual interna: Julian Ruschneider).

### 9. Newsletter mensual con nuevas propiedades y market reports
- **Qué**: registro de email en footer/popup. Cron mensual enviando curated digest. Doble opt-in.
- **Por qué suma**: mantiene la lista caliente. Trae tráfico directo mensual.
- **Esfuerzo**: S · **Impacto**: medio
- **Presupuesto externo**: Resend/Mailchimp free tier.

### 10. Landing específica para inversores (cap rate, rentabilidad)
- **Qué**: filtro "modo inversor" que muestra ROI estimado, cap rate, precio/m². Calculadora de rentabilidad. Propiedades con tag "inversión".
- **Por qué suma**: segmento premium con ticket alto. Actualmente subatendido en Rosario/Funes.
- **Esfuerzo**: M · **Impacto**: medio-alto
- **Presupuesto externo**: ninguno.

### 11. Reporte de mercado mensual descargable (lead magnet)
- **Qué**: PDF auto-generado con stats del mercado (precio promedio por zona, tiempo en mercado, tendencia). Gated: email para descargar.
- **Por qué suma**: posiciona como experto, captura leads cualificados.
- **Esfuerzo**: M · **Impacto**: medio
- **Presupuesto externo**: ninguno (se puede generar con pdfkit o similar).

### 12. Mapa de calor de precios por zona
- **Qué**: overlay en el mapa principal que muestre zonas más caras (rojo) a más accesibles (verde), basado en precio/m² promedio.
- **Por qué suma**: UX única, insight instantáneo para comprador primerizo.
- **Esfuerzo**: M · **Impacto**: medio
- **Presupuesto externo**: ninguno (datos propios del catálogo).

### 13. Chat en vivo (no solo WhatsApp)
- **Qué**: widget de chat web (Tawk.to ya está cargado pero revisar config) con horario de atención y auto-respuesta fuera de horario.
- **Por qué suma**: captura usuarios desktop que no quieren cambiar de app.
- **Esfuerzo**: S · **Impacto**: medio
- **Presupuesto externo**: Tawk.to free o Intercom (pago).

---

## Prioridad BAJA / ESTRATÉGICA (largo plazo)

### 14. Tour virtual / 360° (Matterport-style)
- **Qué**: integración con Matterport o Asteroom para propiedades premium. Embebido en la galería.
- **Por qué suma**: diferenciación para premium (> USD 300k). Reduce visitas inútiles.
- **Esfuerzo**: L · **Impacto**: alto para segmento premium
- **Presupuesto externo**: Matterport Pro3 (~US$5k hardware) o Asteroom (SaaS ~US$30/mes + foto 360 pro).

### 15. Integración con WhatsApp Business API (no solo wa.me)
- **Qué**: respuestas automáticas con catálogo de propiedades dentro de WhatsApp. Templates aprobados.
- **Por qué suma**: escala el canal preferido en LATAM. Segmentación automática.
- **Esfuerzo**: L · **Impacto**: alto
- **Presupuesto externo**: Twilio/360dialog (~US$50/mes + costo por mensaje).

### 16. Sistema de cuentas de usuario (para features avanzadas)
- **Qué**: login con Google/email para favoritos persistentes, alertas guardadas, historial de visitas, dashboard personal.
- **Por qué suma**: base para features 4, 10 y 15. Identificación de leads recurrentes.
- **Esfuerzo**: L · **Impacto**: medio-alto
- **Presupuesto externo**: Auth.js + DB (Vercel Postgres ~US$20/mes) o Clerk/Supabase.

### 17. Tasación automática con ML (Zestimate-lite)
- **Qué**: modelo entrenado con propiedades históricas del catálogo + datos públicos para estimar valor de mercado. No reemplaza al corredor pero engancha al vendedor.
- **Por qué suma**: diferencial grande en Argentina donde nadie lo tiene.
- **Esfuerzo**: L · **Impacto**: medio-alto
- **Presupuesto externo**: modelado ML + datos. Alternativa simple: regresión por comparables del propio catálogo.

### 18. A/B testing de hero y CTAs
- **Qué**: Vercel Edge Config o Optimizely para testear variantes de hero copy / fotos / CTAs.
- **Por qué suma**: mejora conversión medida, no decisiones por intuición.
- **Esfuerzo**: M · **Impacto**: medio (continuo)
- **Presupuesto externo**: Optimizely (pago) o Vercel Edge Config (free tier).

---

## Observaciones de competencia

| Competidor | Qué hacen bien | Lo que podemos copiar |
|---|---|---|
| **Zillow** | Zestimate (tasación ML), mortgage calculator, ficha con gallery Zillow, market insights por zona | Calculadora hipoteca (#1), reports por zona (#7), layout Zillow ya implementado |
| **Redfin** | Agente asignado en cada ficha, tour 3D, school ratings | Mostrar scoring de escuelas cerca (ya tenemos Overpass, falta ranking) |
| **Idealista** (ES) | Mapa interactivo con precio/m², filtros avanzados (vistas, orientación, planta), alertas por email | Mapa de calor (#12), alertas (#4) |
| **Compass** | Storytelling editorial por propiedad, fotos de alta calidad, "neighborhood guides" | Landings por barrio con contenido (#7) |
| **Rightmove** (UK) | Draw-on-map search (dibujá el área que querés), stamp duty calculator | Draw-on-map (L, nice-to-have) |
| **Zonaprop / Argenprop** | Volumen, recordación de marca | Nada especial en UX — nuestra ventaja es diseño y experiencia premium |

---

## Matriz impacto × esfuerzo

```
           ALTO ESFUERZO              BAJO ESFUERZO
         ┌──────────────────┬──────────────────────┐
  ALTO   │ 4. Alertas email │ 1. Calculadora       │
  IMPACTO│ 7. Landings      │ 2. Favoritos         │
         │ 14. Matterport   │ 3. Comparador        │
         │ 16. Cuentas      │ 5. ¿Cuánto vale?     │
         ├──────────────────┼──────────────────────┤
  MEDIO  │ 10. Inversores   │ 6. Reviews + rich    │
  IMPACTO│ 11. PDF report   │ 8. Video tours       │
         │ 17. ML tasación  │ 9. Newsletter        │
         │ 18. A/B testing  │ 13. Chat en vivo     │
         └──────────────────┴──────────────────────┘
```

**Recomendación de orden de ejecución próximos 3 meses:**
1. Calculadora hipoteca (#1) — 1 semana
2. Favoritos (#2) — 3 días
3. "¿Cuánto vale mi casa?" (#5) — 3 días
4. Reviews con schema (#6) — 3 días
5. Comparador (#3) — 1 semana
6. Alertas email (#4) — 2 semanas

Con eso, el sitio queda claramente por encima de cualquier inmobiliaria local y empieza a competir con Zillow/Idealista en features.
