import { Search, MapPin, Home, DollarSign } from 'lucide-react';
import Image from 'next/image';

export default function Hero() {
  return (
    <div className="relative bg-navy-900 overflow-hidden" style={{ minHeight: '85vh' }}>
      {/* Background Image */}
      <div className="absolute inset-0 z-0 select-none">
        <Image 
          src="/hero_bg_1774239022830.png" 
          alt="Lujosa propiedad en Argentina al atardecer" 
          fill
          className="object-cover opacity-50 mix-blend-overlay scale-105 transform hover:scale-100 transition-transform duration-[20s]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/80 via-navy-900/40 to-navy-900"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center pt-24 pb-20 lg:pt-32 lg:pb-28">
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16 mt-auto flex flex-col items-center">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-gold-400 font-medium text-sm mb-6 uppercase tracking-wider mx-auto">
            <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse"></span>
            Desde 1983 - 40 Años de Trayectoria
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight font-serif drop-shadow-lg text-center">
            Tu próxima propiedad en <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-600">
              Roldán y Rosario
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl drop-shadow font-light text-center">
            Encontramos el hogar ideal para vos de manera rápida y segura. Ventas, alquileres y la mejor asesoría integral con nuestro estudio jurídico propio.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-5xl bg-white/10 backdrop-blur-xl p-2 md:p-3 rounded-2xl shadow-2xl border border-white/20 mt-auto">
          <div className="bg-white rounded-xl p-3 md:p-4 shadow-inner">
            <form className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-gold-500 transition-colors">
                  <Home className="h-5 w-5" />
                </div>
                <select className="block w-full pl-11 pr-4 py-3.5 border-none bg-gray-50 focus:bg-white text-gray-700 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-gold-500 outline-none transition-all appearance-none cursor-pointer font-medium text-sm">
                  <option value="">Tipo de Propiedad</option>
                  <option value="casa">Casa</option>
                  <option value="departamento">Departamento</option>
                  <option value="terreno">Terreno / Lote</option>
                  <option value="local">Local Comercial</option>
                </select>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-gold-500 transition-colors">
                  <DollarSign className="h-5 w-5" />
                </div>
                <select className="block w-full pl-11 pr-4 py-3.5 border-none bg-gray-50 focus:bg-white text-gray-700 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-gold-500 outline-none transition-all appearance-none cursor-pointer font-medium text-sm">
                  <option value="">Operación</option>
                  <option value="venta">Venta</option>
                  <option value="alquiler">Alquiler</option>
                </select>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-gold-500 transition-colors">
                  <MapPin className="h-5 w-5" />
                </div>
                <select className="block w-full pl-11 pr-4 py-3.5 border-none bg-gray-50 focus:bg-white text-gray-700 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-gold-500 outline-none transition-all appearance-none cursor-pointer font-medium text-sm">
                  <option value="">Ubicación</option>
                  <option value="roldan">Roldán</option>
                  <option value="rosario">Rosario</option>
                  <option value="funes">Funes</option>
                </select>
              </div>
              
              <button type="button" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-6 rounded-lg shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm uppercase tracking-wider">
                <Search className="h-5 w-5" />
                Buscar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
