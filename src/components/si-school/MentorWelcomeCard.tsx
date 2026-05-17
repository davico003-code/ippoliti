import Image from 'next/image'

const PAPER = '#FAF7F2'
const GREEN = '#1A5C38'
const GOLD = '#B8935A'
const TEXT = '#1A1A1A'
const TEXT_SOFT = '#3F3F46'
const LINE = '#E8E2D6'

const CAPACIDADES_LIST: { romano: string; titulo: string; desc: string }[] = [
  { romano: 'I', titulo: 'Pensar como SI', desc: 'la mentalidad y los principios con los que trabajamos.' },
  { romano: 'II', titulo: 'Construir presencia y autoridad', desc: 'cómo armás tu marca personal y reputación local.' },
  { romano: 'III', titulo: 'Captar con criterio SI', desc: 'NURC, la primera reunión, el Acuerdo de Comercialización Digital.' },
  { romano: 'IV', titulo: 'Conducir conversaciones con compradores', desc: 'el sistema de selección con feedback, cómo filtrar, cómo manejar las visitas.' },
  { romano: 'V', titulo: 'Cerrar operaciones', desc: 'negociación, oferta, referéndum, seña a 48 horas y acompañamiento hasta la escritura.' },
  { romano: 'VI', titulo: 'Sostener la cartera', desc: 'postventa, referidos activos, y cómo construir una carrera de 10 años.' },
]

export default function MentorWelcomeCard() {
  return (
    <section
      aria-label="Bienvenida del Mentor David"
      style={{
        background: PAPER,
        border: `1px solid ${LINE}`,
        borderRadius: 18,
        padding: 'clamp(20px, 4vw, 36px)',
        marginBottom: 36,
        boxShadow: '0 2px 12px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'clamp(20px, 3vw, 36px)',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 'clamp(128px, 18vw, 192px)',
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          overflow: 'hidden',
          border: `2px solid ${LINE}`,
          background: '#fff',
          position: 'relative',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
        className="mentor-welcome-photo"
      >
        <Image
          src="/si-school/david-mentor.webp"
          alt="David Flores · Mentor SI School"
          fill
          sizes="(max-width: 768px) 128px, 192px"
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>

      <div
        style={{
          flex: '1 1 320px',
          minWidth: 0,
          color: TEXT,
          fontFamily: 'var(--font-poppins), Poppins, system-ui, sans-serif',
          fontSize: 14.5,
          lineHeight: 1.65,
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-raleway), Raleway, system-ui, sans-serif',
            color: GREEN,
            fontSize: 'clamp(22px, 2.6vw, 28px)',
            fontWeight: 800,
            letterSpacing: '-0.01em',
            margin: '0 0 14px',
          }}
        >
          Hola, soy David.
        </h2>

        <p style={{ margin: '0 0 12px', color: TEXT_SOFT }}>
          Bienvenido a SI School. Si llegaste hasta acá, es porque te sumaste a SI Inmobiliaria — o
          estás por hacerlo. En cualquiera de los dos casos, lo que viene ahora es lo que va a
          definir cómo arrancás tu carrera con nosotros.
        </p>

        <p style={{ margin: '0 0 12px', color: TEXT_SOFT }}>
          SI School es el programa de onboarding que armamos para que cualquier agente que se suma
          al equipo tenga, en los primeros meses, <strong style={{ color: TEXT }}>el mismo criterio y las mismas herramientas que un agente con años de oficio</strong>. Esto no te ahorra la experiencia — eso lo construye el tiempo. Lo que sí te ahorra son los errores que se cometen por no saber.
        </p>

        <p style={{ margin: '0 0 10px', color: TEXT_SOFT }}>Lo armamos en seis capacidades, en este orden:</p>

        <ul
          style={{
            listStyle: 'none',
            margin: '0 0 16px',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {CAPACIDADES_LIST.map((cap) => (
            <li key={cap.romano} style={{ color: TEXT_SOFT }}>
              <strong style={{ color: TEXT }}>
                {cap.romano}. {cap.titulo}
              </strong>{' '}
              — {cap.desc}
            </li>
          ))}
        </ul>

        <p style={{ margin: '0 0 12px', color: TEXT_SOFT }}>
          Cada capacidad tiene cápsulas cortas para leer, casos reales para que practiques tu
          criterio, y preguntas para que pienses antes de avanzar.{' '}
          <strong style={{ color: TEXT }}>No es un curso académico</strong> — es un manual de oficio. Volvé a leerlo cuantas veces necesites cuando aparezcan situaciones nuevas.
        </p>

        <p style={{ margin: '0 0 12px', color: TEXT_SOFT }}>
          Te recomiendo arrancar por Capacidad I y avanzar en orden. Cada capacidad se desbloquea
          cuando completás la anterior, y eso no es un capricho — es porque lo que aprendas en cada
          una es la base de la siguiente.
        </p>

        <p style={{ margin: '0 0 12px', color: TEXT_SOFT }}>
          Una cosa más.{' '}
          <strong style={{ color: TEXT }}>
            Este rubro recompensa la constancia más que el talento.
          </strong>{' '}
          El agente que aguanta 10 años haciendo bien las cosas termina con una carrera que vale la
          pena. El que busca atajos, no. Si te sumaste a SI es porque querés construir algo serio.
          Lo que sigue es el camino.
        </p>

        <p style={{ margin: '0 0 14px', color: TEXT_SOFT }}>Empezá cuando quieras. Yo te acompaño.</p>

        <p
          style={{
            margin: 0,
            color: GOLD,
            fontStyle: 'italic',
            fontFamily: 'var(--font-raleway), Raleway, system-ui, sans-serif',
            fontSize: 15.5,
            fontWeight: 500,
          }}
        >
          — David
        </p>
      </div>

      {/* Override del bloque arriba a mobile: foto centrada arriba, texto debajo */}
      <style>{`
        @media (max-width: 767px) {
          section[aria-label='Bienvenida del Mentor David'] {
            flex-direction: column;
            text-align: left;
          }
          section[aria-label='Bienvenida del Mentor David'] > div:first-of-type {
            width: 128px;
            margin-bottom: 4px;
          }
        }
      `}</style>
    </section>
  )
}
