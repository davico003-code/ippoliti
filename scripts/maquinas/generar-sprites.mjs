#!/usr/bin/env node
// Genera las figuras de public/maquinas/*.svg (tractores y camión de la capa
// animada de Distrito Roldán en la home, ver src/components/home/MaquinasObra.tsx).
//
// Cada vehículo se arma con cajas y ruedas en metros y se proyecta en
// isométrica, que es el ángulo de la aérea: las calles del loteo corren a ±30°.
//   - "frente": avanza hacia abajo a la derecha → se ve frente, lado derecho y techo.
//   - "atras":  avanza hacia arriba a la derecha → se ve cola, lado derecho y techo.
// El componente espeja cada vista para las otras dos direcciones.
//
// Uso: node scripts/maquinas/generar-sprites.mjs

import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const PX = 20 // px de la figura por metro (es vectorial: solo fija el viewBox)
const C30 = Math.cos(Math.PI / 6)
const S30 = 0.5
// Ejes del piso en pantalla (y hacia abajo): A = abajo-derecha, B = abajo-izquierda.
const A = [C30, S30]
const B = [-C30, S30]
const VISTAS = {
  frente: { f: A, r: B }, // adelante = A, derecha = B (hacia la cámara)
  atras: { f: [-B[0], -B[1]], r: A }, // adelante = -B, derecha = A
}
// Luz de arriba a la izquierda (como la aérea): viene de -A y desde arriba.
const LUZ = norm([-0.75, 0.15, 0.9]) // [a, b, arriba] en coordenadas del piso

function norm(v) {
  const l = Math.hypot(...v)
  return v.map((x) => x / l)
}

