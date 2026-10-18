// Home: invitación chica a Mundo SI (/contenidos). No muestra videos: repite
// la placa de la portada de Contenidos (misma foto, mismo verde y logo de
// Charlas que Sí) para que al entrar se reconozca. Toda la placa es el link.

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import styles from './MundoSiHome.module.css'

export default function MundoSiHome() {
  return (
    <section className={styles.seccion}>
      <div className={`${styles.wrap} revela`}>
        <div className={styles.placa}>
          <Image
            src="/como-trabajamos/charla-colegas-rodaje.webp"
            alt=""
            fill
            sizes="(max-width: 767px) 100vw, 1360px"
            className={styles.foto}
          />
          <Image src="/contenidos/charlas-que-si.svg" alt="Charlas que Sí" width={172} height={58} className={styles.logo} />
          <div>
            <p className={styles.eyebrow}>Mundo SI</p>
            <h2 className={styles.titulo}>Dale play al mundo SI.</h2>
            <p className={styles.bajada}>Charlas, recorridos y lo que pasa en Funes y Roldán.</p>
            <Link href="/contenidos" className={styles.boton}>
              Entrar a Mundo SI <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
