'use client'

import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-qodeia-dark-800 border-t border-qodeia-dark-700">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo y descripción */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <linearGradient id="qGradientFooter" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0087b1" />
                      <stop offset="100%" stopColor="#00cd91" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 50 10 C 27.5 10 10 27.5 10 50 C 10 72.5 27.5 90 50 90 L 65 75"
                    stroke="url(#qGradientFooter)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="text-xl font-display font-bold bg-gradient-to-r from-qodeia-blue-400 to-qodeia-mint-400 bg-clip-text text-transparent">
                qodeia
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Comunidad de innovación y crecimiento compartido
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-white font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-qodeia-mint-400 transition-colors text-sm">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/proyectos" className="text-gray-400 hover:text-qodeia-mint-400 transition-colors text-sm">
                  Proyectos
                </Link>
              </li>
              <li>
                <Link href="/comunidad" className="text-gray-400 hover:text-qodeia-mint-400 transition-colors text-sm">
                  Comunidad
                </Link>
              </li>
              <li>
                <Link href="/sobre-qodeia" className="text-gray-400 hover:text-qodeia-mint-400 transition-colors text-sm">
                  Sobre QODEIA
                </Link>
              </li>
              <li>
                <Link href="/apoya" className="text-gray-400 hover:text-qodeia-mint-400 transition-colors text-sm">
                  Apoya
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:qodeia_info@gmail.com"
                  className="text-gray-400 hover:text-qodeia-mint-400 transition-colors text-sm flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>qodeia_info@gmail.com</span>
                </a>
              </li>
              <li className="text-gray-400 text-sm flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Alcalá de Henares, España</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-qodeia-dark-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">
              © {currentYear} QODEIA. Creado con cariño desde Alcalá de Henares.
            </p>
            <p className="text-gray-500 text-sm italic">
              Crecemos juntos, siempre ✨
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
