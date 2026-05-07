import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Lock, Zap, BarChart3, GitBranch, Shield } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-indigo-400" />
              <h1 className="text-2xl font-bold text-white">QODEIA_TEAM</h1>
            </div>
            <div className="text-sm text-slate-300">
              Bienvenido, <span className="font-semibold text-indigo-400">{user.name}</span>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/dashboard">
              <Card className="p-6 cursor-pointer hover:border-indigo-500 transition-colors h-full">
                <BarChart3 className="h-12 w-12 text-indigo-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Dashboard</h3>
                <p className="text-slate-400 text-sm">Monitoreo en tiempo real de conexiones y agentes</p>
              </Card>
            </Link>

            <Link href="/credentials">
              <Card className="p-6 cursor-pointer hover:border-indigo-500 transition-colors h-full">
                <Lock className="h-12 w-12 text-indigo-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Credenciales</h3>
                <p className="text-slate-400 text-sm">Gestión segura de API Keys cifradas</p>
              </Card>
            </Link>

            <Link href="/connections">
              <Card className="p-6 cursor-pointer hover:border-indigo-500 transition-colors h-full">
                <Zap className="h-12 w-12 text-indigo-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Conexiones</h3>
                <p className="text-slate-400 text-sm">Validar y configurar integraciones</p>
              </Card>
            </Link>

            <Link href="/workflows">
              <Card className="p-6 cursor-pointer hover:border-indigo-500 transition-colors h-full">
                <GitBranch className="h-12 w-12 text-indigo-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Workflows</h3>
                <p className="text-slate-400 text-sm">Orquestación de agentes y procesos</p>
              </Card>
            </Link>

            <Link href="/logs">
              <Card className="p-6 cursor-pointer hover:border-indigo-500 transition-colors h-full">
                <Shield className="h-12 w-12 text-indigo-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Auditoría</h3>
                <p className="text-slate-400 text-sm">Logs y validaciones AMA-G</p>
              </Card>
            </Link>

            <Link href="/architecture">
              <Card className="p-6 cursor-pointer hover:border-indigo-500 transition-colors h-full">
                <Brain className="h-12 w-12 text-indigo-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Arquitectura</h3>
                <p className="text-slate-400 text-sm">Visualización de capas y estado operativo</p>
              </Card>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="max-w-md w-full px-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Brain className="h-16 w-16 text-indigo-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">QODEIA_TEAM</h1>
          <p className="text-slate-400">Plataforma de Orquestación y Monitoreo de Agentes IA</p>
        </div>

        <Card className="p-8 bg-slate-800/50 border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-4">Bienvenido</h2>
          <p className="text-slate-300 mb-6">
            Sistema determinista de gobernanza para IA generativa con integración segura de n8n, Flowise y GitHub.
          </p>

          <Button 
            asChild 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6 text-lg"
          >
            <a href={getLoginUrl()}>
              Iniciar Sesión con Manus
            </a>
          </Button>

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-indigo-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white">Seguridad Máxima</h3>
                <p className="text-sm text-slate-400">Cifrado AES-256 para todas las credenciales</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-indigo-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white">Gobernanza Determinista</h3>
                <p className="text-sm text-slate-400">Middleware AMA-G valida todas las operaciones</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <BarChart3 className="h-5 w-5 text-indigo-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white">Monitoreo en Tiempo Real</h3>
                <p className="text-sm text-slate-400">Visualiza el estado de todas tus conexiones</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
