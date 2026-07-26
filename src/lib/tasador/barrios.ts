// AUTO-GENERADO desde OpenStreetMap (Overpass) + feed HILO — 2026-07-25
// Barrios de Funes y Roldán para las landings de tasación (/tasar/[slug]).
//   ppm2    = USD/m² de tierra calculado con terrenos reales del feed (null = usar
//             el promedio de la ciudad; ver PPM2_CIUDAD).
//   muestras= cuántos terrenos respaldan ese ppm2 (transparencia del dato).
// Regenerar: scripts/tasador/generar-barrios.mjs

export interface BarrioTasador {
  slug: string
  nombre: string
  ciudad: "Funes" | "Roldán"
  lat: number
  lon: number
  cerrado: boolean
  ppm2: number | null
  muestras: number
}

// Promedio de tierra por ciudad — fallback para barrios sin muestra propia.
export const PPM2_CIUDAD: Record<"Funes" | "Roldán", number> = {
  "Funes": 176,
  "Roldán": 106,
}

export const BARRIOS_TASADOR: BarrioTasador[] = [
  {
    "slug": "funes",
    "nombre": "Funes",
    "ciudad": "Funes",
    "lat": -32.9206,
    "lon": -60.811,
    "cerrado": false,
    "ppm2": 176,
    "muestras": 36
  },
  {
    "slug": "roldan",
    "nombre": "Roldán",
    "ciudad": "Roldán",
    "lat": -32.902,
    "lon": -60.913,
    "cerrado": false,
    "ppm2": 106,
    "muestras": 26
  },
  {
    "slug": "abra-casas-concretas",
    "nombre": "ABRA - Casas Concretas",
    "ciudad": "Funes",
    "lat": -32.93123,
    "lon": -60.83169,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "aero-funes",
    "nombre": "Aero Funes",
    "ciudad": "Funes",
    "lat": -32.92334,
    "lon": -60.77602,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "aguadas",
    "nombre": "Aguadas",
    "ciudad": "Funes",
    "lat": -32.93944,
    "lon": -60.80767,
    "cerrado": true,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "alfonsin",
    "nombre": "Alfonsín",
    "ciudad": "Funes",
    "lat": -32.90177,
    "lon": -60.81298,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "altos-de-funes",
    "nombre": "Altos de Funes",
    "ciudad": "Funes",
    "lat": -32.91196,
    "lon": -60.80575,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "atardeceres-de-funes",
    "nombre": "Atardeceres de Funes",
    "ciudad": "Funes",
    "lat": -32.91212,
    "lon": -60.83032,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "barani",
    "nombre": "Barani",
    "ciudad": "Funes",
    "lat": -32.92306,
    "lon": -60.77937,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "barquia-3",
    "nombre": "Barquía 3",
    "ciudad": "Funes",
    "lat": -32.91902,
    "lon": -60.81379,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "brancatelli",
    "nombre": "Brancatelli",
    "ciudad": "Funes",
    "lat": -32.92263,
    "lon": -60.84824,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "brisas-de-funes",
    "nombre": "Brisas de Funes",
    "ciudad": "Funes",
    "lat": -32.93139,
    "lon": -60.83272,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "brisas-de-funes-1",
    "nombre": "Brisas de Funes 1",
    "ciudad": "Funes",
    "lat": -32.93126,
    "lon": -60.83287,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "brisas-de-funes-2",
    "nombre": "Brisas de Funes 2",
    "ciudad": "Funes",
    "lat": -32.93164,
    "lon": -60.83285,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "brisas-de-funes-3",
    "nombre": "Brisas de Funes 3",
    "ciudad": "Funes",
    "lat": -32.93246,
    "lon": -60.83135,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "buena-vista",
    "nombre": "Buena Vista",
    "ciudad": "Funes",
    "lat": -32.92084,
    "lon": -60.81835,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "cadaques",
    "nombre": "Cadaques",
    "ciudad": "Funes",
    "lat": -32.92733,
    "lon": -60.83195,
    "cerrado": true,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "calmo",
    "nombre": "Calmo",
    "ciudad": "Funes",
    "lat": -32.93837,
    "lon": -60.81507,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "candelaria",
    "nombre": "Candelaria",
    "ciudad": "Funes",
    "lat": -32.91973,
    "lon": -60.81231,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "cannes",
    "nombre": "Cannes",
    "ciudad": "Funes",
    "lat": -32.90387,
    "lon": -60.79923,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "cantegril",
    "nombre": "Cantegril",
    "ciudad": "Funes",
    "lat": -32.92732,
    "lon": -60.84566,
    "cerrado": false,
    "ppm2": 196,
    "muestras": 1
  },
  {
    "slug": "cantore-linare",
    "nombre": "Cantore Linare",
    "ciudad": "Funes",
    "lat": -32.9106,
    "lon": -60.85539,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "carpanetto",
    "nombre": "Carpanetto",
    "ciudad": "Funes",
    "lat": -32.91156,
    "lon": -60.7989,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "colinas-de-funes",
    "nombre": "Colinas de Funes",
    "ciudad": "Funes",
    "lat": -32.92275,
    "lon": -60.84545,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "condo-funes",
    "nombre": "Condo Funes",
    "ciudad": "Funes",
    "lat": -32.91215,
    "lon": -60.80292,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "condominio-las-moras",
    "nombre": "Condominio Las Moras",
    "ciudad": "Funes",
    "lat": -32.92147,
    "lon": -60.80134,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "condominios-bagua",
    "nombre": "Condominios Bagua",
    "ciudad": "Funes",
    "lat": -32.92096,
    "lon": -60.81631,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "condominios-dm",
    "nombre": "Condominios DM",
    "ciudad": "Funes",
    "lat": -32.92535,
    "lon": -60.84926,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "condominios-dm-2",
    "nombre": "Condominios DM 2",
    "ciudad": "Funes",
    "lat": -32.92554,
    "lon": -60.85526,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "condominios-pedro-rios",
    "nombre": "Condominios Pedro Ríos",
    "ciudad": "Funes",
    "lat": -32.91398,
    "lon": -60.82269,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "damfield-residencial",
    "nombre": "Damfield Residencial",
    "ciudad": "Funes",
    "lat": -32.94582,
    "lon": -60.81492,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "don-bosco",
    "nombre": "Don Bosco",
    "ciudad": "Funes",
    "lat": -32.90668,
    "lon": -60.80899,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "don-bosco-ii",
    "nombre": "Don Bosco II",
    "ciudad": "Funes",
    "lat": -32.90938,
    "lon": -60.80762,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "don-ignacio",
    "nombre": "Don Ignacio",
    "ciudad": "Funes",
    "lat": -32.92406,
    "lon": -60.86308,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "don-juan",
    "nombre": "Don Juan",
    "ciudad": "Funes",
    "lat": -32.92974,
    "lon": -60.80502,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "don-luis",
    "nombre": "Don Luis",
    "ciudad": "Funes",
    "lat": -32.91057,
    "lon": -60.85828,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "don-mateo",
    "nombre": "Don Mateo",
    "ciudad": "Funes",
    "lat": -32.92804,
    "lon": -60.85489,
    "cerrado": true,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "drazi",
    "nombre": "Drazi",
    "ciudad": "Funes",
    "lat": -32.92374,
    "lon": -60.8357,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "el-bosquecillo",
    "nombre": "El Bosquecillo",
    "ciudad": "Funes",
    "lat": -32.91191,
    "lon": -60.84992,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "el-palomar",
    "nombre": "El Palomar",
    "ciudad": "Funes",
    "lat": -32.92212,
    "lon": -60.83417,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "el-sol-de-funes",
    "nombre": "El Sol de Funes",
    "ciudad": "Funes",
    "lat": -32.92257,
    "lon": -60.85244,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "funes-centro",
    "nombre": "Funes Centro",
    "ciudad": "Funes",
    "lat": -32.91876,
    "lon": -60.8109,
    "cerrado": false,
    "ppm2": 483,
    "muestras": 2
  },
  {
    "slug": "funes-city",
    "nombre": "Funes City",
    "ciudad": "Funes",
    "lat": -32.90575,
    "lon": -60.79823,
    "cerrado": false,
    "ppm2": 155,
    "muestras": 2
  },
  {
    "slug": "funes-green-house",
    "nombre": "Funes Green House",
    "ciudad": "Funes",
    "lat": -32.91328,
    "lon": -60.80201,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "funes-lakes",
    "nombre": "Funes Lakes",
    "ciudad": "Funes",
    "lat": -32.93669,
    "lon": -60.79824,
    "cerrado": true,
    "ppm2": 187,
    "muestras": 7
  },
  {
    "slug": "funes-norte",
    "nombre": "Funes Norte",
    "ciudad": "Funes",
    "lat": -32.89938,
    "lon": -60.81018,
    "cerrado": false,
    "ppm2": 118,
    "muestras": 5
  },
  {
    "slug": "funes-ranch",
    "nombre": "Funes Ranch",
    "ciudad": "Funes",
    "lat": -32.91162,
    "lon": -60.85304,
    "cerrado": true,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "funes-suites",
    "nombre": "Funes Suites",
    "ciudad": "Funes",
    "lat": -32.93243,
    "lon": -60.8319,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "haras-de-funes",
    "nombre": "Haras de Funes",
    "ciudad": "Funes",
    "lat": -32.95214,
    "lon": -60.84153,
    "cerrado": true,
    "ppm2": 81,
    "muestras": 1
  },
  {
    "slug": "inmobiliaria-parque",
    "nombre": "Inmobiliaria Parque",
    "ciudad": "Funes",
    "lat": -32.92233,
    "lon": -60.81963,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "islas-malvinas",
    "nombre": "Islas Malvinas",
    "ciudad": "Funes",
    "lat": -32.89157,
    "lon": -60.79202,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "kentucky",
    "nombre": "Kentucky",
    "ciudad": "Funes",
    "lat": -32.94339,
    "lon": -60.82799,
    "cerrado": true,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "km-318",
    "nombre": "KM 318",
    "ciudad": "Funes",
    "lat": -32.92685,
    "lon": -60.79934,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "km-323",
    "nombre": "KM 323",
    "ciudad": "Funes",
    "lat": -32.91381,
    "lon": -60.85138,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "la-cardera",
    "nombre": "La Cardera",
    "ciudad": "Funes",
    "lat": -32.9309,
    "lon": -60.82724,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "la-finca-country-club",
    "nombre": "La Finca Country Club",
    "ciudad": "Funes",
    "lat": -32.93089,
    "lon": -60.77069,
    "cerrado": true,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "la-finca-ii",
    "nombre": "La Finca II",
    "ciudad": "Funes",
    "lat": -32.90776,
    "lon": -60.81945,
    "cerrado": true,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "la-florida",
    "nombre": "La Florida",
    "ciudad": "Funes",
    "lat": -32.91506,
    "lon": -60.80607,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "la-guillermina",
    "nombre": "La Guillermina",
    "ciudad": "Funes",
    "lat": -32.89599,
    "lon": -60.85522,
    "cerrado": false,
    "ppm2": 82,
    "muestras": 1
  },
  {
    "slug": "la-rural",
    "nombre": "La Rural",
    "ciudad": "Funes",
    "lat": -32.91534,
    "lon": -60.84105,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "la-siesta",
    "nombre": "La Siesta",
    "ciudad": "Funes",
    "lat": -32.91696,
    "lon": -60.8345,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "las-calandrias",
    "nombre": "Las Calandrias",
    "ciudad": "Funes",
    "lat": -32.92187,
    "lon": -60.84949,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "las-glicinas",
    "nombre": "Las Glicinas",
    "ciudad": "Funes",
    "lat": -32.91365,
    "lon": -60.80185,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "las-glicinas-2",
    "nombre": "Las Glicinas 2",
    "ciudad": "Funes",
    "lat": -32.91361,
    "lon": -60.8021,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "las-glicinas-3",
    "nombre": "Las Glicinas 3",
    "ciudad": "Funes",
    "lat": -32.91293,
    "lon": -60.80192,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "las-quintas",
    "nombre": "Las Quintas",
    "ciudad": "Funes",
    "lat": -32.9223,
    "lon": -60.85771,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "latucca-y-mondini",
    "nombre": "Latucca y Mondini",
    "ciudad": "Funes",
    "lat": -32.9143,
    "lon": -60.83046,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "lomas-de-funes",
    "nombre": "Lomas de Funes",
    "ciudad": "Funes",
    "lat": -32.90529,
    "lon": -60.81476,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "los-2-chinos",
    "nombre": "Los 2 chinos",
    "ciudad": "Funes",
    "lat": -32.92557,
    "lon": -60.80227,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "los-aljibes",
    "nombre": "Los Aljibes",
    "ciudad": "Funes",
    "lat": -32.93061,
    "lon": -60.82159,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "los-chalecitos",
    "nombre": "Los Chalecitos",
    "ciudad": "Funes",
    "lat": -32.91769,
    "lon": -60.81724,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "los-girasoles",
    "nombre": "Los Girasoles",
    "ciudad": "Funes",
    "lat": -32.93102,
    "lon": -60.8341,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "los-morros",
    "nombre": "Los Morros",
    "ciudad": "Funes",
    "lat": -32.93356,
    "lon": -60.83066,
    "cerrado": false,
    "ppm2": 128,
    "muestras": 1
  },
  {
    "slug": "los-nogales",
    "nombre": "Los Nogales",
    "ciudad": "Funes",
    "lat": -32.91789,
    "lon": -60.82318,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "los-solares",
    "nombre": "Los Solares",
    "ciudad": "Funes",
    "lat": -32.92549,
    "lon": -60.78985,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "los-troncos",
    "nombre": "Los Troncos",
    "ciudad": "Funes",
    "lat": -32.9257,
    "lon": -60.8185,
    "cerrado": false,
    "ppm2": 211,
    "muestras": 2
  },
  {
    "slug": "maria-auxiliadora",
    "nombre": "María Auxiliadora",
    "ciudad": "Funes",
    "lat": -32.91323,
    "lon": -60.80023,
    "cerrado": false,
    "ppm2": 180,
    "muestras": 4
  },
  {
    "slug": "miraflores",
    "nombre": "Miraflores",
    "ciudad": "Funes",
    "lat": -32.92681,
    "lon": -60.84021,
    "cerrado": true,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "mojon-de-funes",
    "nombre": "Mojón de Funes",
    "ciudad": "Funes",
    "lat": -32.91546,
    "lon": -60.8323,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "ocho-sauces",
    "nombre": "Ocho Sauces",
    "ciudad": "Funes",
    "lat": -32.92503,
    "lon": -60.83567,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "pao-pey",
    "nombre": "Pao Pey",
    "ciudad": "Funes",
    "lat": -32.91315,
    "lon": -60.84019,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "paseo-del-norte",
    "nombre": "Paseo del Norte",
    "ciudad": "Funes",
    "lat": -32.89676,
    "lon": -60.81199,
    "cerrado": false,
    "ppm2": 96,
    "muestras": 3
  },
  {
    "slug": "proa-200",
    "nombre": "Proa 200",
    "ciudad": "Funes",
    "lat": -32.92228,
    "lon": -60.84103,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "profesional-country-club",
    "nombre": "Profesional Country Club",
    "ciudad": "Funes",
    "lat": -32.91695,
    "lon": -60.85664,
    "cerrado": true,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "propio-hogar",
    "nombre": "Propio Hogar",
    "ciudad": "Funes",
    "lat": -32.91198,
    "lon": -60.84673,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "pueblo-funes",
    "nombre": "Pueblo Funes",
    "ciudad": "Funes",
    "lat": -32.90952,
    "lon": -60.81665,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "puente-golf",
    "nombre": "Puente Golf",
    "ciudad": "Funes",
    "lat": -32.92541,
    "lon": -60.76469,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "puerta-del-sol",
    "nombre": "Puerta del Sol",
    "ciudad": "Funes",
    "lat": -32.92306,
    "lon": -60.78065,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "quinta-natacha",
    "nombre": "Quinta Natacha",
    "ciudad": "Funes",
    "lat": -32.89272,
    "lon": -60.82654,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "residencial-funes",
    "nombre": "Residencial Funes",
    "ciudad": "Funes",
    "lat": -32.91814,
    "lon": -60.84193,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "rincon-de-funes",
    "nombre": "Rincón de Funes",
    "ciudad": "Funes",
    "lat": -32.91991,
    "lon": -60.80105,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "rincon-de-la-arboleda",
    "nombre": "Rincón de la Arboleda",
    "ciudad": "Funes",
    "lat": -32.91468,
    "lon": -60.84849,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "rio-de-pajaros",
    "nombre": "Río de Pájaros",
    "ciudad": "Funes",
    "lat": -32.91144,
    "lon": -60.80134,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "rudof",
    "nombre": "Rudof",
    "ciudad": "Funes",
    "lat": -32.90945,
    "lon": -60.81151,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "san-alberto-2",
    "nombre": "San Alberto 2",
    "ciudad": "Funes",
    "lat": -32.92149,
    "lon": -60.86385,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "san-jose",
    "nombre": "San José",
    "ciudad": "Funes",
    "lat": -32.91989,
    "lon": -60.81132,
    "cerrado": false,
    "ppm2": 107,
    "muestras": 2
  },
  {
    "slug": "san-juan",
    "nombre": "San Juan",
    "ciudad": "Funes",
    "lat": -32.93084,
    "lon": -60.80079,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "san-marino",
    "nombre": "San Marino",
    "ciudad": "Funes",
    "lat": -32.92743,
    "lon": -60.82374,
    "cerrado": true,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "san-sebastian",
    "nombre": "San Sebastián",
    "ciudad": "Funes",
    "lat": -32.93342,
    "lon": -60.8082,
    "cerrado": true,
    "ppm2": 253,
    "muestras": 3
  },
  {
    "slug": "san-telmo",
    "nombre": "San Telmo",
    "ciudad": "Funes",
    "lat": -32.91352,
    "lon": -60.81367,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "santa-isabel-3",
    "nombre": "Santa Isabel 3",
    "ciudad": "Funes",
    "lat": -32.91314,
    "lon": -60.8595,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "santa-isabel-4",
    "nombre": "Santa Isabel 4",
    "ciudad": "Funes",
    "lat": -32.91034,
    "lon": -60.86031,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "scaglione",
    "nombre": "Scaglione",
    "ciudad": "Funes",
    "lat": -32.92263,
    "lon": -60.81751,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "sol-de-funes",
    "nombre": "Sol de Funes",
    "ciudad": "Funes",
    "lat": -32.93794,
    "lon": -60.8358,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "terraz-funes",
    "nombre": "Terraz Funes",
    "ciudad": "Funes",
    "lat": -32.91332,
    "lon": -60.81317,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "tomas-de-la-torre",
    "nombre": "Tomás de la Torre",
    "ciudad": "Funes",
    "lat": -32.92221,
    "lon": -60.78834,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "top-funes",
    "nombre": "Top Funes",
    "ciudad": "Funes",
    "lat": -32.91418,
    "lon": -60.83539,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "travaccio",
    "nombre": "Travaccio",
    "ciudad": "Funes",
    "lat": -32.92158,
    "lon": -60.79371,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "turcatto",
    "nombre": "Turcatto",
    "ciudad": "Funes",
    "lat": -32.91388,
    "lon": -60.85267,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "vazquez-rey",
    "nombre": "Vazquez Rey",
    "ciudad": "Funes",
    "lat": -32.91158,
    "lon": -60.81008,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "velez-sarsfield",
    "nombre": "Vélez Sarsfield",
    "ciudad": "Funes",
    "lat": -32.90946,
    "lon": -60.81458,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "vida",
    "nombre": "Vida",
    "ciudad": "Funes",
    "lat": -32.93143,
    "lon": -60.79352,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "vida-club-de-campo",
    "nombre": "Vida Club de Campo",
    "ciudad": "Funes",
    "lat": -32.93635,
    "lon": -60.78773,
    "cerrado": true,
    "ppm2": 146,
    "muestras": 2
  },
  {
    "slug": "vida-crystal-lagoon",
    "nombre": "Vida Crystal Lagoon",
    "ciudad": "Funes",
    "lat": -32.9055,
    "lon": -60.84776,
    "cerrado": true,
    "ppm2": 141,
    "muestras": 4
  },
  {
    "slug": "vida-green",
    "nombre": "Vida Green",
    "ciudad": "Funes",
    "lat": -32.89658,
    "lon": -60.8019,
    "cerrado": true,
    "ppm2": 110,
    "muestras": 1
  },
  {
    "slug": "vida-jardin",
    "nombre": "Vida Jardín",
    "ciudad": "Funes",
    "lat": -32.93174,
    "lon": -60.85246,
    "cerrado": true,
    "ppm2": 168,
    "muestras": 1
  },
  {
    "slug": "villa-del-sol",
    "nombre": "Villa del Sol",
    "ciudad": "Funes",
    "lat": -32.90488,
    "lon": -60.80902,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "villa-elvira",
    "nombre": "Villa Elvira",
    "ciudad": "Funes",
    "lat": -32.91426,
    "lon": -60.79626,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "villa-ercolina",
    "nombre": "Villa Ercolina",
    "ciudad": "Funes",
    "lat": -32.90932,
    "lon": -60.80541,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "villa-golf",
    "nombre": "Villa Golf",
    "ciudad": "Funes",
    "lat": -32.92626,
    "lon": -60.77159,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "acequias-del-aire",
    "nombre": "Acequias del Aire",
    "ciudad": "Roldán",
    "lat": -32.89737,
    "lon": -60.87255,
    "cerrado": false,
    "ppm2": 106,
    "muestras": 3
  },
  {
    "slug": "aires-de-campo",
    "nombre": "Aires de Campo",
    "ciudad": "Roldán",
    "lat": -32.91275,
    "lon": -60.87433,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "alto-residencial",
    "nombre": "Alto Residencial",
    "ciudad": "Roldán",
    "lat": -32.88311,
    "lon": -60.89203,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "alto-verde",
    "nombre": "Alto Verde",
    "ciudad": "Roldán",
    "lat": -32.91492,
    "lon": -60.87218,
    "cerrado": true,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "altos-de-pellegrini",
    "nombre": "Altos de Pellegrini",
    "ciudad": "Roldán",
    "lat": -32.89699,
    "lon": -60.91751,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "altos-del-este",
    "nombre": "Altos del Este",
    "ciudad": "Roldán",
    "lat": -32.89993,
    "lon": -60.89813,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "america",
    "nombre": "América",
    "ciudad": "Roldán",
    "lat": -32.89596,
    "lon": -60.91082,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "arrabal",
    "nombre": "Arrabal",
    "ciudad": "Roldán",
    "lat": -32.89691,
    "lon": -60.90258,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "aurea",
    "nombre": "Áurea",
    "ciudad": "Roldán",
    "lat": -32.88705,
    "lon": -60.89298,
    "cerrado": false,
    "ppm2": 70,
    "muestras": 1
  },
  {
    "slug": "beaudrix",
    "nombre": "Beaudrix",
    "ciudad": "Roldán",
    "lat": -32.8911,
    "lon": -60.9046,
    "cerrado": false,
    "ppm2": 78,
    "muestras": 1
  },
  {
    "slug": "belisario-roldan",
    "nombre": "Belisario Roldán",
    "ciudad": "Roldán",
    "lat": -32.89625,
    "lon": -60.89652,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "bosque-azul",
    "nombre": "Bosque Azul",
    "ciudad": "Roldán",
    "lat": -32.91576,
    "lon": -60.88829,
    "cerrado": true,
    "ppm2": 77,
    "muestras": 1
  },
  {
    "slug": "brofft",
    "nombre": "Brofft",
    "ciudad": "Roldán",
    "lat": -32.89501,
    "lon": -60.91631,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "capra",
    "nombre": "Capra",
    "ciudad": "Roldán",
    "lat": -32.91263,
    "lon": -60.87987,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "chacra-los-raigales",
    "nombre": "Chacra Los Raigales",
    "ciudad": "Roldán",
    "lat": -32.94684,
    "lon": -60.89615,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "cotitos-r",
    "nombre": "Cotitos R",
    "ciudad": "Roldán",
    "lat": -32.90744,
    "lon": -60.86905,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "cotos-de-la-alameda",
    "nombre": "Cotos de la Alameda",
    "ciudad": "Roldán",
    "lat": -32.90799,
    "lon": -60.877,
    "cerrado": true,
    "ppm2": 72,
    "muestras": 1
  },
  {
    "slug": "cotos-de-la-alameda-ii",
    "nombre": "Cotos de la Alameda II",
    "ciudad": "Roldán",
    "lat": -32.90484,
    "lon": -60.8845,
    "cerrado": true,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "cotos-unanue",
    "nombre": "Cotos Unanue",
    "ciudad": "Roldán",
    "lat": -32.90701,
    "lon": -60.87106,
    "cerrado": true,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "delle-vedove",
    "nombre": "Delle Vedove",
    "ciudad": "Roldán",
    "lat": -32.945,
    "lon": -60.91058,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "distrito-roldan",
    "nombre": "Distrito Roldán",
    "ciudad": "Roldán",
    "lat": -32.91138,
    "lon": -60.88838,
    "cerrado": false,
    "ppm2": 180,
    "muestras": 4
  },
  {
    "slug": "don-quijote",
    "nombre": "Don Quijote",
    "ciudad": "Roldán",
    "lat": -32.91094,
    "lon": -60.89279,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "edelweiss",
    "nombre": "Edelweiss",
    "ciudad": "Roldán",
    "lat": -32.90827,
    "lon": -60.86744,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "el-alba",
    "nombre": "El Alba",
    "ciudad": "Roldán",
    "lat": -32.87057,
    "lon": -60.88385,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "el-charquito",
    "nombre": "El Charquito",
    "ciudad": "Roldán",
    "lat": -32.90273,
    "lon": -60.9127,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "el-cielo",
    "nombre": "El Cielo",
    "ciudad": "Roldán",
    "lat": -32.91207,
    "lon": -60.88111,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "el-cruce",
    "nombre": "El Cruce",
    "ciudad": "Roldán",
    "lat": -32.90858,
    "lon": -60.89657,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "el-descanso",
    "nombre": "El Descanso",
    "ciudad": "Roldán",
    "lat": -32.92243,
    "lon": -60.90174,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "el-eden",
    "nombre": "El Edén",
    "ciudad": "Roldán",
    "lat": -32.91355,
    "lon": -60.88855,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "el-molino",
    "nombre": "El Molino",
    "ciudad": "Roldán",
    "lat": -32.92674,
    "lon": -60.87393,
    "cerrado": true,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "el-sol-naciente",
    "nombre": "El Sol Naciente",
    "ciudad": "Roldán",
    "lat": -32.90455,
    "lon": -60.89059,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "el-summun",
    "nombre": "El Summun",
    "ciudad": "Roldán",
    "lat": -32.90979,
    "lon": -60.86614,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "el-troncal",
    "nombre": "El Troncal",
    "ciudad": "Roldán",
    "lat": -32.90509,
    "lon": -60.89233,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "estacion-roldan",
    "nombre": "Estación Roldán",
    "ciudad": "Roldán",
    "lat": -32.90167,
    "lon": -60.87941,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "estancia-la-catalina",
    "nombre": "Estancia La Catalina",
    "ciudad": "Roldán",
    "lat": -32.93234,
    "lon": -60.9155,
    "cerrado": true,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "fontanet",
    "nombre": "Fontanet",
    "ciudad": "Roldán",
    "lat": -32.92373,
    "lon": -60.90204,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "funes-town",
    "nombre": "Funes Town",
    "ciudad": "Roldán",
    "lat": -32.90064,
    "lon": -60.86024,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "la-estancia-i",
    "nombre": "La Estancia I",
    "ciudad": "Roldán",
    "lat": -32.90563,
    "lon": -60.86722,
    "cerrado": true,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "la-estancia-ii",
    "nombre": "La Estancia II",
    "ciudad": "Roldán",
    "lat": -32.89744,
    "lon": -60.86695,
    "cerrado": true,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "la-ilusion-polo-lakeside",
    "nombre": "La Ilusión Polo & Lakeside",
    "ciudad": "Roldán",
    "lat": -32.9291,
    "lon": -60.929,
    "cerrado": true,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "la-ilusion-ranches",
    "nombre": "La Ilusión Ranches",
    "ciudad": "Roldán",
    "lat": -32.92527,
    "lon": -60.92556,
    "cerrado": true,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "las-acequias",
    "nombre": "Las Acequias",
    "ciudad": "Roldán",
    "lat": -32.89673,
    "lon": -60.8836,
    "cerrado": false,
    "ppm2": 110,
    "muestras": 1
  },
  {
    "slug": "las-estacas-i",
    "nombre": "Las Estacas I",
    "ciudad": "Roldán",
    "lat": -32.90585,
    "lon": -60.9137,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "las-estacas-ii",
    "nombre": "Las Estacas II",
    "ciudad": "Roldán",
    "lat": -32.90746,
    "lon": -60.89053,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "las-palmeras",
    "nombre": "Las Palmeras",
    "ciudad": "Roldán",
    "lat": -32.88919,
    "lon": -60.88685,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "las-tardes",
    "nombre": "Las Tardes",
    "ciudad": "Roldán",
    "lat": -32.88678,
    "lon": -60.88107,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "lenaue",
    "nombre": "Lenaue",
    "ciudad": "Roldán",
    "lat": -32.90499,
    "lon": -60.86438,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "los-aromos",
    "nombre": "Los Aromos",
    "ciudad": "Roldán",
    "lat": -32.91516,
    "lon": -60.88042,
    "cerrado": true,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "los-cedros",
    "nombre": "Los Cedros",
    "ciudad": "Roldán",
    "lat": -32.89172,
    "lon": -60.88842,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "los-cocos",
    "nombre": "Los Cocos",
    "ciudad": "Roldán",
    "lat": -32.90682,
    "lon": -60.91678,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "los-indios",
    "nombre": "Los Indios",
    "ciudad": "Roldán",
    "lat": -32.90298,
    "lon": -60.86899,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "los-olmos",
    "nombre": "Los Olmos",
    "ciudad": "Roldán",
    "lat": -32.90462,
    "lon": -60.89635,
    "cerrado": false,
    "ppm2": 87,
    "muestras": 1
  },
  {
    "slug": "los-rosales",
    "nombre": "Los Rosales",
    "ciudad": "Roldán",
    "lat": -32.91298,
    "lon": -60.87707,
    "cerrado": true,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "maiz",
    "nombre": "Maíz",
    "ciudad": "Roldán",
    "lat": -32.91153,
    "lon": -60.88549,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "makey",
    "nombre": "Makey",
    "ciudad": "Roldán",
    "lat": -32.86056,
    "lon": -60.88663,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "marcos-ateca",
    "nombre": "Marcos Ateca",
    "ciudad": "Roldán",
    "lat": -32.90667,
    "lon": -60.90676,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "maria-esther",
    "nombre": "María Esther",
    "ciudad": "Roldán",
    "lat": -32.90534,
    "lon": -60.88675,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "mazzoni-de-bernaschini",
    "nombre": "Mazzoni de Bernaschini",
    "ciudad": "Roldán",
    "lat": -32.91244,
    "lon": -60.87862,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "mi-sosiego",
    "nombre": "Mi Sosiego",
    "ciudad": "Roldán",
    "lat": -32.9109,
    "lon": -60.86908,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "muradore",
    "nombre": "Muradore",
    "ciudad": "Roldán",
    "lat": -32.89998,
    "lon": -60.91813,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "nadine",
    "nombre": "Nadine",
    "ciudad": "Roldán",
    "lat": -32.90792,
    "lon": -60.91546,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "parque-esmeralda",
    "nombre": "Parque Esmeralda",
    "ciudad": "Roldán",
    "lat": -32.90789,
    "lon": -60.88444,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "posta-16",
    "nombre": "Posta 16",
    "ciudad": "Roldán",
    "lat": -32.89089,
    "lon": -60.89692,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "prados-del-sol",
    "nombre": "Prados del Sol",
    "ciudad": "Roldán",
    "lat": -32.92176,
    "lon": -60.87316,
    "cerrado": true,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "prosperity-lands",
    "nombre": "Prosperity Lands",
    "ciudad": "Roldán",
    "lat": -32.89811,
    "lon": -60.87801,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "pucara-los-buhos",
    "nombre": "Pucará Los Buhos",
    "ciudad": "Roldán",
    "lat": -32.92126,
    "lon": -60.9067,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "puerto-roldan",
    "nombre": "Puerto Roldán",
    "ciudad": "Roldán",
    "lat": -32.93353,
    "lon": -60.88506,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "punta-chacra",
    "nombre": "Punta Chacra",
    "ciudad": "Roldán",
    "lat": -32.91503,
    "lon": -60.9367,
    "cerrado": false,
    "ppm2": 43,
    "muestras": 1
  },
  {
    "slug": "punta-chacra-weekend-1",
    "nombre": "Punta Chacra Weekend 1",
    "ciudad": "Roldán",
    "lat": -32.91039,
    "lon": -60.93293,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "punta-chacra-weekend-2",
    "nombre": "Punta Chacra Weekend 2",
    "ciudad": "Roldán",
    "lat": -32.90969,
    "lon": -60.93765,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "quintas-de-funes",
    "nombre": "Quintas de Funes",
    "ciudad": "Roldán",
    "lat": -32.92789,
    "lon": -60.86519,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "san-alberto",
    "nombre": "San Alberto",
    "ciudad": "Roldán",
    "lat": -32.91756,
    "lon": -60.86349,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "san-andres",
    "nombre": "San Andrés",
    "ciudad": "Roldán",
    "lat": -32.89984,
    "lon": -60.89591,
    "cerrado": false,
    "ppm2": 91,
    "muestras": 3
  },
  {
    "slug": "san-eduardo-i",
    "nombre": "San Eduardo I",
    "ciudad": "Roldán",
    "lat": -32.90763,
    "lon": -60.88785,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "san-javier",
    "nombre": "San Javier",
    "ciudad": "Roldán",
    "lat": -32.90497,
    "lon": -60.9164,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "santa-isabel-1",
    "nombre": "Santa Isabel 1",
    "ciudad": "Roldán",
    "lat": -32.91289,
    "lon": -60.86407,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "santa-isabel-2",
    "nombre": "Santa Isabel 2",
    "ciudad": "Roldán",
    "lat": -32.91162,
    "lon": -60.86343,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "santa-isabel-5",
    "nombre": "Santa Isabel 5",
    "ciudad": "Roldán",
    "lat": -32.90995,
    "lon": -60.86296,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "santa-isabel-j-a",
    "nombre": "Santa Isabel J.A.",
    "ciudad": "Roldán",
    "lat": -32.91658,
    "lon": -60.86707,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "santa-teresa",
    "nombre": "Santa Teresa",
    "ciudad": "Roldán",
    "lat": -32.89935,
    "lon": -60.89026,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "santo-domingo",
    "nombre": "Santo Domingo",
    "ciudad": "Roldán",
    "lat": -32.9025,
    "lon": -60.91923,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "tierra-de-suenos-1",
    "nombre": "Tierra de Sueños 1",
    "ciudad": "Roldán",
    "lat": -32.89342,
    "lon": -60.89756,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "tierra-de-suenos-2",
    "nombre": "Tierra de Sueños 2",
    "ciudad": "Roldán",
    "lat": -32.93116,
    "lon": -60.89312,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "tierra-de-suenos-3",
    "nombre": "Tierra de Sueños 3",
    "ciudad": "Roldán",
    "lat": -32.94758,
    "lon": -60.88475,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "travattore-giandomenico",
    "nombre": "Travattore Giandoménico",
    "ciudad": "Roldán",
    "lat": -32.90802,
    "lon": -60.88592,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "tu-lugar",
    "nombre": "Tu Lugar",
    "ciudad": "Roldán",
    "lat": -32.92078,
    "lon": -60.90119,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "villa-alda",
    "nombre": "Villa Alda",
    "ciudad": "Roldán",
    "lat": -32.911,
    "lon": -60.89835,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "villa-alicia",
    "nombre": "Villa Alicia",
    "ciudad": "Roldán",
    "lat": -32.91895,
    "lon": -60.87259,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "villa-celina",
    "nombre": "Villa Celina",
    "ciudad": "Roldán",
    "lat": -32.91413,
    "lon": -60.89855,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "villa-eduardito",
    "nombre": "Villa Eduardito",
    "ciudad": "Roldán",
    "lat": -32.86043,
    "lon": -60.88163,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "villa-flores",
    "nombre": "Villa Flores",
    "ciudad": "Roldán",
    "lat": -32.9092,
    "lon": -60.90662,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "villa-lourdes-1",
    "nombre": "Villa Lourdes 1",
    "ciudad": "Roldán",
    "lat": -32.91319,
    "lon": -60.86944,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "villa-lourdes-2",
    "nombre": "Villa Lourdes 2",
    "ciudad": "Roldán",
    "lat": -32.9166,
    "lon": -60.8706,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  },
  {
    "slug": "wirth",
    "nombre": "Wirth",
    "ciudad": "Roldán",
    "lat": -32.90905,
    "lon": -60.86765,
    "cerrado": false,
    "ppm2": null,
    "muestras": 0
  }
]

export const getBarrio = (slug: string) => BARRIOS_TASADOR.find(b => b.slug === slug)

// Precio de tierra efectivo del barrio + de dónde salió (para mostrarlo honesto).
export function precioTierra(b: BarrioTasador): { ppm2: number; fuente: "barrio" | "ciudad"; muestras: number } {
  if (b.ppm2 && b.muestras > 0) return { ppm2: b.ppm2, fuente: "barrio", muestras: b.muestras }
  return { ppm2: PPM2_CIUDAD[b.ciudad], fuente: "ciudad", muestras: 0 }
}
