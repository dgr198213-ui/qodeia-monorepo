'use client'

export default function ApoyaPage() {
  const supportWays = [
    {
      icon: '💰',
      title: 'Apoyo Económico',
      description: 'Contribuye al mantenimiento y crecimiento de QODEIA. Cada aporte, por pequeño que sea, ayuda a mantener los servidores, herramientas y permite dedicar más tiempo a crear contenido de valor.',
      action: 'Próximamente',
      color: 'blue',
    },
    {
      icon: '🤝',
      title: 'Colaboración en Proyectos',
      description: 'Aporta tu experiencia, código, diseño o ideas a los proyectos activos. Tu talento puede ser la pieza que falta para hacer algo extraordinario.',
      action: 'Ver proyectos abiertos',
      link: '/proyectos',
      color: 'mint',
    },
    {
      icon: '📣',
      title: 'Difunde la Palabra',
      description: 'Comparte QODEIA con personas que creas que puedan beneficiarse o contribuir. El boca a boca es una de las formas más valiosas de apoyo.',
      action: 'Compartir',
      color: 'blue',
    },
    {
      icon: '✍️',
      title: 'Crea Contenido',
      description: 'Escribe tutoriales, documenta procesos, comparte tu aprendizaje. El conocimiento compartido multiplica su valor.',
      action: 'Contáctanos',
      link: 'mailto:qodeia_info@gmail.com',
      color: 'mint',
    },
  ]

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-qodeia-dark-900 via-qodeia-blue-900/20 to-qodeia-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-6">💛</div>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6">
              Tu apoyo impulsa nuevas ideas
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              Si algo de lo que encuentras aquí te inspira, te ayuda o simplemente te gusta, puedes apoyar este espacio.
            </p>
            <p className="text-lg text-qodeia-mint-400 font-semibold">
              Cada gesto —grande o pequeño— permite que nuevos proyectos nazcan, que nuevas ideas se desarrollen y que esta comunidad siga creciendo.
            </p>
          </div>
        </div>
      </section>

      {/* Ways to Support */}
      <section className="py-16 bg-qodeia-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white text-center mb-12">
              Formas de Apoyar
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {supportWays.map((way, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br from-qodeia-dark-700 to-qodeia-dark-800 rounded-2xl p-8 border ${
                    way.color === 'mint'
                      ? 'border-qodeia-mint-500/30 hover:border-qodeia-mint-500/50'
                      : 'border-qodeia-blue-500/30 hover:border-qodeia-blue-500/50'
                  } transition-all duration-300 hover:shadow-xl`}
                >
                  <div className="text-5xl mb-4">{way.icon}</div>
                  <h3 className="text-2xl font-display font-bold text-white mb-3">
                    {way.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    {way.description}
                  </p>
                  {way.link ? (
                    <a
                      href={way.link}
                      className={`inline-block px-6 py-3 ${
                        way.color === 'mint'
                          ? 'bg-qodeia-mint-500 hover:bg-qodeia-mint-600'
                          : 'bg-qodeia-blue-500 hover:bg-qodeia-blue-600'
                      } text-white font-semibold rounded-lg transition-colors duration-300`}
                    >
                      {way.action}
                    </a>
                  ) : (
                    <span className={`inline-block px-6 py-3 ${
                      way.color === 'mint'
                        ? 'bg-qodeia-mint-500/20 text-qodeia-mint-400'
                        : 'bg-qodeia-blue-500/20 text-qodeia-blue-400'
                    } font-medium rounded-lg`}>
                      {way.action}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-16 bg-gradient-to-b from-qodeia-dark-800 to-qodeia-dark-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white text-center mb-12">
              El Impacto de tu Apoyo
            </h2>
            <div className="space-y-6">
              <div className="bg-qodeia-dark-700 rounded-xl p-6 border-l-4 border-qodeia-mint-500">
                <h3 className="text-xl font-semibold text-white mb-2">🚀 Más Proyectos</h3>
                <p className="text-gray-300 leading-relaxed">
                  Tu apoyo permite dedicar más tiempo a desarrollar nuevas herramientas, plataformas y recursos que benefician a toda la comunidad.
                </p>
              </div>
              <div className="bg-qodeia-dark-700 rounded-xl p-6 border-l-4 border-qodeia-blue-500">
                <h3 className="text-xl font-semibold text-white mb-2">📚 Mejor Contenido</h3>
                <p className="text-gray-300 leading-relaxed">
                  Más tutoriales, guías detalladas, documentación completa y recursos educativos de calidad para todos los niveles.
                </p>
              </div>
              <div className="bg-qodeia-dark-700 rounded-xl p-6 border-l-4 border-qodeia-mint-500">
                <h3 className="text-xl font-semibold text-white mb-2">🌍 Comunidad Más Grande</h3>
                <p className="text-gray-300 leading-relaxed">
                  Infraestructura para soportar más miembros, mejor comunicación y espacios de colaboración más robustos.
                </p>
              </div>
              <div className="bg-qodeia-dark-700 rounded-xl p-6 border-l-4 border-qodeia-blue-500">
                <h3 className="text-xl font-semibold text-white mb-2">🎯 Todo Gratuito y Abierto</h3>
                <p className="text-gray-300 leading-relaxed">
                  Tu apoyo permite mantener todos los recursos y proyectos accesibles y gratuitos para quien los necesite.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparency */}
      <section className="py-16 bg-qodeia-dark-900">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-qodeia-blue-900/30 to-qodeia-mint-900/30 rounded-2xl p-8 md:p-12 border border-qodeia-blue-500/30 text-center">
              <div className="text-5xl mb-6">✨</div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
                Transparencia Total
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-4">
                Creemos en la honestidad y la apertura. Por eso, compartiremos regularmente cómo se utiliza cada aporte y qué proyectos se están desarrollando gracias al apoyo de la comunidad.
              </p>
              <p className="text-qodeia-mint-400 font-semibold">
                Cada euro cuenta. Cada hora importa. Cada persona suma.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gratitude */}
      <section className="py-16 bg-gradient-to-r from-qodeia-blue-900 to-qodeia-mint-900">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
              Gracias por Estar Aquí
            </h2>
            <p className="text-lg text-gray-200 leading-relaxed">
              Ya sea que apoyes con tiempo, talento, difusión o recursos, tu presencia aquí ya es valiosa. Gracias por creer en esta visión de crear, conectar y crecer juntos.
            </p>
            <div className="text-6xl pt-4">💛</div>
            <p className="text-xl text-white font-semibold italic pt-4">
              &quot;Gracias por formar parte del camino&quot;
            </p>
            <div className="pt-8">
              <a
                href="mailto:qodeia_info@gmail.com"
                className="inline-block px-8 py-4 bg-white text-qodeia-blue-900 font-bold rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Contáctanos para más información
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
