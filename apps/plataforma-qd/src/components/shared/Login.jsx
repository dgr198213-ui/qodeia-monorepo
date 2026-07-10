import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Shield, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signUp, loading, error, clearError } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      await signIn(email, password);
    } else {
      await signUp(email, password);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    clearError();
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#10221f] rounded-2xl border border-white/5 max-w-md w-full mx-auto animate-fadeIn">
      <div className="w-16 h-16 bg-[#13ecc8]/10 rounded-2xl flex items-center justify-center mb-6">
        <Shield className="text-[#13ecc8]" size={32} />
      </div>

      <h2 className="text-xl font-bold text-white mb-2">
        {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
      </h2>
      <p className="text-sm text-gray-400 mb-8 text-center">
        Accede a Howard OS con tu cuenta de Supabase para sincronizar tus proyectos en la nube.
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 animate-shake">
            <AlertCircle className="text-red-500 shrink-0" size={18} />
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0d1117] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#13ecc8]/50 transition-all"
              placeholder="tu@email.com"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0d1117] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#13ecc8]/50 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#13ecc8] text-[#10221f] font-bold py-3 rounded-xl hover:bg-[#0fc9a8] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            isLogin ? 'Entrar al Sistema' : 'Registrarse'
          )}
        </button>
      </form>

      <div className="w-full flex items-center gap-4 my-6">
      </div>

      <button
        onClick={toggleMode}
        className="mt-6 text-sm text-[#13ecc8] font-medium hover:underline"
      >
        {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
      </button>
    </div>
  );
};

export default Login;
