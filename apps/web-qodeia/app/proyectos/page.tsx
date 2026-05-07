'use client'

import Link from 'next/link'

const projects = [
  {
    id: 'howard-os',
    title: 'Howard OS',
    icon: '🖥️',
    status: 'En desarrollo',
    statusColor: 'mint',
    description: 'Un sistema operativo de gestión inteligente que conecta ideas, proyectos y personas. Howard OS es más que una plataforma: es un asistente que crece contigo.',
    story: 'Nació de la necesidad de tener un espacio donde todas las piezas de un proyecto pudieran vivir juntas, donde la gestión no fuera una carga sino una ayuda.',
    features: ['Dashboard inteligente', 'Gestión de tareas y proyectos', 'Colaboración en tiempo real', 'Análisis de productividad'],
    link: 'https://plataforma-qd.vercel.app/',
  },
]

export default function ProyectosPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-qodeia-dark-900 to-qodeia-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6">
              Proyectos que cuentan historias
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Cada proyecto es un camino. Algunos están naciendo, otros están en pleno desarrollo y otros ya vuelan solos. Aquí encontrarás mis creaciones, colaboraciones y también proyectos de terceros que me inspiran o que merecen ser vistos.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 bg-qodeia-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-center text-lg text-qodeia-mint-400 font-semibold mb-12">
              Cada idea tiene un propósito. Cada paso suma.
            </p>

            <div className="space-y-8">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gradient-to-br from-qodeia-dark-700 to-qodeia-dark-800 rounded-2xl p-8 md:p-12 border border-qodeia-blue-500/30 hover:border-qodeia-mint-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-qodeia-blue-500/20"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
                    {/* Icon */}
                    <div className="mb-6 md:mb-0">
                      <div className="w-20 h-20 bg-gradient-to-br from-qodeia-blue-500 to-qodeia-mint-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
                        {project.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-6">
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h2 className="text-3xl font-display font-bold text-white">
                            {project.title}
                          </h2>
                          <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${
                              project.statusColor === 'mint'
                                ? 'bg-qodeia-mint-500/20 text-qodeia-mint-400'
                                : 'bg-qodeia-blue-500/20 text-qodeia-blue-400'
                            }`}
                          >
                            {project.status}
                          </span>
                        </div>
                        <p className="text-gray-300 text-lg leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      {/* Story */}
                      <div className="bg-qodeia-dark-900/50 rounded-xl p-6 border-l-4 border-qodeia-mint-500">
                        <p className="text-gray-400 italic leading-relaxed">
                          &quot;{project.story}&quot;
                        </p>
                      </div>

                      {/* Features */}
                      <div>
                        <h3 className="text-white font-semibold mb-3">Características principales:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {project.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2 text-gray-300">
                              <svg className="w-5 h-5 text-qodeia-mint-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CTA */}
                      {project.link && (
                        <div className="flex flex-wrap gap-4">
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-qodeia-blue-500 to-qodeia-mint-500 text-white font-semibold rounded-lg hover:shadow-xl transition-all duration-300"
                          >
                            Explorar proyecto
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coming Soon */}
            <div className="mt-12 text-center">
              <div className="inline-block bg-qodeia-dark-700 rounded-2xl px-8 py-6 border border-qodeia-blue-500/20">
                <p className="text-gray-400 mb-2">
                  🌱 <span className="text-white font-semibold">Más proyectos en camino</span>
                </p>
                <p className="text-gray-500 text-sm">
                  Nuevas ideas están germinando. Vuelve pronto para descubrirlas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className="py-16 bg-gradient-to-r from-qodeia-blue-900/50 to-qodeia-mint-900/50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
              ¿Algún proyecto te mueve por dentro?
            </h2>
            <p className="text-lg text-gray-300">
              Si algo te inspira, puedes apoyarlo para que siga creciendo.
            </p>
            <Link
              href="/apoya"
              className="inline-block px-8 py-4 bg-white text-qodeia-blue-900 font-bold rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Apoyar QODEIA
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
