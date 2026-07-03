// Imágenes del blog — una foto única y temática por post (Unsplash + Pexels).
// Generado con scripts/gen-blog-images (búsqueda por tema en Unsplash, dedup
// global). Centralizado acá para que la lista y la ficha del post NO diverjan.
// Para posts sin entrada, resolveBlogImage cae a la imagen propia del post o a
// un genérico de mercado.

const GENERIC = 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200'

export const BLOG_IMAGES: Record<string, string> = {
  '5-errores-comunes-comprar-inmueble-primera-vez':
    'https://images.unsplash.com/photo-1758522487305-c6cf8588450a?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjByZXZpZXdpbmclMjBwYXBlcndvcmslMjBob21lfGVufDF8MHx8fDE3ODMxMTkyMjN8MA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'acopio-materiales-canje-m2-compradores':
    'https://images.unsplash.com/photo-1761805618757-9d2b9552ee32?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBtYXRlcmlhbHMlMjB3YXJlaG91c2V8ZW58MXwwfHx8MTc4MzExOTA4OHww&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'alquilar-o-comprar-2025-analisis-zona-oeste-rosario':
    'https://images.unsplash.com/flagged/photo-1564767609342-620cb19b2357?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwyfHxob3VzZSUyMGtleXMlMjByZW50JTIwYnV5fGVufDF8MHx8fDE3ODMxMTkyMzB8MA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'arquitectos-roldan-cuando-necesitas-uno-para-tu-propiedad':
    'https://images.pexels.com/photos/1109541/pexels-photo-1109541.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'bancos-cajeros-roldan-servicios-financieros':
    'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxiYW5rJTIwYnVpbGRpbmclMjBmaW5hbmNlfGVufDF8MHx8fDE3ODMxMTkxMDd8MA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'barrios-cerrados-vs-abiertos-cual-conviene':
    'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'colegios-roldan-funes-guia-familias-que-se-mudan':
    'https://images.unsplash.com/photo-1577896851231-70ef18881754?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxzY2hvb2wlMjBjbGFzc3Jvb20lMjBjaGlsZHJlbnxlbnwxfDB8fHwxNzgzMTE5MDgxfDA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'como-detectar-loteo-confiable-funes-roldan':
    'https://images.unsplash.com/photo-1461175827210-5ceac3e39dd2?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxsYW5kJTIwc3ViZGl2aXNpb24lMjBwbG90cyUyMGFlcmlhbHxlbnwxfDB8fHwxNzgzMTE5MjE4fDA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'como-evaluar-desarrolladora-antes-invertir':
    'https://images.unsplash.com/photo-1688380692117-63178554d76d?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmclMjBvZmZpY2UlMjBkZXNrfGVufDF8MHx8fDE3ODMxMTkwNzd8MA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'como-fijar-precio-venta-propiedad-sin-perder-dinero':
    'https://images.unsplash.com/photo-1725379448168-e33c5e09d47e?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxmb3IlMjBzYWxlJTIwc2lnbiUyMGhvdXNlfGVufDF8MHx8fDE3ODMxMTkyMjF8MA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'como-preparar-propiedad-vender-rapido-mejor-precio':
    'https://images.unsplash.com/photo-1632829882891-5047ccc421bc?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxicmlnaHQlMjBzdGFnZWQlMjBsaXZpbmclMjByb29tfGVufDF8MHx8fDE3ODMxMTkyMjl8MA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'composicion-precio-m2-pozo-emprendimientos':
    'https://images.unsplash.com/photo-1621511075938-f03482369feb?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxhcGFydG1lbnQlMjBidWlsZGluZyUyMHVuZGVyJTIwY29uc3RydWN0aW9ufGVufDF8MHx8fDE3ODMxMTkwNjR8MA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'comprar-casa-funes-roldan':
    'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'comprar-con-escritura-inmediata-inversion-segura':
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxob3VzZSUyMGtleXMlMjBjb250cmFjdHxlbnwxfDB8fHwxNzgzMTE5MjE3fDA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'constructoras-roldan-funes-construir-casa-2025':
    'https://images.unsplash.com/photo-1587582423116-ec07293f0395?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxob3VzZSUyMHdvb2QlMjBmcmFtaW5nJTIwY29uc3RydWN0aW9ufGVufDF8MHx8fDE3ODMxMTkwNzh8MA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'corredor-funes-roldan-historia-crecimiento-proyeccion':
    'https://images.unsplash.com/photo-1465447142348-e9952c393450?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxoaWdod2F5JTIwYWVyaWFsJTIwY2l0eSUyMGdyb3d0aHxlbnwxfDB8fHwxNzgzMTE5MjI1fDA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'costo-construccion-argentina-precio-propiedades':
    'https://images.unsplash.com/photo-1599707254554-027aeb4deacd?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBzaXRlJTIwYnVpbGRpbmclMjBjcmFuZXxlbnwxfDB8fHwxNzgzMTE5MDYxfDA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'creditos-hipotecarios-argentina-que-tener-en-cuenta':
    'https://images.unsplash.com/photo-1724781189475-a332f44de593?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxtb3J0Z2FnZSUyMGxvYW4lMjBob3VzZSUyMG1vZGVsJTIwY29pbnN8ZW58MXwwfHx8MTc4MzExOTIyMHww&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'cuanto-deberia-rendir-inversion-inmobiliaria-dolares':
    'https://images.unsplash.com/photo-1634757439914-23b8acb9d411?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxkb2xsYXJzJTIwbW9uZXklMjBob3VzZSUyMG1vZGVsfGVufDF8MHx8fDE3ODMxMTkxMjF8MA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'de-susana-ippoliti-a-si-inmobiliaria-cambio-dice-si-futuro':
    'https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'desarrollo-costo-vs-precio-cerrado-compradores':
    'https://images.unsplash.com/photo-1515263487990-61b07816b324?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjByZXNpZGVudGlhbCUyMGRldmVsb3BtZW50fGVufDF8MHx8fDE3ODMxMTkwNzB8MA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'donacion-herencia-compraventa-transferir-propiedad-argentina':
    'https://images.unsplash.com/photo-1521791055366-0d553872125f?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwyfHxsZWdhbCUyMGRvY3VtZW50cyUyMGluaGVyaXRhbmNlfGVufDF8MHx8fDE3ODMxMTkyMzN8MA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'escribanos-roldan-rol-en-compra-venta-propiedad':
    'https://images.unsplash.com/photo-1603796846097-bee99e4a601f?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxzaWduaW5nJTIwY29udHJhY3QlMjBwZW4lMjBkb2N1bWVudHxlbnwxfDB8fHwxNzgzMTE5MDc2fDA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'financiacion-dolares-cuotas-fijas-vs-hipoteca':
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNlJTIwZG9jdW1lbnRzJTIwY2FsY3VsYXRvciUyMG1vbmV5fGVufDF8MHx8fDE3ODMxMTkyMzJ8MA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'financiacion-largo-plazo-emprendimientos-2026':
    'https://images.unsplash.com/photo-1626178793926-22b28830aa30?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxtb3J0Z2FnZSUyMGNhbGN1bGF0b3IlMjBob3VzZSUyMG1vbmV5fGVufDF8MHx8fDE3ODMxMTkwODN8MA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'funes-roldan-nuevo-eje-crecimiento-inmobiliario-gran-rosario':
    'https://images.unsplash.com/photo-1555192881-efc55b7550f5?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxzdWJ1cmJhbiUyMG5laWdoYm9yaG9vZCUyMGFlcmlhbHxlbnwxfDB8fHwxNzgzMTE5MTIwfDA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'gimnasios-deportes-roldan-calidad-de-vida':
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxneW0lMjBmaXRuZXNzJTIwZHVtYmJlbGxzfGVufDF8MHx8fDE3ODMxMTkxMTV8MA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'guia-completa-invertir-lotes-santa-fe':
    'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'inmobiliarias-en-funes':
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3VzZSUyMGZvciUyMHNhbGV8ZW58MXwwfHx8MTc4MzExOTIyN3ww&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'inmobiliarias-en-roldan':
    'https://images.unsplash.com/photo-1572521165329-b197f9ea3da6?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxyZWFsJTIwZXN0YXRlJTIwb2ZmaWNlJTIwZGVza3xlbnwxfDB8fHwxNzgzMTE5MjIyfDA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'inmobiliarias-roldan-como-elegir-la-mejor':
    'https://images.unsplash.com/photo-1638262052640-82e94d64664a?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxyZWFsJTIwZXN0YXRlJTIwYWdlbnQlMjBoYW5kc2hha2V8ZW58MXwwfHx8MTc4MzExOTA2OHww&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'invertir-en-pozo-funes-ventajas-riesgos':
    'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwyfHxhcGFydG1lbnQlMjBjb25zdHJ1Y3Rpb24lMjBpbnZlc3RtZW50fGVufDF8MHx8fDE3ODMxMTkyMjR8MA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'invertir-pozo-funes-2025-analisis':
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNpYWwlMjBpbnZlc3RtZW50JTIwZ3Jvd3RoJTIwY2hhcnR8ZW58MXwwfHx8MTc4MzExOTA4MHww&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'mano-obra-construccion-precio-propiedades-funes':
    'https://images.unsplash.com/photo-1663058480259-2213d39f4f90?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjB3b3JrZXIlMjBicmlja2xheWluZ3xlbnwxfDB8fHwxNzgzMTE5MDc0fDA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'mercado-inmobiliario-2025-que-esta-pasando':
    'https://images.unsplash.com/photo-1524813686514-a57563d77965?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxzdWJ1cmJhbiUyMGhvdXNlcyUyMGFlcmlhbCUyMHZpZXd8ZW58MXwwfHx8MTc4MzExOTExMXww&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'mercado-inmobiliario-roldan-como-saber-propiedad-bien-valuada':
    'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'mudarse-roldan-desde-rosario-guia-completa-2025':
    'https://images.unsplash.com/photo-1600725935160-f67ee4f6084a?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxtb3ZpbmclMjBib3hlcyUyMG5ldyUyMGhvbWV8ZW58MXwwfHx8MTc4MzExOTExOXww&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'paneles-solares-roldan-funes-conviene-2025':
    'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxzb2xhciUyMHBhbmVscyUyMHJvb2Z8ZW58MXwwfHx8MTc4MzExOTExOHww&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'piletas-construccion-mantenimiento-roldan-funes':
    'https://images.unsplash.com/photo-1657383543368-7d929944be6a?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxzd2ltbWluZyUyMHBvb2wlMjBiYWNreWFyZHxlbnwxfDB8fHwxNzgzMTE5MTE2fDA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'por-que-roldan-nueva-apuesta-desarrolladores-inmobiliarios':
    'https://images.unsplash.com/photo-1605146769289-440113cc3d00?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxuZXclMjBzdWJ1cmIlMjBkZXZlbG9wbWVudCUyMGNvbnN0cnVjdGlvbnxlbnwxfDB8fHwxNzgzMTE5MjMxfDA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'por-que-si-inmobiliaria-43-anos-historia-familiar-roldan':
    'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'precio-m2-funes-roldan-perspectiva-2026':
    'https://images.unsplash.com/photo-1706808849777-96e0d7be3bb7?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3VzZSUyMGV4dGVyaW9yJTIwZmFjYWRlfGVufDF8MHx8fDE3ODMxMTkwOTF8MA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'que-aspectos-aumentan-valor-lote-funes-roldan':
    'https://images.unsplash.com/photo-1624856472328-bfcf71c34741?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxlbXB0eSUyMGxhbmQlMjBwbG90JTIwZ3Jhc3N8ZW58MXwwfHx8MTc4MzExOTA4NHww&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'que-es-cac-como-afecta-valor-propiedades-pesos':
    'https://images.unsplash.com/photo-1746221331496-a87689fc8eb9?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBjb3N0JTIwY2FsY3VsYXRvcnxlbnwxfDB8fHwxNzgzMTE5MjI4fDA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'red-flags-emprendimientos-inmobiliarios-pozo':
    'https://images.unsplash.com/photo-1631197344782-e66f0c665ba9?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxhYmFuZG9uZWQlMjB1bmZpbmlzaGVkJTIwY29uc3RydWN0aW9ufGVufDF8MHx8fDE3ODMxMTkwNjZ8MA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'restaurantes-gastronomia-roldan-para-vivir-y-disfrutar':
    'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZGluaW5nJTIwdGFibGUlMjBmb29kfGVufDF8MHx8fDE3ODMxMTkxMDl8MA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'salud-medicos-clinicas-roldan-lo-que-tenes-que-saber':
    'https://images.unsplash.com/photo-1612276529731-4b21494e6d71?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwY2xpbmljJTIwZG9jdG9yfGVufDF8MHx8fDE3ODMxMTkwOTh8MA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'seguridad-privada-barrios-cerrados-roldan-funes':
    'https://images.unsplash.com/photo-1580047750144-2c7790adf461?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxnYXRlZCUyMGNvbW11bml0eSUyMGVudHJhbmNlJTIwZ2F0ZXxlbnwxfDB8fHwxNzgzMTE5MTEzfDA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'si-inmobiliaria-abre-funes-galeria-arte':
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'supermercados-comercios-roldan-vivir-sin-auto':
    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxzdXBlcm1hcmtldCUyMGdyb2NlcnklMjBhaXNsZXxlbnwxfDB8fHwxNzgzMTE5MDg2fDA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'transporte-colectivo-roldan-rosario-opciones':
    'https://images.unsplash.com/photo-1641309664023-52a016965404?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwYnVzJTIwcHVibGljJTIwdHJhbnNwb3J0fGVufDF8MHx8fDE3ODMxMTkwOTB8MA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
  'valor-m2-funes-roldan-analisis-por-barrio-tipologia':
    'https://images.unsplash.com/photo-1782200506280-d8ac0de36641?ixid=M3w5MjUyNzd8MHwxfHNlYXJjaHwxfHxyZXNpZGVudGlhbCUyMHN0cmVldCUyMGhvdXNlc3xlbnwxfDB8fHwxNzgzMTE5MjI4fDA&ixlib=rb-4.1.0&w=1200&q=80&fm=jpg&fit=crop',
}

/**
 * Devuelve la imagen a usar para un post: mapa curado → imagen propia del post
 * (http o path local) → genérico. Nunca devuelve vacío.
 */
export function resolveBlogImage(slug: string, ownImage?: string): string {
  if (BLOG_IMAGES[slug]) return BLOG_IMAGES[slug]
  if (ownImage && (ownImage.startsWith('http') || ownImage.startsWith('/'))) return ownImage
  return GENERIC
}
