import sharp from 'sharp'
import { stat } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../public/nosotros')

const photos = [
  { src: '/Users/siinmobiliaria/Downloads/e0Qi3.jpg', out: 'david-flores-si-inmobiliaria.webp' },
  { src: '/Users/siinmobiliaria/Downloads/H0ZQ5.jpg', out: 'laura-flores-si-inmobiliaria.webp' },
  { src: '/Users/siinmobiliaria/Downloads/yZgXD.jpg', out: 'susana-ippoliti-si-inmobiliaria.webp' },
]

for (const p of photos) {
  try {
    await sharp(p.src)
      .resize({ width: 600, height: 800, fit: 'cover', position: 'top' })
      .webp({ quality: 88 })
      .toFile(join(OUT, p.out))
    const { size } = await stat(join(OUT, p.out))
    console.log(`✓ ${p.out} — ${(size/1024).toFixed(0)}KB`)
  } catch(e) {
    console.error(`✗ ${p.src.split('/').pop()}: ${e.message}`)
  }
}
