import { Award, Users, Scale, Clock } from 'lucide-react';

export default function TrustSection() {
  const stats = [
    {
      icon: <Clock className="w-10 h-10 text-gold-400" />,
      value: "40+",
      label: "Años de Trayectoria",
      description: "Familia dedicada al rubro inmobiliario desde 1983."
    },
    {
      icon: <Award className="w-10 h-10 text-gold-400" />,
      value: "500+",
      label: "Propiedades Vendidas",
      description: "Operaciones exitosas que avalan nuestra experiencia y compromiso."
    },
    {
      icon: <Users className="w-10 h-10 text-gold-400" />,
      value: "100%",
      label: "Atención Personalizada",
      description: "Trato directo y familiar para entender tus necesidades exactas."
    },
    {
      icon: <Scale className="w-10 h-10 text-gold-400" />,
      value: "Estudio",
      label: "Jurídico Propio",
      description: "Asesoramiento legal integral para tu total tranquilidad y seguridad."
    }
  ];

  return (
    <section id="nosotros" className="py-24 bg-navy-800 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-navy-700 rounded-full mix-blend-screen filter blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-900 rounded-full mix-blend-screen filter blur-3xl opacity-30 transform -translate-x-1/2 translate-y-1/2"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-sm font-bold tracking-widest text-gold-400 uppercase mb-3">Nuestra Esencia</h2>
          <h3 className="text-3xl md:text-5xl font-bold font-serif mb-6 leading-tight">
            Transparencia y confianza <br className="hidden md:block"/> desde 1983
          </h3>
          <p className="text-sky-100/80 text-lg sm:text-xl font-light leading-relaxed">
            Somos la inmobiliaria líder en Roldán y la región, brindando soluciones integrales con el respaldo que solo una empresa familiar de tantas décadas puede ofrecer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-navy-900/60 backdrop-blur-md border border-white/5 shadow-2xl p-8 rounded-2xl hover:bg-navy-700 transition-colors group flex flex-col items-center md:items-start text-center md:text-left">
              <div className="w-20 h-20 bg-navy-800/80 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-navy-900 transition-all shadow-inner border border-white/10">
                {stat.icon}
              </div>
              <h4 className="text-4xl lg:text-5xl font-bold text-white mb-2 font-serif">{stat.value}</h4>
              <h5 className="text-lg font-bold text-gold-400 mb-4 uppercase tracking-wide">{stat.label}</h5>
              <p className="text-gray-400 text-base leading-relaxed font-light">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
