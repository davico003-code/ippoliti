# SI School — Fase 1 (Nivel 2) · Resumen

Rama: `feat/si-school` (NO mergeada a `main` — requiere validación visual).
Generado en sesión autónoma de Claude Opus 4.7 según prompt de David
(2026-05-17).

---

## Qué se completó

### Contenido (Capacidad I)

- `_source-capacidad-01.md` particionado en archivos individuales con
  frontmatter YAML bajo `src/content/si-school/capacidad-01/`:
  - 7 cápsulas (Bienvenida, Frase fundacional, 3 principios, Mapa del
    sistema, ABC del negocio).
  - 3 casos de defensa de criterio (`casos/01-oferta-imposible.md`,
    `casos/02-lead-web.md`, `casos/03-cliente-cerrado.md`).
  - `regla-de-oro.md`, `preguntas-comprension.md`, `cierre.md`.
- **Texto exacto del source**, sin reescrituras ni paráfrasis.
- 5 capacidades restantes (II-VI) tienen metadata + directorio
  placeholder, esperan a Fase 2.

### Estructura técnica

- `/recursos/si-school` — overview con grid 2-col de capacidades + CTA
  contextual ("Empezar Capacidad I" / "Continuar").
- `/recursos/si-school/capacidad/[slug]` — vista de capacidad con
  hero (romano gigante de fondo, meta), lista de cápsulas expandibles
  inline, regla de oro, grid de casos, cierre. Bloquea si la previa no
  está completa.
