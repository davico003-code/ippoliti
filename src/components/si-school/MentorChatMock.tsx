'use client'

import Image from 'next/image'
import styles from './si-school.module.css'

interface MockMessage {
  rol: 'mentor' | 'self'
  texto: string
}

const DEFAULT_THREAD: MockMessage[] = [
  {
    rol: 'mentor',
    texto:
      'Hola. Soy **David Flores**. Te voy a acompañar durante todo SI School. No te voy a hacer la vida fácil, te voy a hacer mejor agente. ¿Empezamos?',
  },
  {
    rol: 'self',
    texto: 'Dale, arrancamos.',
  },
  {
    rol: 'mentor',
    texto:
      'Bien. Antes de cualquier cápsula, una pregunta: si te pidieran resumir en una sola oración a qué se dedica SI, ¿qué dirías?',
  },
]

interface Props {
  thread?: MockMessage[]
}

export default function MentorChatMock({ thread = DEFAULT_THREAD }: Props) {
  return (
    <aside className={styles.mentor} aria-label="Mentor David">
      <div className={styles.mentorHeader}>
        <div className={styles.mentorAvatar}>
          <Image
            src="/si-school/david-mentor.webp"
            alt="David Flores · Mentor SI"
            width={44}
            height={44}
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div>
          <div className={styles.mentorName}>David Flores</div>
          <div className={styles.mentorRole}>
            <span className={styles.mentorDot} aria-hidden />
            Mentor · Modo demo
          </div>
        </div>
      </div>

      <div className={styles.mentorMessages}>
        {thread.map((msg, idx) => (
          <div
            key={idx}
            className={[
              styles.mentorBubble,
              msg.rol === 'self' ? styles.mentorBubbleSelf : '',
            ].join(' ')}
            dangerouslySetInnerHTML={{
              __html: msg.texto.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'),
            }}
          />
        ))}

        <div className={styles.mentorQuickReplies}>
          <button type="button" className={styles.mentorQR} disabled>
            Vendemos propiedades.
          </button>
          <button type="button" className={styles.mentorQR} disabled>
            Construimos conversaciones cualificadas.
          </button>
          <button type="button" className={styles.mentorQR} disabled>
            Otra respuesta…
          </button>
        </div>
      </div>

      <div className={styles.mentorInputWrap}>
        <input
          type="text"
          className={styles.mentorInput}
          placeholder="El Mentor David se activa en la Fase 2"
          disabled
          aria-label="Escribir mensaje al mentor (deshabilitado)"
        />
        <button type="button" className={styles.mentorSendBtn} disabled aria-label="Enviar">
          →
        </button>
      </div>
      <p className={styles.mentorPhaseNote}>
        Fase 1 · Vista mockup. La conversación real con el mentor llega en Fase 2.
      </p>
    </aside>
  )
}
