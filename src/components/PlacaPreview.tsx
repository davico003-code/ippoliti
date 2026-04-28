interface Spec { num: string; unit: string }

interface BasePreviewProps {
  title: string
  price: string
  operation: string
  propertyType: string
  area: number | null
  rooms: number
  bathrooms: number
  lotSurface?: number | null
  parking?: number
  city?: string
  neighborhood?: string
}

interface Props extends BasePreviewProps {
  photos: string[]
}

interface PillItem { text: string; variant: 'solid' | 'ghost-light' | 'ghost-dark' }

function buildSpecs(p: BasePreviewProps): Spec[] {
  const isLand = /land|terreno|lote/i.test(p.propertyType || '')
  const sp: Spec[] = []
  if (p.area && p.area > 0) sp.push({ num: String(p.area), unit: 'm²' })
  if (!isLand && p.lotSurface && p.lotSurface > 0 && p.lotSurface !== p.area) {
    sp.push({ num: String(p.lotSurface), unit: 'm² lote' })
  }
  if (!isLand && p.rooms > 0) sp.push({ num: String(p.rooms), unit: 'dorm' })
  if (p.bathrooms > 0) sp.push({ num: String(p.bathrooms), unit: `baño${p.bathrooms > 1 ? 's' : ''}` })
  if (!isLand && p.parking && p.parking > 0) sp.push({ num: String(p.parking), unit: 'coch.' })
  return sp
}

function buildPills(p: BasePreviewProps, ghostVariant: 'ghost-light' | 'ghost-dark'): PillItem[] {
  const ol = (p.operation || '').toLowerCase()
  const isRent = ol.includes('alquiler') || ol === 'rent'
  const isTemp = ol.includes('temporar') || ol.includes('temporary')
  const opLabel = isTemp ? 'TEMPORARIO' : isRent ? 'ALQUILER' : 'VENTA'
  const typeLabel = (p.propertyType || '').toUpperCase()
  const placeLabel = (p.neighborhood || p.city || '').toUpperCase()
  const items: PillItem[] = []
  items.push({ text: opLabel, variant: 'solid' })
  if (typeLabel) items.push({ text: typeLabel, variant: ghostVariant })
  if (placeLabel) items.push({ text: placeLabel, variant: ghostVariant })
  return items
}

function FeaturesLine({ specs, color, sepColor }: { specs: Spec[]; color: string; sepColor: string }) {
  if (specs.length === 0) return null
  return (
    <p className="font-poppins" style={{ fontSize: '3.2cqw', color, fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
      {specs.map((s, i) => (
        <span key={i}>
          {i > 0 && <span style={{ color: sepColor, margin: '0 0.5em', fontWeight: 300 }}>·</span>}
          <span style={{ fontWeight: 700 }}>{s.num}</span> {s.unit}
        </span>
      ))}
    </p>
  )
}

function FooterRow({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <div className="flex items-end justify-between" style={{ color: primary }}>
      <div>
        <p className="font-raleway" style={{ fontWeight: 700, fontSize: '2.6cqw', lineHeight: 1 }}>David Flores</p>
        <p className="font-poppins" style={{ color: secondary, fontSize: '2.2cqw', marginTop: '0.4cqw', lineHeight: 1 }}>Mat. N° 0621</p>
      </div>
      <div className="text-right">
        <p className="font-raleway" style={{ fontWeight: 700, fontSize: '2.6cqw', lineHeight: 1 }}>@inmobiliaria.si</p>
        <p className="font-poppins" style={{ color: secondary, fontSize: '2.2cqw', marginTop: '0.4cqw', lineHeight: 1 }}>Consultá por DM</p>
      </div>
    </div>
  )
}

function Pill({ item, ghostVariant }: { item: PillItem; ghostVariant: 'ghost-light' | 'ghost-dark' }) {
  const isSolid = item.variant === 'solid'
  const isLight = ghostVariant === 'ghost-light'
  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: 'var(--font-raleway), Raleway, sans-serif',
    fontWeight: 700,
    fontSize: '2.2cqw',
    letterSpacing: '0.08em',
    padding: '1.3cqw 2.6cqw',
    borderRadius: 999,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  }
  if (isSolid) {
    style.background = '#1A5C38'
    style.color = '#fff'
  } else if (isLight) {
    style.background = 'rgba(255,255,255,0.08)'
    style.color = '#fff'
    style.border = '0.18cqw solid rgba(255,255,255,0.7)'
  } else {
    style.background = 'transparent'
    style.color = '#1a1a1a'
    style.border = '0.18cqw solid rgba(0,0,0,0.2)'
  }
  return <span style={style}>{item.text}</span>
}

function EditorialPreview({ photo, props }: { photo: string | null; props: BasePreviewProps }) {
  const pills = buildPills(props, 'ghost-light')
  const specs = buildSpecs(props)
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl"
      style={{ aspectRatio: '9 / 16', background: '#0d1a12', containerType: 'inline-size' } as React.CSSProperties}
    >
      {photo && (
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${photo})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }}
        />
      )}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.92) 100%)',
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-si-white.png"
        alt=""
        style={{ position: 'absolute', top: '4%', left: '50%', transform: 'translateX(-50%)', height: '4%', width: 'auto' }}
      />
      <div
        className="absolute flex flex-col"
        style={{ left: '7%', right: '7%', bottom: '4%', gap: '2.6cqw' }}
      >
        <div className="flex flex-wrap" style={{ gap: '1.4cqw', marginBottom: '-1.4cqw' }}>
          {pills.map((p, i) => <Pill key={i} item={p} ghostVariant="ghost-light" />)}
        </div>
        <h3
          className="font-raleway"
          style={{
            color: '#fff', fontWeight: 800, fontSize: '5.6cqw',
            lineHeight: 1, letterSpacing: '-0.025em',
            textShadow: '0 0.3cqw 2cqw rgba(0,0,0,0.45)',
            textWrap: 'balance' as React.CSSProperties['textWrap'],
            margin: 0,
          }}
        >
          {props.title}
        </h3>
        <FeaturesLine specs={specs} color="#fff" sepColor="rgba(255,255,255,0.35)" />
        <div style={{ height: 1, background: 'rgba(255,255,255,0.28)' }} />
        <div>
          <p
            className="font-poppins"
            style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '2cqw', letterSpacing: '0.5em', textTransform: 'uppercase', lineHeight: 1, margin: 0 }}
          >PRECIO</p>
          <p
            className="font-poppins"
            style={{
              color: '#fff', fontWeight: 700, fontSize: '6cqw', lineHeight: 1,
              letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums',
              textShadow: '0 0.3cqw 2cqw rgba(0,0,0,0.45)',
              marginTop: '0.7cqw', marginBottom: 0,
            }}
          >{props.price}</p>
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.2)' }} />
        <FooterRow primary="#fff" secondary="rgba(255,255,255,0.7)" />
      </div>
    </div>
  )
}

