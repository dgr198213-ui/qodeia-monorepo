'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/proyectos', label: 'Proyectos' },
    { href: '/comunidad', label: 'Comunidad' },
    { href: '/sobre-qodeia', label: 'Sobre QODEIA' },
    { href: '/apoya', label: 'Apoya' },
    { href: '/agente', label: '🤖 Agente' },
    { href: 'https://plataforma-qd.vercel.app', label: '🖥️ Howard OS' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-qodeia-dark-900/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-12 h-12">
              {/* Q Logo SVG */}
              <svg viewBox="0 0 100 100" className="w-full h-full transition-transform group-hover:scale-110">
                <defs>
                  <linearGradient id="qGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0087b1" />
                    <stop offset="100%" stopColor="#00cd91" />
                  </linearGradient>
                </defs>
                <path
                  d="M 50 10 C 27.5 10 10 27.5 10 50 C 10 72.5 27.5 90 50 90 L 65 75"
                  stroke="url(#qGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  className="drop-shadow-lg"
                />
              </svg>
            </div>
            <span className="text-2xl font-display font-bold bg-gradient-to-r from-qodeia-blue-400 to-qodeia-mint-400 bg-clip-text text-transparent">
              qodeia
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-qodeia-mint-400 transition-colors duration-200 font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-gray-300 hover:text-qodeia-mint-400 transition-colors duration-200 font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  )
}
