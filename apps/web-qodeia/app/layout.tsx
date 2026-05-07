import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'QODEIA - Comunidad de innovación y crecimiento compartido',
  description: 'Un espacio para crear, conectar y crecer juntos. Tecnología, ideas y comunidad construyendo futuro paso a paso.',
  keywords: ['qodeia', 'comunidad', 'tecnología', 'innovación', 'proyectos', 'colaboración'],
  authors: [{ name: 'QODEIA' }],
  creator: 'QODEIA',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://qodeia.com',
    title: 'QODEIA - Comunidad de innovación y crecimiento compartido',
    description: 'Un espacio para crear, conectar y crecer juntos.',
    siteName: 'QODEIA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QODEIA - Comunidad de innovación y crecimiento compartido',
    description: 'Un espacio para crear, conectar y crecer juntos.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
