// Datos de la experiencia de Galinda!: unidades en venta (fichas de Fundar,
// stock al 31-oct-2026) y locales 31 a 39 (presentacion comercial de Fundar,
// planilla del 20-abr-2026). SIN PRECIO (David, 17-nov-2026).
// Oficinas: queda SOLO la 03-02 (David, 17-nov-2026); las 02-01 y 03-09 ya no
// están disponibles. Es la ÚNICA lista: cuando Fundar venda una unidad, se saca de acá.
// Los usa el motor (plano tocable, 3D) y la pagina (tablas escritas en el HTML).

export interface UnidadX {
  id: string
  piso: number
  of: boolean
  tipo: string
  frente: string
  /** m2 totales */
  m2: string
  /** m2 exclusivos */
  prop: string
  /** Codigo de la ficha publicada en siinmobiliaria.com */
  ficha?: number
  /** Posicion en la planta del conjunto: [left, top, width, height] en % */
  pos: number[]
}

export interface LocalX {
  id: number
  /** m2 comunes */
  com: string
  /** frente vidriado, en metros */
  fr: string
  /** 1 = apto gastronomico */
  g: number
  /** m2 de planta baja */
  pb: string
  /** m2 de entrepiso */
  ep: string
  /** m2 totales = PB + EP + comunes */
  t: string
  /** poligono en el plano */
  pg: string
  /** centro del rotulo */
  c: number[]
}

export const U: UnidadX[] = [
    {id:'03-12',piso:3,of:false,tipo:'2 dormitorios',frente:'Frente a la plazoleta',m2:'108',prop:'90,5',ficha:900000708,pos:[23.77, 3.64, 4.4, 21.82]},
    {id:'03-11',piso:3,of:false,tipo:'2 dormitorios',frente:'Frente al parque',m2:'108',prop:'90,5',pos:[28.26, 4.39, 4.4, 21.06]},
    {id:'03-15',piso:3,of:false,tipo:'2 dormitorios',frente:'Frente a Av. Galindo',m2:'118',prop:'99',pos:[24.06, 59.24, 9.86, 13.94]},
    {id:'03-21',piso:3,of:false,tipo:'3 dormitorios',frente:'Frente a Av. Galindo',m2:'140',prop:'117',ficha:900000712,pos:[61.45, 64.09, 8.89, 13.79]},
    {id:'03-27',piso:3,of:false,tipo:'3 dormitorios',frente:'Frente a calle Picton',m2:'130',prop:'109',ficha:900000711,pos:[94.35, 4.24, 4.35, 25.76]},
    {id:'03-02',piso:3,of:true,tipo:'Oficina',frente:'Frente a la plazoleta, al norte',m2:'51',prop:'42',ficha:900000714,pos:[10.14, 14.55, 5.12, 6.67]},
    {id:'02-12',piso:2,of:false,tipo:'2 dormitorios',frente:'Frente a la plazoleta',m2:'108',prop:'90,5',pos:[23.77, 3.64, 4.4, 21.82]},
    {id:'02-11',piso:2,of:false,tipo:'2 dormitorios',frente:'Frente al parque',m2:'108',prop:'90,5',ficha:900000707,pos:[28.26, 4.39, 4.4, 21.06]},
    {id:'02-14',piso:2,of:false,tipo:'2 dormitorios',frente:'Frente a Av. Galindo',m2:'118',prop:'99',pos:[23.72, 40.0, 4.06, 29.7]},
    {id:'02-15',piso:2,of:false,tipo:'2 dormitorios',frente:'Frente a Av. Galindo',m2:'118',prop:'99',ficha:900000709,pos:[23.96, 59.09, 9.95, 14.09]},
    {id:'02-07',piso:2,of:false,tipo:'3 dormitorios',frente:'Frente al parque',m2:'132',prop:'111',pos:[45.46, 49.85, 8.65, 13.94]},
    {id:'02-04',piso:2,of:false,tipo:'2 dormitorios',frente:'Frente al parque',m2:'107',prop:'89,5',pos:[75.31, 50.0, 7.25, 12.58]},
    {id:'02-27',piso:2,of:false,tipo:'3 dormitorios',frente:'Frente a calle Picton',m2:'130',prop:'109',pos:[94.35, 4.24, 4.35, 25.76]}
]

export const LOC: LocalX[] = [
    {id:31,com:'5',fr:'7,55',g:0,pb:'99,50',ep:'70,50',t:'175',pg:'395,361 693,361 729,566 395,566',c:[560,455]},
    {id:32,com:'4',fr:'11,50',g:1,pb:'69,00',ep:'60,00',t:'133',pg:'505,147 655,147 693,361 395,361 395,273 505,273',c:[588,268]},
    {id:33,com:'4',fr:'15,40',g:1,pb:'80,50',ep:'65,50',t:'150',pg:'101,147 294,147 294,273 395,273 395,361 101,361',c:[205,270]},
    {id:34,com:'4',fr:'7,50',g:0,pb:'95,50',ep:'63,50',t:'163',pg:'101,361 395,361 395,566 101,566',c:[248,455]},
    {id:35,com:'3',fr:'7,50',g:0,pb:'64,00',ep:'33,00',t:'100',pg:'101,566 303,566 303,770 101,770',c:[202,660]},
    {id:36,com:'4',fr:'7,50',g:0,pb:'95,00',ep:'55,00',t:'154',pg:'101,770 395,770 395,976 101,976',c:[248,865]},
    {id:37,com:'4',fr:'19,10',g:1,pb:'101,00',ep:'41,00',t:'146',pg:'101,976 395,976 395,1191 101,1191',c:[248,1075]},
    {id:38,com:'2',fr:'13,65',g:1,pb:'58,50',ep:'20,50',t:'81',pg:'395,976 611,976 549,1191 395,1191',c:[485,1075]},
    {id:39,com:'3',fr:'7,80',g:0,pb:'75,50',ep:'47,50',t:'126',pg:'395,770 670,770 611,976 395,976',c:[515,865]}
]
