/**
 * Animaciones del mazo y la PIEL OSCURA (David 5-oct: "pasalo todo a negro, así
 * se sienten en una app"): adentro del Tinder, las hojas y paneles que se
 * escribieron en blanco (instructivo, detalles, elegidas, Quiero conocerla,
 * rescate, el final) se pintan sobre negro desde acá, en un solo lugar. Solo
 * vale dentro de `.mazo-oscuro`: las mismas piezas en la web quedan blancas.
 */
export const ESTILOS_MAZO = `
.mazo-oscuro .bg-white { background-color: #151515 }
.mazo-oscuro .bg-white\\/70 { background-color: rgba(0,0,0,.62) }
.mazo-oscuro .bg-gray-50 { background-color: #1f1f1f }
.mazo-oscuro .bg-gray-100 { background-color: #262626 }
.mazo-oscuro .bg-gray-200 { background-color: #333333 }
.mazo-oscuro .bg-\\[\\#F6F8F6\\] { background-color: #1f1f1f }
.mazo-oscuro .bg-\\[\\#EAF3EE\\] { background-color: rgba(69,217,139,.12) }
.mazo-oscuro .text-gray-900 { color: #ffffff }
.mazo-oscuro .text-gray-800 { color: rgba(255,255,255,.92) }
.mazo-oscuro .text-gray-700 { color: rgba(255,255,255,.82) }
.mazo-oscuro .text-gray-600 { color: rgba(255,255,255,.72) }
.mazo-oscuro .text-gray-500 { color: rgba(255,255,255,.62) }
.mazo-oscuro .text-\\[\\#E0245E\\] { color: #FF7A90 }
.mazo-oscuro .border-gray-100, .mazo-oscuro .border-gray-200 { border-color: rgba(255,255,255,.12) }
.mazo-oscuro .border-gray-300 { border-color: rgba(255,255,255,.25) }
.mazo-oscuro .hover\\:bg-gray-50:hover { background-color: rgba(255,255,255,.06) }
.mazo-oscuro .hover\\:border-gray-300:hover { border-color: rgba(255,255,255,.3) }
.mazo-oscuro input, .mazo-oscuro textarea { color: #ffffff }
.mazo-oscuro input::placeholder, .mazo-oscuro textarea::placeholder { color: rgba(255,255,255,.42) }
.mazo-oscuro .mazo-verde-texto { color: #45D98B !important }
.mazo-oscuro .focus\\:ring-\\[\\#1A5C38\\]:focus { --tw-ring-color: #45D98B }
@keyframes mazo-latido { 0% { transform: scale(1) } 35% { transform: scale(1.45) } 100% { transform: scale(1) } }
@keyframes mazo-aviso { 0% { transform: translateY(-16px); opacity: 0 } 100% { transform: none; opacity: 1 } }
.mazo-latido { animation: mazo-latido 420ms ease-out }
.mazo-aviso { animation: mazo-aviso 220ms ease-out both }
@media (prefers-reduced-motion: reduce) { .mazo-latido, .mazo-aviso { animation: none } }
`
