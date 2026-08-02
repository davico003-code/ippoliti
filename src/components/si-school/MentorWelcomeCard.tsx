'use client'

import Image from 'next/image'
import { useState } from 'react'

const PAPER = '#FAF7F2'
const GREEN = '#1A5C38'
const GOLD = '#B8935A'
const TEXT = '#1A1A1A'
const TEXT_SOFT = '#3F3F46'
const LINE = '#E8E2D6'

const CAPACIDADES_LIST: { n: string; titulo: string; desc: string }[] = [
  { n: '1', titulo: 'Pensar como SI', desc: 'la mentalidad y los principios con los que trabajamos.' },
  { n: '2', titulo: 'Construir presencia y autoridad', desc: 'cómo armás tu marca personal y reputación local.' },
  { n: '3', titulo: 'Captar con criterio SI', desc: 'NURC, la primera reunión, el Acuerdo de Comercialización Digital.' },
  { n: '4', titulo: 'Conducir conversaciones con compradores', desc: 'el sistema de selección con feedback, cómo filtrar, cómo manejar las visitas.' },
  { n: '5', titulo: 'Cerrar operaciones', desc: 'negociación, oferta, referéndum, seña a 48 horas y acompañamiento hasta la escritura.' },
  { n: '6', titulo: 'Sostener la cartera', desc: 'postventa, referidos activos, y cómo construir una carrera de 10 años.' },
]

const POPPINS = 'var(--font-poppins), Poppins, system-ui, sans-serif'
const RALEWAY = 'var(--font-raleway), Raleway, system-ui, sans-serif'

export default function MentorWelcomeCard() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Trigger compacto: abre la bienvenida como popup */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Leer la bienvenida de David"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          width: '100%',
          textAlign: 'left',
          background: PAPER,
          border: `1px solid ${LINE}`,
          borderRadius: 14,
          padding: '12px 16px',
          marginBottom: 20,
          cursor: 'pointer',
          transition: 'border-color .15s, box-shadow .15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = GREEN; e.currentTarget.style.boxShadow = '0 2px 12px rgba(26,92,56,.08)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = LINE; e.currentTarget.style.boxShadow = 'none' }}
      >
        <span style={{ position: 'relative', width: 46, height: 46, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: `2px solid ${LINE}`, background: '#fff' }}>
          <Image src="/si-school/david-mentor.webp" alt="David Flores · Mentor SI" fill sizes="46px" style={{ objectFit: 'cover' }} />
        </span>
        <span style={{ minWidth: 0, flex: 1 }}>
          <span style={{ display: 'block', fontFamily: RALEWAY, fontWeight: 800, fontSize: 15, color: GREEN }}>
            Hola, soy David.
          </span>
          <span style={{ display: 'block', fontFamily: POPPINS, fontSize: 12.5, color: TEXT_SOFT }}>
            Leé la bienvenida antes de arrancar.
          </span>
        </span>
        <span style={{ fontFamily: POPPINS, fontSize: 12.5, fontWeight: 600, color: GREEN, flexShrink: 0 }}>Leer →</span>
      </button>

      {/* Popup */}
      {open && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div
            role="dialog"
            aria-label="Bienvenida del Mentor David"
            style={{ background: PAPER, borderRadius: 18, width: '100%', maxWidth: 680, maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.3)', padding: 'clamp(22px, 4vw, 36px)', position: 'relative' }}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, lineHeight: 1, color: TEXT_SOFT }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
              <span style={{ position: 'relative', width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: `2px solid ${LINE}`, background: '#fff' }}>
                <Image src="/si-school/david-mentor.webp" alt="David Flores · Mentor SI School" fill sizes="64px" style={{ objectFit: 'cover' }} priority />
              </span>
              <h2 style={{ fontFamily: RALEWAY, color: GREEN, fontSize: 'clamp(20px, 2.6vw, 26px)', fontWeight: 800, letterSpacing: '-0.01em', margin: 0 }}>
                Hola, soy David.
              </h2>
            </div>

            <div style={{ color: TEXT, fontFamily: POPPINS, fontSize: 14.5, lineHeight: 1.65 }}>
              <p style={{ margin: '0 0 12px', color: TEXT_SOFT }}>
                Bienvenido a SI School. Si llegaste hasta acá, es porque te sumaste a SI INMOBILIARIA — o
                estás por hacerlo. En cualquiera de los dos casos, lo que viene ahora es lo que va a
                definir cómo arrancás tu carrera con nosotros.
              </p>

              <p style={{ margin: '0 0 12px', color: TEXT_SOFT }}>
                SI School es el programa de onboarding que armamos para que cualquier agente que se suma
                al equipo tenga, en los primeros meses, <strong style={{ color: TEXT }}>el mismo criterio y las mismas herramientas que un agente con años de oficio</strong>. Esto no te ahorra la experiencia — eso lo construye el tiempo. Lo que sí te ahorra son los errores que se cometen por no saber.
              </p>

              <p style={{ margin: '0 0 10px', color: TEXT_SOFT }}>Lo armamos en seis capacidades, en este orden:</p>

              <ul style={{ listStyle: 'none', margin: '0 0 16px', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {CAPACIDADES_LIST.map((cap) => (
                  <li key={cap.n} style={{ color: TEXT_SOFT }}>
                    <strong style={{ color: TEXT }}>{cap.n}. {cap.titulo}</strong> — {cap.desc}
                  </li>
                ))}
              </ul>

              <p style={{ margin: '0 0 12px', color: TEXT_SOFT }}>
                Cada capacidad tiene cápsulas cortas para leer, casos reales para que practiques tu
                criterio, y preguntas para que pienses antes de avanzar.{' '}
                <strong style={{ color: TEXT }}>No es un curso académico</strong> — es un manual de oficio. Volvé a leerlo cuantas veces necesites cuando aparezcan situaciones nuevas.
              </p>

              <p style={{ margin: '0 0 12px', color: TEXT_SOFT }}>
                Te recomiendo arrancar por Capacidad 1 y avanzar en orden. Cada capacidad se desbloquea
                cuando completás la anterior, y eso no es un capricho — es porque lo que aprendas en cada
                una es la base de la siguiente.
              </p>

              <p style={{ margin: '0 0 12px', color: TEXT_SOFT }}>
                Una cosa más.{' '}
                <strong style={{ color: TEXT }}>Este rubro recompensa la constancia más que el talento.</strong>{' '}
                El agente que aguanta 10 años haciendo bien las cosas termina con una carrera que vale la
                pena. El que busca atajos, no. Si te sumaste a SI es porque querés construir algo serio.
                Lo que sigue es el camino.
              </p>

              <p style={{ margin: '0 0 14px', color: TEXT_SOFT }}>Empezá cuando quieras. Yo te acompaño.</p>

              <p style={{ margin: 0, color: GOLD, fontStyle: 'italic', fontFamily: RALEWAY, fontSize: 15.5, fontWeight: 500 }}>
                — David
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
