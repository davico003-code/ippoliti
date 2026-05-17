import styles from './content.module.css'

interface Props {
  capacidadRomano: string
  textoHtml: string
}

export default function ReglaDeOro({ capacidadRomano, textoHtml }: Props) {
  return (
    <section className={styles.reglaCard}>
      <div className={styles.reglaEyebrow}>Regla de oro · Capacidad {capacidadRomano}</div>
      <div className={styles.reglaText} dangerouslySetInnerHTML={{ __html: textoHtml }} />
    </section>
  )
}