- `/recursos/si-school/capacidad/[slug]/caso/[caso]` — vista de caso
  con escenario, cita textual, tarea, textarea de respuesta con autosave
  cada 5s, criterios de evaluación visibles, botón "Enviar respuesta"
  que guarda la submission y muestra confirmación honesta ("el Mentor
  evalúa en Fase 2").
- `/recursos/si-school/progreso` — stats + timeline + reset.

### Componentes (`src/components/si-school/`)

- `TeamCodeGate.tsx` — gate de auth (reutiliza key `si_team_access`
  compartida con `/recursos/autorizaciones`).
- `SiSchoolShell.tsx` — shell 3-col (sidebar 280px + center + mentor
  360px) con topbar y drawers mobile.
- `CapacidadSidebar.tsx`, `LevelCard.tsx`, `MentorChatMock.tsx`,
  `CapsulaCard.tsx`, `CasoCard.tsx`, `ReglaDeOro.tsx`, `WelcomeTour.tsx`.
- 2 módulos CSS: `si-school.module.css` (tokens + shell) y
  `content.module.css` (prose, hero, casos, regla).

### Libs (`src/lib/si-school/`)

- `types.ts` — Capacidad, Capsula, Caso, AgentProgress, Level,
  PreguntaComprension, CasoSubmission.
- `content.ts` — loader server-side con gray-matter + remark +
  remark-html. Funciones: `getCapacidadesMeta`, `getCapacidad`,
  `getCapacidadMeta`, `getCapsula`, `getCaso`.
- `progress.ts` — persistencia en localStorage. Funciones:
  `getProgress`, `markCapsulaDone`, `markCasoSubmitted`,
  `saveCasoDraft`, `getCasoDraft`, `getCasoSubmission`,
  `getCapacidadProgress`, `getLevel`, `getDiasActivo`, `markTourDone`,
  `resetProgress`. Eventos: dispara `'si-school-progress-updated'` en
  cada write.

### Integración

- Link en dashboard de agentes (`/agentes`, card "SI School ·
  Sistema operativo del agente" con accent gold #B8935A) entre
  selecciones y módulos.
- `robots.ts`: `/recursos/si-school/` agregado al `disallow`.
- Metadata `robots: { index: false, follow: false, nocache: true }` en
  cada page.tsx de SI School.
- Tour de bienvenida de 5 pasos con dismiss persistente
  (`si_school_progress.tourDone`).

### Dependencias agregadas

- `gray-matter@4.0.3`
- `remark@15.0.1`
- `remark-html@16.0.1`

Sin otras dependencias. Sin conexión a Anthropic/OpenAI/Twilio/Redis
en esta fase.

---

## QA checklist

- [x] Login con SI_TEAM_CODE funciona (reusa `si_team_access`).
- [x] Las 7 cápsulas de Cap I renderizan correctamente (markdown
      parseado vía remark; verificado en test runtime del loader).
- [x] Los 3 casos de Cap I tienen textarea funcional con autosave
      cada 5s + flag de submission permanente.
- [x] Capacidades II-VI muestran como "bloqueadas" en sidebar y
      overview, y no son linkables (sólo divs `aria-disabled`).
- [x] Tour de bienvenida aparece la primera vez y no se repite
      (`tourDone` en localStorage).
- [x] Progreso persiste entre sesiones (`localStorage.si_school_progress`).
- [x] Mentor mock muestra disclaimer "Fase 2" claramente (input
      `disabled` con placeholder explícito + nota al pie).
- [x] `noindex` configurado en metadata de todas las páginas + `robots.ts`.
- [x] `npm run build` pasa sin errores.
- [x] `npx tsc --noEmit` pasa sin errores.
- [x] `next lint` pasa sin warnings (pre-push hook confirmó).
- [ ] Mobile responsive validado en 375px, 768px, 1180px → **pendiente
      de validación visual de David en preview**. CSS implementado:
      <960px sidebar + mentor colapsan, drawer/sheet desde botones
      flotantes; <720px center reduce padding.
- [ ] OG image y favicon específicos de SI School → TODO Fase 2
      (no crítico para uso interno).
- [ ] Capacidad II-VI con contenido completo → Fase 2.

---

## Preview de Vercel

Rama pusheada a GitHub. URL del preview de Vercel — alias por branch
determinístico:

```
https://ippoliti-git-feat-si-school-davico-003-5861s-projects.vercel.app/recursos/si-school
```

Si el alias por branch no estuviera disponible (Vercel a veces los
genera con sufijo aleatorio), la URL exacta se ve con:

```
vercel ls ippoliti | head -6
```

Rutas a verificar visualmente:

1. `/recursos/si-school` — overview + tour de bienvenida.
2. `/recursos/si-school/capacidad/capacidad-01` — vista de Capacidad I
   con las 7 cápsulas + casos + regla.
3. `/recursos/si-school/capacidad/capacidad-01/caso/01-oferta-imposible`
   — vista de caso con textarea + autosave.
4. `/recursos/si-school/capacidad/capacidad-02` — debe mostrar
   "bloqueada".
5. `/recursos/si-school/progreso` — timeline.
6. `/agentes` — verificar que la card de SI School aparece bajo
   "Selecciones activas".

---

## TODOs para Fase 2

### Mentor IA real

- Endpoint API `/api/si-school/mentor` con Anthropic SDK.
- System prompt construido con: contenido de cápsulas + criterios de
  caso + frase fundacional + 3 principios + voz de David Flores.
- Streaming a `MentorChatMock` (renombrar a `MentorChat`).
- Habilitar quick replies, input y send button.
- Persistir conversación por agente (Redis) — clave por team_code.

### Evaluación real de casos

- Al enviar una respuesta, llamar al endpoint del Mentor IA con la
  consigna del caso + los criterios + la respuesta del agente.
- Devolver: aprobado / a reintento / sugerencias específicas por
  criterio.
- Si aprobado, marcar caso como "evaluado" en el progreso. Tres casos
  aprobados ⇒ desbloqueo de la siguiente capacidad.

### Capacidades II a VI

- David provee `_source-capacidad-02.md` ... `_source-capacidad-06.md`
  con el mismo formato. Aplicar el mismo split. La metadata ya está
  lista en `src/content/si-school/capacidades.ts` — solo cargar los MD
  reales en cada directorio.
- Actualizar `TOTAL_CAPSULAS_PER_CAP` con el número real de cada cap.

### Persistencia server-side

- Mover progreso de localStorage a Redis (Upstash) con
  `team_code` como clave o algo más fino (agentId).
- API: `GET /api/si-school/progress`, `POST /api/si-school/progress/capsula`,
  `POST /api/si-school/progress/caso`.
- Mantener localStorage como caché optimista.

### Niveles 4 y 5

- Nivel 4 (Referente) requiere "1 operación validada manualmente":
  panel admin para que David marque agentes que hayan cerrado.
- Nivel 5 (Maestro SI) requiere "6 meses sostenidos": cron job.

### Otros nice-to-have

- Búsqueda en topbar (placeholder ya está disabled).
- Animaciones del MentorChat (typing dots).
- Notificaciones cuando se desbloquea una capacidad (toast).
- OG image y favicon específicos de SI School.
- Tests de integración (Playwright) para el flujo crítico:
  gate → overview → cápsula → caso → enviar → progreso.

---

## Blockers registrados durante la ejecución

No se registró ningún blocker. Build, tsc y lint pasaron limpios en
todos los bloques. No fue necesario crear `BLOCKERS.md`.

---

## Commits de la rama

```
b26278e feat(si-school): link en /agentes dashboard
1726342 feat(si-school): vista de progreso del agente
5c1785e feat(si-school): vista overview + capacidad + caso + tour
df9f8f6 feat(si-school): layout 3 columnas + sidebar + mentor mock
a8ae75a feat(si-school): progress lib en localStorage
53b0284 feat(si-school): content loader + Capacidad I cargada
b7f65ff feat(si-school): estructura base + auth + types
```

---

## Decisiones autónomas tomadas

(El usuario me autorizó a tomar decisiones de implementación menores.
Las documento por transparencia.)

1. **Gate de auth reutiliza endpoint `/api/autorizaciones/listar`** en
   lugar de crear un endpoint nuevo. Misma key `si_team_access` en
   localStorage para que el agente no tenga que loguear dos veces.
2. **Tailwind + CSS modules**, no inline-styles puros. Tailwind ya está
   en el repo y se usa en `/recursos`. Los tokens específicos de SI
   School viven en módulos CSS para no contaminar `globals.css`.
3. **Cápsulas expandibles inline** en vez de navegar a una sub-ruta por
   cápsula. Reduce clicks y mantiene contexto del programa. Si se
   prefiere ruta dedicada por cápsula, está implementado a nivel
   loader (`getCapsula`) — solo faltaría agregar el page.tsx.
4. **`force-dynamic` en todas las páginas** porque el gate y el progreso
   son client-side y no tendría sentido pre-renderizarlas.
5. **MentorChatMock con quick-replies y mensajes hardcodeados**, todos
   los inputs `disabled` con texto explícito "se activa en Fase 2".
   No engaña al usuario haciéndole pensar que el chat responde.
6. **Reset progreso disponible en `/progreso`** con `confirm()`.
   Útil durante el QA visual.
7. **Card en `/agentes` con accent gold** para diferenciarla de la
   verde de Selecciones — visualmente nueva pero coherente con la
   paleta.

---

## Cómo seguir

1. David valida visualmente el preview en mobile y desktop.
2. Si todo OK → merge `feat/si-school → main` con `git merge --no-ff`
   (regla del CLAUDE.md). **No hacerlo automáticamente.**
3. Arrancar Fase 2: pegar source de Cap II y conectar Mentor IA.

— Sesión autónoma · 2026-05-17
