import sharp from 'sharp'
import { stat, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DL = '/Users/siinmobiliaria/Downloads'

await mkdir(join(__dirname, '../public/blog/images'), { recursive: true })
await mkdir(join(__dirname, '../public/nosotros'), { recursive: true })

const images = [
  // Batch 1 — nosotros/oficina
  { src: `${DL}/Oficina funes.JPG`, out: 'public/nosotros/si-inmobiliaria-sala-reuniones-funes.webp', w: 1200 },
  { src: `${DL}/oficina funes 3.JPG`, out: 'public/nosotros/si-inmobiliaria-oficina-funes-interior.webp', w: 1200 },
  { src: `${DL}/Oficina.JPG`, out: 'public/nosotros/si-inmobiliaria-oficina-escritorios.webp', w: 1200 },
  { src: `${DL}/IMG_6335.JPG`, out: 'public/nosotros/si-inmobiliaria-logo-oficina.webp', w: 900 },
  // Batch 1 — blog
  { src: `${DL}/cadaques.jpeg`, out: 'public/blog/images/funes-barrios-nuevos-aereo.webp', w: 1200 },
  { src: `${DL}/Funes aerea .jpeg`, out: 'public/blog/images/funes-zona-residencial-arboles-aereo.webp', w: 1920 },
  { src: `${DL}/Funes aerea.jpeg`, out: 'public/blog/images/funes-casas-piletas-barrios-aereo.webp', w: 1920 },
  { src: `${DL}/arboles.jpeg`, out: 'public/blog/images/funes-avenida-arbolada-campo.webp', w: 1200 },
  // Batch 2 — blog aéreas
  { src: `${DL}/dji_fly_20260111_171418_0231_1768162827988_photo.jpeg`, out: 'public/blog/images/funes-vista-aerea-barrios-2026.webp', w: 1200 },
  { src: `${DL}/las tardes.jpeg`, out: 'public/blog/images/roldan-vista-aerea-autopista.webp', w: 1200 },
  { src: `${DL}/Atardeceres fincas 2.jpeg`, out: 'public/blog/images/funes-roldan-zona-oeste-aerea.webp', w: 1200 },
  { src: `${DL}/Las tardes roldan.jpeg`, out: 'public/blog/images/roldan-vista-aerea-panoramica.webp', w: 1200 },
  { src: `${DL}/dji_fly_20260319_101816_0636_1773927485660_photo.jpeg`, out: 'public/blog/images/funes-autopista-acceso-aerea.webp', w: 1200 },
  { src: `${DL}/Funes.jpeg`, out: 'public/blog/images/funes-barrios-arbolados-aerea.webp', w: 1920 },
  // Batch 1 extra
  { src: `${DL}/PORTADA.jpg`, out: 'public/blog/images/funes-barrio-cerrado-lotes-aereo.webp', w: 1200 },
]

let total = 0
for (const img of images) {
  const outPath = join(__dirname, '..', img.out)
  try {
    await sharp(img.src)
      .resize({ width: img.w, withoutEnlargement: true })
      .webp({ quality: 85, effort: 6 })
      .toFile(outPath)
    const { size } = await stat(outPath)
    total += size
    console.log(`✓ ${img.out.split('/').pop()} — ${(size/1024).toFixed(0)}KB`)
  } catch(e) {
    console.error(`✗ ${img.src.split('/').pop()}: ${e.message}`)
  }
}
console.log(`\nTotal: ${(total/1024).toFixed(0)}KB en ${images.length} imágenes`)
