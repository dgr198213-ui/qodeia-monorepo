'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOperativeSupabase } from '@/lib/supabase';

/**
 * Login del portal (email + contraseña).
 *
 * Se eliminó el OAuth de Google: para la etapa actual del proyecto, un único
 * método simple sin dependencias de Google Cloud Console. Si algún día se
 * quiere recuperar "Continuar con Google", basta reactivar el proveedor en
 * Supabase y añadir el botón — las identidades se vinculan por email.
 */
export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const supabase = getOperativeSupabase();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email || !password || loading) return;
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          router.push('/dashboard');
        } else {
          setInfo('Cuenta creada. Revisa tu correo para confirmar el registro.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-qodeia-dark-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center mb-6">
          <div className="w-20 h-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <linearGradient id="qGradientLogin" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0087b1" />
                  <stop offset="100%" stopColor="#00cd91" />
                </linearGradient>
              </defs>
              <path
                d="M 50 10 C 27.5 10 10 27.5 10 50 C 10 72.5 27.5 90 50 90 L 65 75"
                stroke="url(#qGradientLogin)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </Link>
        <h2 className="text-center text-3xl font-display font-extrabold text-white">
          {mode === 'login' ? 'Bienvenido a QodeIA' : 'Crea tu cuenta'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          {mode === 'login'
            ? 'Inicia sesión para acceder a tu espacio de trabajo'
            : 'Un registro para todo el ecosistema QodeIA'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-qodeia-dark-800 py-8 px-4 shadow-xl border border-qodeia-blue-500/20 sm:rounded-lg sm:px-10">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="tu@email.com"
                className="w-full rounded-md bg-qodeia-dark-900 border border-gray-600 px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-qodeia-mint-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                minLength={6}
                className="w-full rounded-md bg-qodeia-dark-900 border border-gray-600 px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-qodeia-mint-400 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !email || !password}
              className="w-full flex justify-center items-center py-3 px-4 rounded-md shadow-sm bg-gradient-to-r from-qodeia-blue-500 to-qodeia-mint-400 text-sm font-bold text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-qodeia-blue-500 transition-all disabled:opacity-50"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : mode === 'login' ? (
                'Iniciar sesión'
              ) : (
                'Crear cuenta'
              )}
            </button>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}
            {info && (
              <div className="bg-qodeia-mint-400/10 border border-qodeia-mint-400/20 rounded-md p-3">
                <p className="text-sm text-qodeia-mint-400 text-center">{info}</p>
              </div>
            )}

            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setInfo(null); }}
              className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors"
            >
              {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-qodeia-dark-800 text-gray-400 font-display">
                  Tecnología para crecer juntos
                </span>
              </div>
            </div>

            <div className="text-center">
              <Link href="/" className="text-sm font-medium text-qodeia-mint-400 hover:text-qodeia-mint-300 transition-colors">
                ← Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
