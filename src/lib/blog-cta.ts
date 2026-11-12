// Cierre de cada nota según su tema: en vez del mismo "La mejor decisión
// comienza con la mejor asesoría" en las 102 notas, el lector termina en la
// herramienta del sitio que le sirve para lo que acaba de leer (auditoría del
// blog, 03-oct-2026). Se infiere del slug y el título; el orden importa (el
// primero que matchea gana).

export interface CierreNota {
  titulo: string
  texto: string
  boton: string
  href: string
}

const WHATSAPP = 'https://wa.me/5493413340916?text=Hola!%20Leí%20una%20nota%20del%20blog%20y%20quería%20consultar'

// Coincidencia al comienzo de cada palabra del slug (evita que
// "supermercados" caiga en "mercado" o "tasas" en "tasa").
function palabras(lista: string): RegExp {
  return new RegExp(`(^|-)(${lista})`)
}

const REGLAS: { patron: RegExp; cierre: (slug: string) => CierreNota }[] = [
  {
    patron: palabras('alquiler|alquilar|alquileres|inquilin'),
    cierre: () => ({
      titulo: '¿Te llegó un aumento de alquiler?',
      texto: 'Cargá el monto, el índice y la fecha de tu contrato y fijate si la cuenta está bien hecha, con los índices oficiales.',
      boton: 'Revisar mi aumento',
      href: '/recursos/ajuste-alquiler',
    }),
  },
  {
    patron: palabras('tasa(-|$)|tasar|tasacion|valuad|precio-venta|fijar-precio|vender|staging|acm|preparar-propiedad|mejoras'),
    cierre: () => ({
      titulo: '¿Cuánto vale hoy tu casa?',
      texto: 'Te armamos la tasación con ventas y publicaciones reales de tu barrio, no con un promedio de la ciudad.',
      boton: 'Pedir una tasación',
      href: '/tasaciones',
    }),
  },
  {
    patron: palabras('construc|obra|steel|seco|arquitect|mano-obra|ladrillo|aislacion|calefaccion|humedad|piletas|autosustentables|domotica|modulares|cac(-|$)'),
    cierre: () => ({
      titulo: '¿Cuánto cuesta construir hoy?',
      texto: 'Mirá el valor actualizado del metro cuadrado de construcción según la calidad de terminación.',
      boton: 'Ver costos de construcción',
      href: '/recursos/costos-de-construccion',
    }),
  },
  {
    patron: palabras('lote|loteo|terreno|infraestructura|drenaje|valor-barrio'),
    cierre: (slug) => {
      const funes = /funes/.test(slug) && !/roldan/.test(slug)
      return {
        titulo: funes ? 'Lotes disponibles en Funes' : 'Lotes disponibles en Roldán',
        texto: 'Precio, medidas y servicios de cada lote que tenemos hoy, para comparar con lo que leíste.',
        boton: 'Ver lotes',
        href: funes ? '/terrenos-funes' : '/terrenos-roldan',
      }
    },
  },
  {
    patron: palabras('escritura|escriban|herencia|donacion|transferir'),
    cierre: () => ({
      titulo: '¿Tenés un caso puntual?',
      texto: 'Escribinos con los papeles a mano y lo miramos juntos.',
      boton: 'Consultar por WhatsApp',
      href: WHATSAPP,
    }),
  },
  {
    patron: palabras('hipotec|credito|financiacion|tasas|dolar|mercado|inversion|invertir|rendir|pozo|m2|tokeniz|desarrollo|precio-cerrado'),
    cierre: () => ({
      titulo: 'Los números del mercado, al día',
      // Lo que muestra /informes hoy (el costo de construcción no tiene fuente y no se ve).
      texto: 'Dólar, inflación y el índice de ajuste de alquileres, actualizados cada semana en un solo tablero.',
      boton: 'Ver informes',
      href: '/informes',
    }),
  },
]

const POR_DEFECTO: CierreNota = {
  titulo: '¿Buscás casa en Funes o Roldán?',
  texto: 'Todas las propiedades en venta y alquiler, con filtros por barrio, precio y dormitorios.',
  boton: 'Ver propiedades',
  href: '/propiedades',
}

export function cierreDeNota(slug: string, titulo: string): CierreNota {
  const texto = `${slug} ${titulo.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-')}`
  const regla = REGLAS.find((r) => r.patron.test(texto))
  return regla ? regla.cierre(slug) : POR_DEFECTO
}

export const WHATSAPP_BLOG = WHATSAPP