function hex(c) {
  return [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
}
function sombrear(color, k) {
  const [r, g, b] = hex(color)
  const f = (x) => Math.max(0, Math.min(255, Math.round(x * k)))
  return `rgb(${f(r)},${f(g)},${f(b)})`
}

/** Vehículo en coordenadas propias: f (adelante), r (derecha), z (arriba). */
function proyectar(vista, [f, r, z]) {
  const { f: F, r: R } = VISTAS[vista]
  return [(f * F[0] + r * R[0]) * PX, (f * F[1] + r * R[1] - z) * PX]
}
/** Pasa una dirección del vehículo a [a, b, arriba] del piso. */
function aPiso(vista, [f, r, z]) {
  const { f: F, r: R } = VISTAS[vista]
  // F y R son combinaciones de A y B en pantalla; las recupero en el piso.
  const enAB = (v) => (v === A ? [1, 0] : v === B ? [0, 1] : v[0] === -B[0] && v[1] === -B[1] ? [0, -1] : [-1, 0])
  const [fa, fb] = enAB(F)
  const [ra, rb] = enAB(R)
  return [f * fa + r * ra, f * fb + r * rb, z]
}
/** Profundidad: más chico = más lejos de la cámara (se pinta antes). */
function profundidad(vista, p) {
  const [a, b, z] = aPiso(vista, p)
  return a + b + z * 0.3
}
function luz(vista, normal) {
  const n = aPiso(vista, normal)
  const d = n[0] * LUZ[0] + n[1] * LUZ[1] + n[2] * LUZ[2]
  return 0.58 + 0.5 * Math.max(0, d)
}
function visible(vista, normal) {
  const [a, b, z] = aPiso(vista, normal)
  return a + b + z > 0.01
}

const poly = (pts, fill, extra = '') =>
  `<polygon points="${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}" fill="${fill}"${extra}/>`

/** Caja [f0,f1]×[r0,r1]×[z0,z1]; `caras` pisa el color de una cara (top, front, back, right, left). */
function caja(vista, { f: [f0, f1], r: [r0, r1], z: [z0, z1], color, caras = {}, detalles = [] }) {
  const P = (f, r, z) => proyectar(vista, [f, r, z])
  const lados = [
    { n: [0, 0, 1], k: 'top', pts: [P(f0, r0, z1), P(f1, r0, z1), P(f1, r1, z1), P(f0, r1, z1)] },
    { n: [1, 0, 0], k: 'front', pts: [P(f1, r0, z0), P(f1, r1, z0), P(f1, r1, z1), P(f1, r0, z1)] },
    { n: [-1, 0, 0], k: 'back', pts: [P(f0, r0, z0), P(f0, r1, z0), P(f0, r1, z1), P(f0, r0, z1)] },
    { n: [0, 1, 0], k: 'right', pts: [P(f0, r1, z0), P(f1, r1, z0), P(f1, r1, z1), P(f0, r1, z1)] },
    { n: [0, -1, 0], k: 'left', pts: [P(f0, r0, z0), P(f1, r0, z0), P(f1, r0, z1), P(f0, r0, z1)] },
  ]
  let svg = ''
  for (const l of lados) {
    if (!visible(vista, l.n)) continue
    svg += poly(l.pts, sombrear(caras[l.k] ?? color, luz(vista, l.n)))
    for (const d of detalles.filter((x) => x.cara === l.k)) svg += d.dibujar(vista, l.n)
  }
  return { prof: profundidad(vista, [(f0 + f1) / 2, (r0 + r1) / 2, (z0 + z1) / 2]), svg }
}

/** Ventana (rectángulo) sobre una cara de caja. */
function ventana(cara, puntos, color = '#2c3a42') {
  return {
    cara,
    dibujar: (vista, n) => {
      const pts = puntos.map((p) => proyectar(vista, p))
      return poly(pts, sombrear(color, luz(vista, n) + 0.08))
    },
  }
}

/** Rueda con eje en r: disco exterior visible + banda de rodadura. */
function rueda(vista, { f, r, z, radio, ancho, llanta }) {
  const lado = r >= 0 ? 1 : -1
  const exterior = r + (lado * ancho) / 2
  const interior = r - (lado * ancho) / 2
  const disco = (rr, rad) =>
    Array.from({ length: 28 }, (_, i) => {
      const t = (i / 28) * Math.PI * 2
      return proyectar(vista, [f + Math.cos(t) * rad, rr, z + Math.sin(t) * rad])
    })
  const verExterior = visible(vista, [0, lado, 0])
  const cara = verExterior ? exterior : interior
  const otra = verExterior ? interior : exterior
  // Banda: casco convexo de los dos discos.
  const casco = convexo([...disco(cara, radio), ...disco(otra, radio)])
  let svg = poly(casco, '#1c1b19')
  svg += poly(disco(cara, radio), '#2b2a27')
  if (verExterior) {
    svg += poly(disco(cara, radio * 0.6), sombrear(llanta, 0.95))
    svg += poly(disco(cara, radio * 0.22), sombrear(llanta, 0.7))
  }
  // Las del lado oculto van atrás de todo (se pintan primero).
  return { prof: verExterior ? profundidad(vista, [f, cara, z]) - 0.2 : -99, svg }
}

function convexo(pts) {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cruz = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const abajo = []
  for (const q of p) {
    while (abajo.length >= 2 && cruz(abajo[abajo.length - 2], abajo[abajo.length - 1], q) <= 0) abajo.pop()
    abajo.push(q)
  }
  const arriba = []
  for (const q of p.reverse()) {
    while (arriba.length >= 2 && cruz(arriba[arriba.length - 2], arriba[arriba.length - 1], q) <= 0) arriba.pop()
    arriba.push(q)
  }
  return [...abajo.slice(0, -1), ...arriba.slice(0, -1)]
}

function tractor({ cuerpo, llanta, techo }) {
  return (vista) => {
    const piezas = []
    const R = { radio: 0.85, ancho: 0.5, llanta }
    const F = { radio: 0.5, ancho: 0.32, llanta }
    for (const s of [-1, 1]) {
      piezas.push(rueda(vista, { f: -1.15, r: s * 1.02, z: 0.85, ...R }))
      piezas.push(rueda(vista, { f: 1.35, r: s * 0.8, z: 0.5, ...F }))
    }
    piezas.push(caja(vista, { f: [0.1, 2.05], r: [-0.38, 0.38], z: [0.3, 0.75], color: '#3a3a38' }))
    piezas.push(caja(vista, { f: [-0.4, 2.1], r: [-0.48, 0.48], z: [0.7, 1.55], color: cuerpo, caras: { front: '#2e2e2c' } }))
    for (const s of [-1, 1]) {
      piezas.push(caja(vista, { f: [-1.95, -0.4], r: s > 0 ? [0.72, 1.3] : [-1.3, -0.72], z: [1.62, 1.75], color: cuerpo }))
    }
    piezas.push(
      caja(vista, {
        f: [-1.75, -0.25],
        r: [-0.72, 0.72],
        z: [1.45, 2.55],
        color: cuerpo,
        detalles: [
          ventana('right', [[-1.62, 0.72, 1.85], [-0.38, 0.72, 1.85], [-0.38, 0.72, 2.45], [-1.62, 0.72, 2.45]]),
          ventana('left', [[-1.62, -0.72, 1.85], [-0.38, -0.72, 1.85], [-0.38, -0.72, 2.45], [-1.62, -0.72, 2.45]]),
          ventana('front', [[-0.25, -0.6, 1.8], [-0.25, 0.6, 1.8], [-0.25, 0.6, 2.45], [-0.25, -0.6, 2.45]]),
          ventana('back', [[-1.75, -0.6, 1.8], [-1.75, 0.6, 1.8], [-1.75, 0.6, 2.45], [-1.75, -0.6, 2.45]]),
        ],
      }),
    )
    piezas.push(caja(vista, { f: [-1.85, -0.15], r: [-0.82, 0.82], z: [2.55, 2.7], color: techo }))
    piezas.push(caja(vista, { f: [1.0, 1.1], r: [0.22, 0.32], z: [1.55, 2.5], color: '#2a2a28' }))
    return piezas
  }
}

function camion() {
  return (vista) => {
    const piezas = []
    const W = { radio: 0.55, ancho: 0.42, llanta: '#b9b4ab' }
    for (const s of [-1, 1]) for (const f of [3.05, -1.55, -2.85]) piezas.push(rueda(vista, { f, r: s * 1.0, z: 0.55, ...W }))
    piezas.push(caja(vista, { f: [-3.9, 3.9], r: [-0.9, 0.9], z: [0.55, 0.95], color: '#c2462d' }))
    piezas.push(
      caja(vista, {
        f: [-4.0, 1.95],
        r: [-1.25, 1.25],
        z: [1.0, 2.55],
        color: '#7d7c78',
        caras: { top: '#7b5b3f' },
      }),
    )
    // Lomo de tierra arriba de la caja.
    piezas.push(caja(vista, { f: [-3.4, 1.4], r: [-0.85, 0.85], z: [2.55, 2.8], color: '#86664a' }))
    piezas.push(
      caja(vista, {
        f: [2.1, 4.0],
        r: [-1.2, 1.2],
        z: [0.95, 3.0],
        color: '#efeeea',
        detalles: [
          ventana('front', [[4.0, -1.05, 2.0], [4.0, 1.05, 2.0], [4.0, 1.05, 2.8], [4.0, -1.05, 2.8]]),
          ventana('right', [[2.9, 1.2, 2.0], [3.85, 1.2, 2.0], [3.85, 1.2, 2.8], [2.9, 1.2, 2.8]]),
          ventana('left', [[2.9, -1.2, 2.0], [3.85, -1.2, 2.0], [3.85, -1.2, 2.8], [2.9, -1.2, 2.8]]),
        ],
      }),
    )
    return piezas
  }
}

const MODELOS = {
  'tractor-rojo': tractor({ cuerpo: '#b8302a', llanta: '#cfcac0', techo: '#f1efe9' }),
  'tractor-verde': tractor({ cuerpo: '#2f6e34', llanta: '#e3bd24', techo: '#ece9dc' }),
  camion: camion(),
}

const salida = join(process.cwd(), 'public', 'maquinas')
mkdirSync(salida, { recursive: true })
const medidas = {}
for (const [nombre, armar] of Object.entries(MODELOS)) {
  for (const vista of Object.keys(VISTAS)) {
    const piezas = armar(vista).sort((a, b) => a.prof - b.prof)
    const cuerpo = piezas.map((p) => p.svg).join('')
    // Caja que encierra todo, para centrar la figura en el punto de la ruta.
    const nums = [...cuerpo.matchAll(/(-?\d+\.\d),(-?\d+\.\d)/g)].map((m) => [+m[1], +m[2]])
    const xs = nums.map((p) => p[0])
    const ys = nums.map((p) => p[1])
    const [x0, x1, y0, y1] = [Math.min(...xs) - 2, Math.max(...xs) + 2, Math.min(...ys) - 2, Math.max(...ys) + 2]
    const w = x1 - x0
    const h = y1 - y0
    // El punto de la ruta (centro del vehículo en el piso, que es el 0,0) va
    // en el centro de la figura: corro el viewBox para que quede ahí.
    const cx = Math.max(-x0, x1)
    const cy = Math.max(-y0, y1)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${(-cx).toFixed(1)} ${(-cy).toFixed(1)} ${(2 * cx).toFixed(1)} ${(2 * cy).toFixed(1)}">${cuerpo}</svg>\n`
    writeFileSync(join(salida, `${nombre}-${vista}.svg`), svg)
    medidas[`${nombre}-${vista}`] = { w: +(2 * cx / PX).toFixed(2), h: +(2 * cy / PX).toFixed(2), bbox: [w, h].map((x) => +(x / PX).toFixed(2)) }
  }
}
console.log(JSON.stringify(medidas, null, 1))