function SplitPreview({ photos, props }: { photos: string[]; props: BasePreviewProps }) {
  const pills = buildPills(props, 'ghost-dark')
  const specs = buildSpecs(props)
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl"
      style={{ aspectRatio: '9 / 16', background: '#0d1a12', containerType: 'inline-size' } as React.CSSProperties}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '50%',
          backgroundImage: `url(${photos[0]})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute', top: '50%', left: 0, width: '100%', height: '50%',
          backgroundImage: `url(${photos[1]})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '20%',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute', bottom: 0, left: 0, width: '100%', height: '30%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.92), rgba(0,0,0,0.78) 35%, transparent)',
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-si-white.png"
        alt=""
        // 1.4cqw ≈ 15 px sobre canvas de 1080 px — offset óptico replicado del canvas.
        style={{ position: 'absolute', top: '3.4%', left: 'calc(50% + 1.4cqw)', transform: 'translateX(-50%)', height: '3.3%', width: 'auto' }}
      />
      <div
        className="absolute left-0 right-0 bg-white flex flex-col"
        style={{
          top: '50%',
          transform: 'translateY(-50%)',
          height: '18.23%',
          padding: '2.6% 6.6%',
          gap: '2.1cqw',
          boxShadow: '0 0.7cqw 2cqw rgba(0,0,0,0.22)',
          justifyContent: 'center',
        }}
      >
        <div className="flex flex-wrap" style={{ gap: '1.2cqw' }}>
          {pills.map((p, i) => <Pill key={i} item={p} ghostVariant="ghost-dark" />)}
        </div>
        <h3
          className="font-raleway"
          style={{
            color: '#1a1a1a', fontWeight: 700, fontSize: '6cqw',
            lineHeight: 1.05, letterSpacing: '-0.02em',
            textWrap: 'balance' as React.CSSProperties['textWrap'],
            margin: 0,
          }}
        >{props.title}</h3>
        <FeaturesLine specs={specs} color="#1a1a1a" sepColor="rgba(0,0,0,0.35)" />
      </div>
      <div
        className="absolute"
        style={{ left: '7%', right: '7%', bottom: '3.2%', color: '#fff' }}
      >
        <p
          className="font-poppins"
          style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: '2cqw', letterSpacing: '0.5em', textTransform: 'uppercase', lineHeight: 1, margin: 0 }}
        >PRECIO</p>
        <p
          className="font-poppins"
          style={{
            color: '#fff', fontWeight: 700, fontSize: '5.8cqw', lineHeight: 1,
            letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums',
            textShadow: '0 0.3cqw 2cqw rgba(0,0,0,0.5)',
            marginTop: '0.6cqw', marginBottom: 0,
          }}
        >{props.price}</p>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.25)', marginTop: '3cqw', marginBottom: '2.5cqw' }} />
        <FooterRow primary="#fff" secondary="rgba(255,255,255,0.7)" />
      </div>
    </div>
  )
}

export default function PlacaPreview(props: Props) {
  const ph = (props.photos || []).slice(0, 2)
  if (ph.length >= 2) return <SplitPreview photos={ph} props={props} />
  return <EditorialPreview photo={ph[0] ?? null} props={props} />
}
