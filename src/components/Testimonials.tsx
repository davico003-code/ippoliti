import { Star, MessageSquareQuote } from 'lucide-react';

export default function Testimonials() {
  const reviews = [
    {
      id: 1,
      text: "Excelentes profesionales. Compramos nuestra casa en Tierra de Sueños y el acompañamiento fue total desde el primer día hasta la escritura. El estudio jurídico propio es un plus enorme que da mucha tranquilidad.",
      author: "Martín R.",
      role: "Comprador en Roldán"
    },
    {
      id: 2,
      text: "Atención cálida y familiar. Administran mis propiedades en alquiler hace más de 10 años y nunca tuve un problema. Altamente recomendables para quien busca seriedad y trayectoria.",
      author: "Laura G.",
      role: "Inversora"
    },
    {
      id: 3,
      text: "Tasaron y vendieron mi departamento muy rápido. Se nota la experiencia que tienen en el mercado. Gente honesta y muy trabajadora. Es un placer tratar con ellos.",
      author: "Carlos M.",
      role: "Vendedor en Rosario"
    }
  ];

  return (
    <section className="py-24 bg-white relative border-y border-gray-100">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-30 select-none"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-widest text-gold-500 uppercase mb-3">Testimonios</h2>
          <h3 className="text-4xl md:text-5xl font-bold text-navy-800 font-serif mb-6">Lo que dicen nuestros clientes</h3>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            La recomendación de nuestros clientes es nuestro principal orgullo y nuestra mejor carta de presentación.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-100 p-8 rounded-3xl relative shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_10px_40px_rgb(0,0,0,0.08)] transition-all transform hover:-translate-y-1">
              <MessageSquareQuote className="absolute top-8 right-8 w-12 h-12 text-gray-100 group-hover:text-gold-50/50 transition-colors" />
              
              <div className="flex gap-1 mb-8">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-gold-500 fill-current drop-shadow-sm" />
                ))}
              </div>
              
              <p className="text-gray-600 mb-8 font-light relative z-10 leading-relaxed min-h-[100px]">
                &quot;{review.text}&quot;
              </p>
              
              <div className="flex items-center gap-4 mt-auto pt-6 border-t border-gray-50">
                <div className="w-14 h-14 bg-navy-50 rounded-full flex items-center justify-center text-navy-800 font-bold text-xl uppercase shadow-inner">
                  {review.author.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-navy-800 text-lg">{review.author}</h4>
                  <p className="text-sm font-medium text-gold-600">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
