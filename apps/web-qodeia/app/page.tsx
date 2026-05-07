'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background gradient animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-qodeia-dark-900 via-qodeia-dark-800 to-qodeia-blue-900 opacity-50"></div>

        {/* Animated circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-qodeia-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-qodeia-mint-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>

        <div className={`container mx-auto px-6 relative z-10 text-center transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          {/* Logo animado */}
          <div className="mb-8 flex justify-center">
            <div className="w-32 h-32 animate-float">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
                <defs>
                  <linearGradient id="qGradientHero" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0087b1" />
                    <stop offset="100%" stopColor="#00cd91" />
                  </linearGradient>
                </defs>
                <path
                  d="M 50 10 C 27.5 10 10 27.5 10 50 C 10 72.5 27.5 90 50 90 L 65 75"
                  stroke="url(#qGradientHero)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  className="glow-blue"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 bg-gradient-to-r from-white via-qodeia-blue-300 to-qodeia-mint-300 bg-clip-text text-transparent leading-tight">
            QODEIA: Un espacio para crear, conectar y crecer juntos
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Tecnología, ideas y comunidad construyendo futuro paso a paso.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/proyectos"
              className="px-8 py-4 bg-gradient-to-r from-qodeia-blue-600 to-qodeia-mint-800 text-white font-semibold rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Explorar Proyectos
            </Link>
            <Link
              href="/comunidad"
              className="px-8 py-4 border-2 border-qodeia-blue-400 text-qodeia-blue-300 font-semibold rounded-full hover:bg-qodeia-blue-500/10 hover:scale-105 transition-all duration-300"
            >
              Únete a la Comunidad
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-qodeia-mint-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-24 bg-qodeia-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Bienvenido a QODEIA
            </h2>
            <div className="text-lg text-gray-300 leading-relaxed space-y-6">
              <p>
                En QODEIA creemos que las ideas no nacen solas. Crecen cuando se comparten, cuando alguien las escucha, cuando otro aporta una chispa nueva.
              </p>
              <p>
                Este es un lugar para explorar, aprender, colaborar y apoyar proyectos que buscan algo más que resultados: buscan sentido.
              </p>
              <p className="text-xl text-qodeia-mint-400 font-semibold">
                Aquí no caminamos solos. Aquí avanzamos juntos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-24 bg-gradient-to-b from-qodeia-dark-800 to-qodeia-dark-900">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
                Una comunidad que inspira
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                QODEIA es un punto de encuentro para personas curiosas, creativas y con ganas de construir.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                Compartimos recursos, reflexiones, herramientas y aprendizajes que nos ayudan a crecer como creadores y como personas.
              </p>
              <p className="text-lg text-qodeia-blue-400 font-medium">
                No importa si vienes a aportar, a descubrir o simplemente a observar. Este espacio también es tuyo.
              </p>
              <Link
                href="/comunidad"
                className="inline-block px-6 py-3 bg-qodeia-blue-700 text-white font-semibold rounded-lg hover:bg-qodeia-blue-600 transition-colors duration-300 mt-4"
              >
                Conoce la Comunidad →
              </Link>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-qodeia-blue-600/20 to-qodeia-mint-600/20 rounded-3xl flex items-center justify-center border border-qodeia-blue-500/30">
                <div className="text-center space-y-4">
                  <div className="text-6xl">🤝</div>
                  <p className="text-qodeia-mint-400 font-semibold text-xl">Construimos juntos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Teaser */}
      <section className="py-24 bg-qodeia-dark-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Proyectos que cuentan historias
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Cada proyecto es un camino. Algunos están naciendo, otros están en pleno desarrollo y otros ya vuelan solos.
            </p>
          </div>

          {/* Featured Project - Howard OS */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-qodeia-dark-700 to-qodeia-dark-800 rounded-2xl p-8 md:p-12 border border-qodeia-blue-500/30 hover:border-qodeia-mint-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-qodeia-blue-500/20">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-qodeia-blue-500 to-qodeia-mint-500 rounded-xl flex items-center justify-center text-3xl">
                  🖥️
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-white mb-2">Howard OS</h3>
                  <span className="inline-block px-3 py-1 bg-qodeia-mint-500/20 text-qodeia-mint-400 text-sm font-medium rounded-full">
                    En desarrollo
                  </span>
                </div>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Un sistema operativo de gestión inteligente que conecta ideas, proyectos y personas. Howard OS es más que una plataforma: es un asistente que crece contigo.
              </p>
              <Link
                href="/proyectos"
                className="inline-flex items-center text-qodeia-mint-400 hover:text-qodeia-mint-300 font-semibold transition-colors"
              >
                Ver todos los proyectos
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-qodeia-blue-900 to-qodeia-mint-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
              Tu apoyo impulsa nuevas ideas
            </h2>
            <p className="text-xl text-gray-200 leading-relaxed">
              Si algo de lo que encuentras aquí te inspira, te ayuda o simplemente te gusta, puedes apoyar este espacio. Cada gesto —grande o pequeño— permite que nuevos proyectos nazcan y que esta comunidad siga creciendo.
            </p>
            <Link
              href="/apoya"
              className="inline-block px-10 py-5 bg-white text-qodeia-blue-900 font-bold rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg"
            >
              Apoyar QODEIA
            </Link>
            <p className="text-gray-300 text-sm">
              Gracias por formar parte del camino 💛
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
