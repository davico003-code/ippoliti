interface EntornoItem { name: string; dist: string }
interface EntornoCategory { title: string; icon: string; items: EntornoItem[] }

const ENTORNO_DATA: Record<string, EntornoCategory[]> = {
  dockgarden: [
    { title: 'Educación privada', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" stroke-width="1.8"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5"/></svg>', items: [
      { name: 'Colegio Mirasoles (bilingüe)', dist: '5 min' },
      { name: 'Colegio Los Arroyos (bilingüe)', dist: '6 min' },
      { name: 'Instituto Fisherton de Educación Integral', dist: '7 min' },
      { name: 'Instituto Stella Maris', dist: '8 min' },
      { name: 'Colegio Biró', dist: '9 min' },
      { name: 'Colegio Cardenal Newman', dist: '10 min' },
      { name: 'Colegio San Bartolomé', dist: '12 min' },
      { name: 'Colegio San Patricio', dist: '12 min' },
    ]},
    { title: 'Salud', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" stroke-width="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>', items: [
      { name: 'Clínica de Nefrología', dist: '4 min' },
      { name: 'Sanatorio Parque', dist: '10 min' },
      { name: 'Hospital Provincial del Centenario', dist: '12 min' },
    ]},
    { title: 'Clubes y deportes', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>', items: [
      { name: 'Jockey Club Rosario', dist: '6 min' },
      { name: 'Fisherton Golf Club', dist: '4 min' },
      { name: 'Club Atlético Fisherton', dist: '3 min' },
      { name: 'Rosario Lawn Tennis Club', dist: '8 min' },
    ]},
    { title: 'Shopping y comercios', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" stroke-width="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>', items: [
      { name: 'Supermercado Carrefour', dist: '5 min' },
      { name: 'Shopping Alto Rosario', dist: '12 min' },
      { name: 'Portal Rosario Shopping', dist: '15 min' },
      { name: 'Zona comercial Av. del Huerto', dist: '6 min' },
    ]},
    { title: 'Entretenimiento', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" stroke-width="1.8"><polygon points="5 3 19 12 5 21 5 3"/></svg>', items: [
      { name: 'Autódromo Ciudad de Rosario', dist: '10 min' },
      { name: 'Rosario Central estadio', dist: '15 min' },
      { name: "Newell's Old Boys estadio", dist: '14 min' },
      { name: 'Costanera de Rosario', dist: '18 min' },
    ]},
    { title: 'Accesos y transporte', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" stroke-width="1.8"><path d="M9 18l6-6-6-6"/></svg>', items: [
      { name: 'Aeropuerto Internacional Islas Malvinas', dist: '8 min' },
      { name: 'Autopista Rosario-Córdoba', dist: '3 min' },
      { name: 'Av. Eva Perón acceso directo', dist: '' },
      { name: 'Acceso Norte Rosario', dist: '10 min' },
    ]},
  ],
  distrito: [
    { title: 'Educación privada', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" stroke-width="1.8"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5"/></svg>', items: [
      { name: 'Colegio San Lucas', dist: '5 min' },
      { name: 'Instituto Santa Juana de Arco', dist: '7 min' },
      { name: 'Colegio Nuestra Señora de Fátima', dist: '10 min' },
    ]},
    { title: 'Salud', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" stroke-width="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>', items: [
      { name: 'Centro de Salud Roldán', dist: '5 min' },
      { name: 'Sanatorio Roldán', dist: '7 min' },
    ]},
    { title: 'Clubes y deportes', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>', items: [
      { name: 'Club Social y Deportivo Roldán', dist: '5 min' },
      { name: 'Club Náutico Roldán', dist: '8 min' },
    ]},
    { title: 'Shopping y comercios', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" stroke-width="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>', items: [
      { name: 'Supermercado Roldán Centro', dist: '5 min' },
      { name: 'Plaza comercial Roldán', dist: '6 min' },
    ]},
    { title: 'Accesos y transporte', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" stroke-width="1.8"><path d="M9 18l6-6-6-6"/></svg>', items: [
      { name: 'Autopista Rosario-Córdoba', dist: 'acceso directo' },
      { name: 'Ruta Nacional 9', dist: '3 min' },
      { name: 'Centro de Roldán', dist: '5 min' },
      { name: 'Rosario centro', dist: '25 min' },
    ]},
  ],
}

export default function DevEntorno({ devName }: { devName: string }) {
  // Match by lowercase keyword
  const key = Object.keys(ENTORNO_DATA).find(k => devName.toLowerCase().includes(k))
  if (!key) return null
  const categories = ENTORNO_DATA[key]

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Raleway, sans-serif' }}>
        Entorno privilegiado
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div key={cat.title}>
            <div className="flex items-center gap-2 mb-3">
              <div dangerouslySetInnerHTML={{ __html: cat.icon }} />
              <h3 className="text-sm font-bold text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>
                {cat.title}
              </h3>
            </div>
            <ul className="space-y-1.5">
              {cat.items.map(item => (
                <li key={item.name} className="flex items-start justify-between gap-2 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <span className="text-gray-700">{item.name}</span>
                  {item.dist && (
                    <span className="text-gray-400 text-xs font-numeric whitespace-nowrap">{item.dist}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
