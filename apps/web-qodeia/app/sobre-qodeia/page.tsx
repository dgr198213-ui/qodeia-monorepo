'use client'

import Link from 'next/link'

export default function SobreQodeiaPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-qodeia-dark-900 to-qodeia-dark-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
                  <defs>
                    <linearGradient id="qGradientAbout" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0087b1" />
                      <stop offset="100%" stopColor="#00cd91" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 50 10 C 27.5 10 10 27.5 10 50 C 10 72.5 27.5 90 50 90 L 65 75"
                    stroke="url(#qGradientAbout)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6">
              Un hogar digital para crecer juntos
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              QODEIA nació como un espacio personal, pero pronto se convirtió en algo más grande: una comunidad abierta donde la tecnología se mezcla con la creatividad y las personas.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-qodeia-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Origin */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-qodeia-blue-500 to-qodeia-mint-500 rounded-xl flex items-center justify-center text-2xl">
                  🌱
                </div>
                <h2 className="text-3xl font-display font-bold text-white">
                  El Origen
                </h2>
              </div>
              <div className="prose prose-lg prose-invert max-w-none">
                <p className="text-gray-300 text-lg leading-relaxed">
                  Todo empezó con una idea simple: crear un espacio donde pudiera experimentar, aprender y compartir sin las presiones del perfeccionismo. Un lugar donde los errores fueran bienvenidos porque son parte del camino.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Con el tiempo, ese espacio personal se fue transformando. Otras personas empezaron a interesarse, a aportar, a querer formar parte. Y así QODEIA dejó de ser solo mío para convertirse en nuestro.
                </p>
              </div>
            </div>

            {/* Values */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-qodeia-mint-500 to-qodeia-blue-500 rounded-xl flex items-center justify-center text-2xl">
                  💎
                </div>
                <h2 className="text-3xl font-display font-bold text-white">
                  Lo que creemos
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-qodeia-dark-700 rounded-xl p-6 border-l-4 border-qodeia-blue-500">
                  <h3 className="text-xl font-semibold text-white mb-3">Innovación con alma</h3>
                  <p className="text-gray-300 leading-relaxed">
                    La tecnología debe estar al servicio de las personas, no al revés. Construimos herramientas que respetan la creatividad y la humanidad.
                  </p>
                </div>
                <div className="bg-qodeia-dark-700 rounded-xl p-6 border-l-4 border-qodeia-mint-500">
                  <h3 className="text-xl font-semibold text-white mb-3">Compartir lo que aprendemos</h3>
                  <p className="text-gray-300 leading-relaxed">
                    El conocimiento crece cuando se comparte. Documentamos, enseñamos y aprendemos en comunidad.
                  </p>
                </div>
                <div className="bg-qodeia-dark-700 rounded-xl p-6 border-l-4 border-qodeia-mint-500">
                  <h3 className="text-xl font-semibold text-white mb-3">Construir puentes</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Entre ideas y personas. Entre lo técnico y lo creativo. Entre el ahora y el futuro que imaginamos.
                  </p>
                </div>
                <div className="bg-qodeia-dark-700 rounded-xl p-6 border-l-4 border-qodeia-blue-500">
                  <h3 className="text-xl font-semibold text-white mb-3">Crecer juntos</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Nadie llega solo a ningún lado. El camino se hace mejor cuando lo recorremos acompañados.
                  </p>
                </div>
              </div>
            </div>

            {/* Mission */}
            <div className="bg-gradient-to-br from-qodeia-blue-900/30 to-qodeia-mint-900/30 rounded-2xl p-8 md:p-12 border border-qodeia-blue-500/30">
              <div className="text-center space-y-6">
                <div className="text-5xl">✨</div>
                <h2 className="text-3xl font-display font-bold text-white">
                  La Misión
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
                  Este es mi lugar para crear, conectar y aportar. Y si tú también sientes esa llamada, eres bienvenido.
                </p>
                <p className="text-lg text-qodeia-mint-400 font-semibold italic">
                  &quot;Crecemos juntos, siempre&quot;
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center space-x-3 text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-lg">Creado con cariño desde Alcalá de Henares, España 🇪🇸</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-16 bg-gradient-to-r from-qodeia-blue-900 to-qodeia-mint-900">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
              ¿Te gustaría formar parte?
            </h2>
            <p className="text-lg text-gray-200 leading-relaxed">
              La comunidad está abierta a todos los que quieran aprender, compartir y construir juntos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/comunidad"
                className="px-8 py-4 bg-white text-qodeia-blue-900 font-bold rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Únete a la Comunidad
              </Link>
              <a
                href="mailto:qodeia_info@gmail.com"
                className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 hover:scale-105 transition-all duration-300"
              >
                Contáctanos
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
