'use client'

import Link from 'next/link'

export default function ComunidadPage() {
  const resources = [
    {
      icon: '📚',
      title: 'Recursos de Aprendizaje',
      description: 'Tutoriales, guías y documentación para crecer como desarrollador y creativo.',
      status: 'Próximamente',
    },
    {
      icon: '💬',
      title: 'Espacio de Conversación',
      description: 'Un lugar para compartir ideas, hacer preguntas y conocer a otros miembros.',
      status: 'Próximamente',
    },
    {
      icon: '🎨',
      title: 'Proyectos Colaborativos',
      description: 'Iniciativas abiertas donde puedes aportar tu creatividad y talento.',
      status: 'Próximamente',
    },
    {
      icon: '🔧',
      title: 'Herramientas Compartidas',
      description: 'Scripts, templates y recursos útiles creados por la comunidad.',
      status: 'Próximamente',
    },
  ]

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-qodeia-dark-900 to-qodeia-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-6">🤝</div>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6">
              Una comunidad que inspira
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              QODEIA es un punto de encuentro para personas curiosas, creativas y con ganas de construir. Compartimos recursos, reflexiones, herramientas y aprendizajes que nos ayudan a crecer como creadores y como personas.
            </p>
            <p className="text-lg text-qodeia-mint-400 font-semibold">
              No importa si vienes a aportar, a descubrir o simplemente a observar. Este espacio también es tuyo.
            </p>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 bg-qodeia-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white text-center mb-12">
              Lo que encontrarás aquí
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {resources.map((resource, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-qodeia-dark-700 to-qodeia-dark-800 rounded-xl p-8 border border-qodeia-blue-500/30 hover:border-qodeia-mint-500/50 transition-all duration-300"
                >
                  <div className="text-5xl mb-4">{resource.icon}</div>
                  <h3 className="text-2xl font-display font-bold text-white mb-3">
                    {resource.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    {resource.description}
                  </p>
                  <span className="inline-block px-3 py-1 bg-qodeia-mint-500/20 text-qodeia-mint-400 text-sm font-medium rounded-full">
                    {resource.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How to Participate */}
      <section className="py-16 bg-gradient-to-b from-qodeia-dark-800 to-qodeia-dark-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white text-center mb-12">
              Cómo participar
            </h2>
            <div className="space-y-8">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-qodeia-blue-500 to-qodeia-mint-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Explora y descubre</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Navega por los proyectos, lee los recursos y conoce lo que estamos construyendo juntos.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-qodeia-blue-500 to-qodeia-mint-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Comparte tus ideas</h3>
                  <p className="text-gray-300 leading-relaxed">
                    ¿Tienes un proyecto que quieres mostrar? ¿Una idea que podría aportar valor? Cuéntanosla.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-qodeia-blue-500 to-qodeia-mint-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Colabora en proyectos</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Muchos de nuestros proyectos están abiertos a colaboración. Aporta tu talento donde más resuene contigo.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-qodeia-blue-500 to-qodeia-mint-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Crece con nosotros</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Aprender es un viaje continuo. Aquí encontrarás compañeros de camino que te impulsan a ser mejor cada día.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-qodeia-dark-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-qodeia-blue-900/30 to-qodeia-mint-900/30 rounded-2xl p-8 md:p-12 border border-qodeia-blue-500/30 text-center">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
                Nuestros Valores Compartidos
              </h2>
              <div className="grid md:grid-cols-3 gap-8 text-left">
                <div>
                  <div className="text-4xl mb-3">🌟</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Respeto</h3>
                  <p className="text-gray-300 text-sm">
                    Cada persona aporta algo único. Valoramos todas las voces.
                  </p>
                </div>
                <div>
                  <div className="text-4xl mb-3">💡</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Apertura</h3>
                  <p className="text-gray-300 text-sm">
                    Las mejores ideas surgen del intercambio honesto y libre.
                  </p>
                </div>
                <div>
                  <div className="text-4xl mb-3">🚀</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Acción</h3>
                  <p className="text-gray-300 text-sm">
                    Las ideas son el inicio. El valor está en hacerlas realidad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-qodeia-blue-900 to-qodeia-mint-900">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
              ¿Listo para unirte?
            </h2>
            <p className="text-lg text-gray-200 leading-relaxed">
              Estamos construyendo los canales de comunicación de la comunidad. Mientras tanto, puedes escribirnos directamente y te mantendremos informado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="mailto:qodeia_info@gmail.com"
                className="px-8 py-4 bg-white text-qodeia-blue-900 font-bold rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Contáctanos
              </a>
              <Link
                href="/proyectos"
                className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 hover:scale-105 transition-all duration-300"
              >
                Ver Proyectos
              </Link>
            </div>
            <p className="text-gray-300 text-sm pt-4">
              💛 Gracias por formar parte del camino
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
