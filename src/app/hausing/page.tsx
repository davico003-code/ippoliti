import Image from "next/image"
import Link from "next/link"
import { Shield, Waves, Key, PenTool, DollarSign, TreePine } from "lucide-react"
import { getPropertyById, formatPrice, getAllPhotos, getTotalSurface } from "@/lib/tokko"
import type { TokkoProperty } from "@/lib/tokko"
import HausingAnimations from "@/components/HausingAnimations"

export const revalidate = 3600

const PROPERTY_IDS = [7865564, 7867761, 7868679, 7875941, 7879685, 7872050]

export default async function HausingPage() {
  const properties = (await Promise.all(
    PROPERTY_IDS.map(id => getPropertyById(id).catch(() => null))
  )).filter(Boolean) as TokkoProperty[]

  return (
    <div style={{background:"#000",minHeight:"100vh",color:"#fff",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",overflowX:"hidden"}}>
      <HausingAnimations />
      <style>{`
        .prop-card:hover .prop-img { transform: scale(1.05); }
        .prop-card:hover .prop-arrow { transform: translateX(6px); }
        .prop-img { transition: transform 0.7s cubic-bezier(0.16,1,0.3,1); }
        .prop-arrow { transition: transform 0.3s ease; }
        @media (max-width: 768px) {
          .hero-title { font-size: clamp(42px, 10vw, 80px) !important; }
          .prop-grid { grid-template-columns: 1fr !important; }
          .prop-inner { flex-direction: column !important; min-height: auto !important; }
          .prop-img-wrap { width: 100% !important; height: 280px !important; order: 0 !important; }
          .prop-content { padding: 32px 24px !important; order: 1 !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; gap: 32px !important; }
          .attr-grid { grid-template-columns: repeat(2,1fr) !important; }
          .cta-btns { flex-direction: column !important; align-items: stretch !important; }
          .hero-btns { flex-direction: column !important; align-items: center !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"20px 40px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)",backdropFilter:"blur(20px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",background:"#fff",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#000",fontWeight:900,fontSize:"14px"}}>H</span>
          </div>
          <span style={{color:"#fff",fontWeight:700,fontSize:"15px",letterSpacing:"0.05em"}}>HAUSING</span>
        </div>
        <Link href="/" style={{color:"rgba(255,255,255,0.6)",fontSize:"13px",textDecoration:"none",display:"flex",alignItems:"center",gap:"6px"}}>
          &larr; SI Inmobiliaria
        </Link>
      </nav>

      {/* HERO — parallax */}
      <section data-anim="parallax" style={{height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"0 24px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0}}>
          <div data-parallax-glow style={{position:"absolute",top:"20%",left:"50%",transform:"translateX(-50%)",width:"600px",height:"600px",background:"radial-gradient(ellipse, rgba(34,197,94,0.15) 0%, transparent 70%)",borderRadius:"50%"}} />
        </div>

        <div data-parallax-content style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div data-anim="fade-up" data-delay="100" style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"8px 20px",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"100px",marginBottom:"40px",fontSize:"12px",color:"rgba(255,255,255,0.6)",letterSpacing:"0.12em",textTransform:"uppercase"}}>
            <div style={{width:"6px",height:"6px",borderRadius:"50%",background:"#22c55e"}} />
            Dise&ntilde;o &middot; Calidad &middot; Exclusividad
          </div>

          <h1 data-anim="fade-up" data-delay="200" className="hero-title" style={{fontSize:"clamp(52px,8vw,96px)",fontWeight:900,lineHeight:1.0,margin:"0 0 32px",letterSpacing:"-3px"}}>
            Vivir bien<br/>
            <span style={{background:"linear-gradient(135deg,#86efac,#22c55e,#16a34a)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>empieza aqu&iacute;.</span>
          </h1>

          <p data-anim="fade-up" data-delay="350" style={{fontSize:"clamp(16px,2vw,20px)",color:"rgba(255,255,255,0.5)",maxWidth:"560px",margin:"0 auto 48px",lineHeight:1.7}}>
            Casas de dise&ntilde;o arquitect&oacute;nico en los barrios cerrados m&aacute;s exclusivos de Funes.
            Pileta, terminaciones premium y financiaci&oacute;n en d&oacute;lares.
          </p>

          <div data-anim="fade-up" data-delay="500" className="hero-btns" style={{display:"flex",gap:"16px",justifyContent:"center"}}>
            <a href="#propiedades" style={{padding:"16px 40px",background:"#22c55e",color:"#000",borderRadius:"100px",fontWeight:700,fontSize:"15px",textDecoration:"none"}}>
              Ver propiedades
            </a>
            <a href="https://wa.me/5493412101694?text=Hola!%20Me%20interesan%20las%20propiedades%20Hausing" target="_blank" style={{padding:"16px 40px",background:"rgba(255,255,255,0.07)",color:"#fff",borderRadius:"100px",fontWeight:600,fontSize:"15px",textDecoration:"none",border:"1px solid rgba(255,255,255,0.15)"}}>
              Consultar ahora
            </a>
          </div>
        </div>

        <div style={{position:"absolute",bottom:"40px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:"8px"}}>
          <div style={{width:"1px",height:"50px",background:"linear-gradient(to bottom,rgba(255,255,255,0.4),transparent)"}} />
        </div>
      </section>

      {/* ATRIBUTOS — stagger + hover */}
      <section style={{padding:"80px 24px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{maxWidth:"1000px",margin:"0 auto"}}>
          <div className="attr-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"2px"}}>
            {([
              [Shield, "Seguridad 24hs", "Barrios cerrados con control de acceso permanente y per\u00edmetro vigilado."],
              [Waves, "Pileta privada", "Cada propiedad incluye pileta de dise\u00f1o integrada al paisajismo exterior."],
              [Key, "Llave en mano", "Entrega inmediata. Obra terminada, lista para habitar sin obra pendiente."],
              [PenTool, "Arquitectura de autor", "Dise\u00f1o contempor\u00e1neo con materiales de primera: hormig\u00f3n, vidrio, madera."],
              [DollarSign, "Financiaci\u00f3n en USD", "Condiciones personalizadas en d\u00f3lares. Cuotas fijas, sin ajustes sorpresa."],
              [TreePine, "Espacios verdes", "Grandes lotes en barrios arbolados a 15 min de Rosario por autopista."],
            ] as const).map(([Icon, title, desc], i) => (
              <div key={i} data-anim="attr-card" data-index={i} style={{padding:"32px 28px",border:"1px solid rgba(255,255,255,0.06)",background:"rgba(255,255,255,0.02)",borderRadius:"4px",cursor:"default"}}>
                <div style={{marginBottom:"16px"}}><Icon size={24} color="#22c55e" strokeWidth={1.5} /></div>
                <div style={{fontSize:"15px",fontWeight:700,color:"#fff",marginBottom:"8px"}}>{title}</div>
                <div style={{fontSize:"13px",color:"rgba(255,255,255,0.45)",lineHeight:1.6}}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS — count-up */}
      <section style={{padding:"100px 24px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{maxWidth:"900px",margin:"0 auto"}}>
          <div className="stats-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"48px",textAlign:"center"}}>
            {[
              ["6","Casas disponibles","exclusivas"],
              ["280+","m\u00b2 promedio","por propiedad"],
              ["3\u20134","dormitorios","en suite disponible"],
              ["5","barrios premium","en Funes"],
            ].map(([n,l,s]) => (
              <div key={l} data-anim="fade-up">
                <div data-anim="count-up" data-target={n} style={{fontSize:"56px",fontWeight:900,color:"#22c55e",lineHeight:1,fontVariantNumeric:"tabular-nums"}}>&nbsp;</div>
                <div style={{color:"#fff",marginTop:"8px",fontSize:"14px",fontWeight:600}}>{l}</div>
                <div style={{color:"rgba(255,255,255,0.35)",fontSize:"12px",marginTop:"2px"}}>{s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROPIEDADES — stagger cards */}
      <section id="propiedades" style={{padding:"80px 0",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{maxWidth:"1200px",margin:"0 auto",padding:"0 24px"}}>
          <div data-anim="fade-up" style={{textAlign:"center",marginBottom:"72px"}}>
            <p style={{color:"#22c55e",fontWeight:600,letterSpacing:"0.15em",fontSize:"11px",marginBottom:"16px",textTransform:"uppercase"}}>Portafolio exclusivo</p>
            <h2 style={{fontSize:"clamp(32px,5vw,56px)",fontWeight:900,margin:0,letterSpacing:"-1.5px"}}>Eleg&iacute; tu pr&oacute;ximo hogar.</h2>
          </div>

          <div className="prop-grid" style={{display:"flex",flexDirection:"column",gap:"3px"}}>
            {properties.map((property, i) => {
              const photos = getAllPhotos(property)
              const photo = photos[0]
              const price = formatPrice(property)
              const area = getTotalSurface(property)
              const titleText = property.publication_title || ""
              const descText = (property.description || property.description_only || "").replace(/<[^>]*>/g, "")
              const roomsFromTitle = titleText.match(/(\d+)\s*(?:dormitorios?|dorms?)/i)?.[1]
              const roomsFromDesc = descText.match(/(\d+)\s*(?:dormitorios?|dorms?)/i)?.[1]
              const rooms = roomsFromTitle ? parseInt(roomsFromTitle) :
                roomsFromDesc ? parseInt(roomsFromDesc) :
                (property.suite_amount > 0 ? property.suite_amount : 0)
              const baths = property.bathroom_amount || 0
              const fullText = `${titleText} ${descText}`
              const hasPileta = (property.tags || []).some(t =>
                /pool|pileta|piscina|swimming/i.test(t.name)
              ) || /pileta|piscina|swimming\s*pool/i.test(fullText)
              const title = property.publication_title || property.address
              const barrio = title.includes(" en ") ? title.split(" en ").slice(1).join(" en ") : property.fake_address || ""
              const slug = `${property.id}-${(property.publication_title||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"")}`
              const isLeft = i % 2 === 0

              return (
                <Link key={property.id} href={`/propiedades/${slug}`}
                  data-anim="stagger-card" data-index={i}
                  className="prop-card"
                  style={{display:"block",textDecoration:"none",borderRadius: i===0?"16px 16px 0 0": i===properties.length-1?"0 0 16px 16px":"0",overflow:"hidden"}}>
                  <div className="prop-inner" style={{display:"flex",minHeight:"480px"}}>
                    {/* Imagen */}
                    <div className="prop-img-wrap" style={{position:"relative",width:"50%",overflow:"hidden",order:isLeft?0:1,flexShrink:0}}>
                      {photo ? (
                        <Image src={photo} alt={title} fill className="prop-img"
                          style={{objectFit:"cover"}} sizes="(max-width:768px) 100vw, 50vw" />
                      ) : (
                        <div style={{width:"100%",height:"100%",background:"#111"}} />
                      )}
                      <div style={{position:"absolute",inset:0,background:isLeft?"linear-gradient(to right,transparent 60%,rgba(0,0,0,0.6))":"linear-gradient(to left,transparent 60%,rgba(0,0,0,0.6))"}} />
                      <div style={{position:"absolute",top:"20px",left:"20px",display:"flex",gap:"8px"}}>
                        <span style={{padding:"5px 12px",background:"rgba(0,0,0,0.7)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"100px",fontSize:"11px",fontWeight:600,color:"#22c55e",backdropFilter:"blur(10px)"}}>
                          HAUSING
                        </span>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="prop-content" style={{flex:1,background:"#0a0a0a",padding:"52px 48px",display:"flex",flexDirection:"column",justifyContent:"center",order:isLeft?1:0}}>
                      <p style={{fontSize:"11px",color:"#22c55e",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"16px"}}>
                        {barrio}
                      </p>
                      <h3 style={{fontSize:"clamp(22px,2.5vw,30px)",fontWeight:900,color:"#fff",margin:"0 0 20px",lineHeight:1.2,letterSpacing:"-0.5px"}}>
                        {title.replace(/ en .+$/, "")}
                      </h3>

                      <div style={{display:"flex",gap:"24px",marginBottom:"36px",flexWrap:"wrap"}}>
                        {area && area > 0 && (
                          <div>
                            <div style={{fontSize:"26px",fontWeight:900,color:"#fff",lineHeight:1}}>
                              {area}<span style={{fontSize:"13px",color:"rgba(255,255,255,0.35)",fontWeight:400}}> m&sup2;</span>
                            </div>
                            <div style={{fontSize:"11px",color:"rgba(255,255,255,0.35)",marginTop:"4px",letterSpacing:"0.08em"}}>SUPERFICIE</div>
                          </div>
                        )}
                        {rooms > 0 && (
                          <div>
                            <div style={{fontSize:"26px",fontWeight:900,color:"#fff",lineHeight:1}}>
                              {rooms}<span style={{fontSize:"13px",color:"rgba(255,255,255,0.35)",fontWeight:400}}> dorm</span>
                            </div>
                            <div style={{fontSize:"11px",color:"rgba(255,255,255,0.35)",marginTop:"4px",letterSpacing:"0.08em"}}>DORMITORIOS</div>
                          </div>
                        )}
                        {baths > 0 && (
                          <div>
                            <div style={{fontSize:"26px",fontWeight:900,color:"#fff",lineHeight:1}}>
                              {baths}<span style={{fontSize:"13px",color:"rgba(255,255,255,0.35)",fontWeight:400}}> ba&ntilde;os</span>
                            </div>
                            <div style={{fontSize:"11px",color:"rgba(255,255,255,0.35)",marginTop:"4px",letterSpacing:"0.08em"}}>BA&Ntilde;OS</div>
                          </div>
                        )}
                        {hasPileta && (
                          <div>
                            <div style={{display:"flex",alignItems:"center",gap:"8px",lineHeight:1}}>
                              <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#22c55e",flexShrink:0}} />
                              <span style={{fontSize:"13px",fontWeight:700,color:"#22c55e",letterSpacing:"0.08em"}}>PILETA</span>
                            </div>
                            <div style={{fontSize:"11px",color:"rgba(255,255,255,0.35)",marginTop:"8px",letterSpacing:"0.08em"}}>INCLUIDA</div>
                          </div>
                        )}
                      </div>

                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:"28px",borderTop:"1px solid rgba(255,255,255,0.07)"}}>
                        <div>
                          <div style={{fontSize:"11px",color:"rgba(255,255,255,0.35)",marginBottom:"6px",letterSpacing:"0.08em"}}>PRECIO</div>
                          <div style={{fontSize:"28px",fontWeight:900,color:"#22c55e"}}>{price}</div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:"8px",color:"rgba(255,255,255,0.6)",fontSize:"14px",fontWeight:600}}>
                          Ver propiedad
                          <span className="prop-arrow" style={{fontSize:"18px"}}>&rarr;</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section data-anim="fade-up" style={{padding:"120px 24px",textAlign:"center",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{maxWidth:"700px",margin:"0 auto"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"8px 20px",border:"1px solid rgba(34,197,94,0.3)",borderRadius:"100px",marginBottom:"32px",fontSize:"12px",color:"#22c55e",letterSpacing:"0.12em",textTransform:"uppercase"}}>
            Atenci&oacute;n personalizada
          </div>
          <h2 style={{fontSize:"clamp(36px,6vw,68px)",fontWeight:900,margin:"0 0 24px",letterSpacing:"-2px",lineHeight:1}}>
            Tu casa Hausing<br/>te est&aacute; esperando.
          </h2>
          <p style={{color:"rgba(255,255,255,0.45)",fontSize:"18px",marginBottom:"48px",lineHeight:1.6}}>
            Asesoramiento sin compromiso. Te contactamos en menos de 2 horas.
          </p>
          <div className="cta-btns" style={{display:"flex",gap:"16px",justifyContent:"center"}}>
            <a href="https://wa.me/5493412101694?text=Hola!%20Me%20interesan%20las%20propiedades%20Hausing" target="_blank"
              style={{display:"inline-flex",alignItems:"center",gap:"12px",padding:"18px 48px",background:"#22c55e",color:"#000",borderRadius:"100px",fontWeight:700,fontSize:"16px",textDecoration:"none"}}>
              Consultar por WhatsApp
            </a>
            <a href="tel:+5493412101694"
              style={{display:"inline-flex",alignItems:"center",gap:"12px",padding:"18px 48px",background:"rgba(255,255,255,0.07)",color:"#fff",borderRadius:"100px",fontWeight:600,fontSize:"16px",textDecoration:"none",border:"1px solid rgba(255,255,255,0.12)"}}>
              Llamar ahora
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <div style={{padding:"32px 40px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{width:"24px",height:"24px",background:"#fff",borderRadius:"6px",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#000",fontWeight:900,fontSize:"11px"}}>H</span>
          </div>
          <span style={{color:"rgba(255,255,255,0.4)",fontSize:"13px"}}>Hausing &times; SI Inmobiliaria &middot; Desde 1983</span>
        </div>
        <Link href="/propiedades" style={{color:"rgba(255,255,255,0.4)",fontSize:"13px",textDecoration:"none"}}>Ver todas las propiedades &rarr;</Link>
      </div>
    </div>
  )
}
