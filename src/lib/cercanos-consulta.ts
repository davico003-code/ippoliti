// Qué se le pide a OpenStreetMap (Overpass) para "Lugares cercanos". Lo
// comparten la consulta por punto (lib/cercanos.ts, solo fuera de la zona) y la
// de toda la zona (scripts/lugares-zona.mts → src/data/lugares-zona.json): si
// se agrega un rubro, se agrega acá y se vuelve a correr el script.

// Una sola consulta con todos los rubros de las dos fichas, al radio más grande
// que pide cada una; después cada vista filtra por su propio radio.
export const CONSULTA: Array<[string, number]> = [
  ['nwr["amenity"="school"]', 2000],
  ['nwr["amenity"~"^(hospital|clinic)$"]', 2500],
  ['nwr["shop"~"^(supermarket|convenience)$"]', 1200],
  ['nwr["leisure"~"^(park|playground)$"]', 1000],
  ['nwr["amenity"~"^(pharmacy|bank)$"]', 1200],
  ['node["highway"="bus_stop"]', 500],
  ['nwr["railway"~"^(station|halt)$"]', 2000],
]

/** Las etiquetas que miran armarCercanos y escuela(): el resto no se guarda. */
export const TAGS_USADOS = ['name', 'amenity', 'shop', 'leisure', 'highway', 'railway', 'operator:type', 'isced:level', 'school:type']

export const ESPEJOS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]

export const UA = 'SI-INMOBILIARIA/1.0 (+https://siinmobiliaria.com; contacto@siinmobiliaria.com)'
