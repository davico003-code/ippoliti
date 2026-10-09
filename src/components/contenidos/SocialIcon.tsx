import Image from 'next/image'

export default function SocialIcon({ platform, size = 18 }: { platform: string; size?: number }) {
  const name = platform === 'Charlas que Sí' || platform === 'David Flores' ? 'instagram' : platform.toLowerCase()
  if (!['youtube', 'instagram', 'tiktok', 'facebook'].includes(name)) return null
  return <Image src={`/contenidos/${name}.svg`} width={size} height={size} alt="" aria-hidden style={{ flexShrink: 0 }} />
}
