'use client';

/**
 * QodeIA Unified Dashboard
 * Panel de control unificado para todo el ecosistema QodeIA
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileCode2,
  Bot,
  Globe,
  Users,
  TrendingUp,
  Clock,
  Activity,
  Plus,
  ArrowRight,
  GitBranch,
  Cloud,
  Database,
  Zap,
  BarChart3,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';

// Types
interface Project {
  id: string;
  name: string;
  description?: string;
  repo_url?: string;
  deployment_url?: string;
  created_at: string;
  updated_at: string;
}

interface Conversation {
  id: string;
  type: 'chat' | 'agent' | 'ide';
  title?: string;
  updated_at: string;
  messages_count?: number;
  project_name?: string;
}

interface AgentTask {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority: number;
  created_at: string;
  project_name?: string;
}

interface UsageStats {
  total_actions: number;
  actions_by_type: Record<string, number>;
  daily_usage: { date: string; count: number }[];
}

interface UserProfile {
  display_name: string;
  avatar_url?: string;
  plan: 'free' | 'pro' | 'enterprise';
}

interface DashboardData {
  projects: Project[];
  conversations: Conversation[];
  tasks: AgentTask[];
  stats: UsageStats;
  user: UserProfile | null;
}

// Mock data for demonstration
const mockData: DashboardData = {
  projects: [
    {
      id: '1',
      name: 'Howard OS',
      description: 'Sistema operativo de gestión inteligente',
      repo_url: 'https://github.com/dgr198213-ui/Plataforma-qd',
      deployment_url: 'https://plataforma-qd.vercel.app',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T15:30:00Z',
    },
    {
      id: '2',
      name: 'QodeIA Agent',
      description: 'Agente autónomo Full-Stack',
      repo_url: 'https://github.com/dgr198213-ui/Mi-agente-QodeIA-',
      deployment_url: 'https://mi-agente-qode-ia.vercel.app',
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-19T12:00:00Z',
    },
    {
      id: '3',
      name: 'Web QodeIA',
      description: 'Portal central de la comunidad',
      repo_url: 'https://github.com/dgr198213-ui/Web-QodeIA-',
      deployment_url: 'https://web-qode-ia.vercel.app',
      created_at: '2024-01-05T08:00:00Z',
      updated_at: '2024-01-18T16:45:00Z',
    },
  ],
  conversations: [
    {
      id: '1',
      type: 'agent',
      title: 'Optimización de Howard OS',
      updated_at: '2024-01-20T15:30:00Z',
      messages_count: 24,
      project_name: 'Howard OS',
    },
    {
      id: '2',
      type: 'chat',
      title: 'Consulta sobre MCP',
      updated_at: '2024-01-19T14:20:00Z',
      messages_count: 12,
    },
    {
      id: '3',
      type: 'ide',
      title: 'Desarrollo de componentes',
      updated_at: '2024-01-18T11:00:00Z',
      messages_count: 45,
      project_name: 'Howard OS',
    },
  ],
  tasks: [
    {
      id: '1',
      title: 'Implementar autenticación social',
      status: 'completed',
      priority: 1,
      created_at: '2024-01-15T10:00:00Z',
      project_name: 'Howard OS',
    },
    {
      id: '2',
      title: 'Optimizar rendimiento del IDE',
      status: 'running',
      priority: 2,
      created_at: '2024-01-18T09:00:00Z',
      project_name: 'Howard OS',
    },
    {
      id: '3',
      title: 'Documentar API del agente',
      status: 'pending',
      priority: 0,
      created_at: '2024-01-20T08:00:00Z',
      project_name: 'QodeIA Agent',
    },
    {
      id: '4',
      title: 'Integrar Supabase',
      status: 'failed',
      priority: 1,
      created_at: '2024-01-12T14:00:00Z',
    },
  ],
  stats: {
    total_actions: 1247,
    actions_by_type: {
      'code_generated': 456,
      'file_created': 234,
      'deployment': 89,
      'conversation': 312,
      'task_completed': 156,
    },
    daily_usage: [
      { date: '2024-01-14', count: 45 },
      { date: '2024-01-15', count: 67 },
      { date: '2024-01-16', count: 89 },
      { date: '2024-01-17', count: 56 },
      { date: '2024-01-18', count: 78 },
      { date: '2024-01-19', count: 92 },
      { date: '2024-01-20', count: 85 },
    ],
  },
  user: {
    display_name: 'Usuario QodeIA',
    avatar_url: undefined,
    plan: 'pro',
  },
};

// Utility functions
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
  if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  return 'Ahora mismo';
}

function getStatusColor(status: AgentTask['status']): string {
  const colors: Record<AgentTask['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    running: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-700',
  };
  return colors[status];
}

function getStatusIcon(status: AgentTask['status']) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'failed':
      return <XCircle className="w-4 h-4" />;
    case 'running':
      return <Loader2 className="w-4 h-4 animate-spin" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
}

function getConversationIcon(type: Conversation['type']) {
  switch (type) {
    case 'agent':
      return <Bot className="w-4 h-4" />;
    case 'chat':
      return <Globe className="w-4 h-4" />;
    case 'ide':
      return <FileCode2 className="w-4 h-4" />;
  }
}

// Components
function StatCard({
  title,
  value,
  icon,
  color,
  href,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'warning' | 'info';
  href?: string;
}) {
  const colorClasses: Record<string, { bg: string; text: string }> = {
    primary: { bg: 'bg-qodeia-blue-500/10', text: 'text-qodeia-blue-500' },
    secondary: { bg: 'bg-qodeia-mint-500/10', text: 'text-qodeia-mint-500' },
    warning: { bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
    info: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
  };

  const classes = colorClasses[color];

  return (
    <Link href={href || '#'} className="block">
      <div className="bg-qodeia-dark-700 rounded-xl p-6 hover:bg-qodeia-dark-600 transition-all duration-200 hover:shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${classes.bg} ${classes.text}`}>
            {icon}
          </div>
        </div>
      </div>
    </Link>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/proyectos/${project.id}`}
      className="block bg-qodeia-dark-700 rounded-xl p-5 hover:bg-qodeia-dark-600 transition-all duration-200 hover:shadow-lg border border-transparent hover:border-qodeia-blue-500/30"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-qodeia-blue-500 to-qodeia-mint-500 rounded-xl flex items-center justify-center text-xl">
          🖥️
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate mb-1">{project.name}</h3>
          <p className="text-gray-400 text-sm truncate mb-3">{project.description}</p>
          <div className="flex items-center gap-4 text-xs">
            {project.repo_url && (
              <span className="flex items-center gap-1 text-gray-500">
                <GitBranch className="w-3 h-3" />
                GitHub
              </span>
            )}
            {project.deployment_url && (
              <span className="flex items-center gap-1 text-qodeia-mint-500">
                <Cloud className="w-3 h-3" />
                Deploy
              </span>
            )}
            <span className="text-gray-500">
              {formatRelativeTime(project.updated_at)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ConversationItem({ conversation }: { conversation: Conversation }) {
  return (
    <Link
      href={`/conversations/${conversation.id}`}
      className="flex items-center gap-4 p-4 rounded-xl hover:bg-qodeia-dark-600 transition-all duration-200"
    >
      <div
        className={`p-2 rounded-lg ${
          conversation.type === 'agent'
            ? 'bg-qodeia-blue-500/20 text-qodeia-blue-400'
            : conversation.type === 'chat'
            ? 'bg-qodeia-mint-500/20 text-qodeia-mint-400'
            : 'bg-purple-500/20 text-purple-400'
        }`}
      >
        {getConversationIcon(conversation.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">
          {conversation.title || 'Conversación sin título'}
        </p>
        <p className="text-xs text-gray-500">
          {conversation.project_name && `${conversation.project_name} • `}
          {conversation.messages_count} mensajes
        </p>
      </div>
      <span className="text-xs text-gray-500">
        {formatRelativeTime(conversation.updated_at)}
      </span>
    </Link>
  );
}

function TaskItem({ task }: { task: AgentTask }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-qodeia-dark-600 transition-all duration-200">
      <div className={`p-2 rounded-lg ${getStatusColor(task.status)}`}>
        {getStatusIcon(task.status)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{task.title}</p>
        <p className="text-xs text-gray-500">
          {task.project_name && `${task.project_name} • `}
          Prioridad: {task.priority > 0 ? `+${task.priority}` : 'Normal'}
        </p>
      </div>
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
          task.status
        )}`}
      >
        {task.status}
      </span>
    </div>
  );
}

function QuickAction({
  title,
  description,
  icon,
  href,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center p-6 rounded-xl border-2 border-qodeia-dark-600 hover:border-qodeia-blue-500 hover:bg-qodeia-blue-500/5 transition-all duration-200 text-center group"
    >
      <div className="text-qodeia-blue-400 mb-3 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs text-gray-500">{description}</p>
    </Link>
  );
}

function ActivityChart({ data }: { data: UsageStats['daily_usage'] }) {
  const maxValue = Math.max(...data.map((d) => d.count));

  return (
    <div className="h-40 flex items-end gap-2">
      {data.map((item, index) => (
        <div key={item.date} className="flex-1 flex flex-col items-center gap-2">
          <div
            className="w-full bg-gradient-to-t from-qodeia-blue-600 to-qodeia-mint-500 rounded-t-sm transition-all duration-300 hover:from-qodeia-blue-500 hover:to-qodeia-mint-400"
            style={{ height: `${(item.count / maxValue) * 100}%` }}
          />
          <span className="text-xs text-gray-500">
            {new Date(item.date).toLocaleDateString('es-ES', { weekday: 'short' }).slice(0, 2)}
          </span>
        </div>
      ))}
    </div>
  );
}

// Main Dashboard Component
export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setData(mockData);
      setIsLoading(false);
    };

    loadData();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-qodeia-dark-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-qodeia-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const pendingTasks = data.tasks.filter((t) => t.status === 'pending').length;
  const runningTasks = data.tasks.filter((t) => t.status === 'running').length;

  return (
    <div className="min-h-screen bg-qodeia-dark-900">
      {/* Header */}
      <header className="bg-qodeia-dark-800 border-b border-qodeia-dark-600 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-qodeia-blue-500 to-qodeia-mint-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Q</span>
                </div>
                <span className="text-xl font-bold text-white">QodeIA</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6 ml-8">
                <Link href="/dashboard" className="text-qodeia-blue-400 font-medium">
                  Dashboard
                </Link>
                <Link href="/proyectos" className="text-gray-400 hover:text-white transition-colors">
                  Proyectos
                </Link>
                <Link href="/conversations" className="text-gray-400 hover:text-white transition-colors">
                  Conversaciones
                </Link>
                <Link href="/agent" className="text-gray-400 hover:text-white transition-colors">
                  Agente
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-qodeia-mint-500/20 text-qodeia-mint-400 text-sm font-medium rounded-full capitalize">
                {data.user?.plan}
              </span>
              <div className="w-10 h-10 bg-gradient-to-br from-qodeia-blue-500 to-qodeia-mint-500 rounded-full flex items-center justify-center text-white font-bold">
                {data.user?.display_name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Bienvenido, {data.user?.display_name}
            </h1>
            <p className="text-gray-400">
              Aquí está el resumen de tu actividad en QodeIA
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/ide"
              className="flex items-center gap-2 px-4 py-2 bg-qodeia-blue-600 text-white rounded-lg hover:bg-qodeia-blue-500 transition-colors"
            >
              <FileCode2 className="w-4 h-4" />
              Abrir IDE
            </Link>
            <Link
              href="/agent/chat"
              className="flex items-center gap-2 px-4 py-2 bg-qodeia-dark-700 text-white rounded-lg hover:bg-qodeia-dark-600 transition-colors border border-qodeia-dark-600"
            >
              <Bot className="w-4 h-4" />
              Chat con Agente
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Proyectos"
            value={data.projects.length}
            icon={<FileCode2 className="w-6 h-6" />}
            color="primary"
            href="/proyectos"
          />
          <StatCard
            title="Conversaciones"
            value={data.conversations.length}
            icon={<Globe className="w-6 h-6" />}
            color="secondary"
            href="/conversations"
          />
          <StatCard
            title="Tareas Pendientes"
            value={pendingTasks}
            icon={<Clock className="w-6 h-6" />}
            color="warning"
            href="/agent/tasks"
          />
          <StatCard
            title="Acciones Totales"
            value={data.stats.total_actions.toLocaleString()}
            icon={<Activity className="w-6 h-6" />}
            color="info"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Projects */}
          <div className="lg:col-span-2 bg-qodeia-dark-800 rounded-xl border border-qodeia-dark-600 overflow-hidden">
            <div className="p-6 border-b border-qodeia-dark-600 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Proyectos</h2>
                <p className="text-gray-400 text-sm">
                  Tus proyectos activos en el ecosistema QodeIA
                </p>
              </div>
              <Link
                href="/proyectos/new"
                className="flex items-center gap-2 px-4 py-2 bg-qodeia-blue-600 text-white rounded-lg hover:bg-qodeia-blue-500 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Nuevo
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {data.projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-qodeia-dark-800 rounded-xl border border-qodeia-dark-600 overflow-hidden">
            <div className="p-6 border-b border-qodeia-dark-600">
              <h2 className="text-xl font-bold text-white mb-1">Acciones Rápidas</h2>
              <p className="text-gray-400 text-sm">Accede rápidamente a las funciones principales</p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <QuickAction
                title="Nuevo Proyecto"
                description="Crear desde cero"
                icon={<Plus className="w-6 h-6" />}
                href="/proyectos/new"
              />
              <QuickAction
                title="Chat IA"
                description="Consultas rápidas"
                icon={<Bot className="w-6 h-6" />}
                href="/agent/chat"
              />
              <QuickAction
                title="IDE"
                description="Editor de código"
                icon={<FileCode2 className="w-6 h-6" />}
                href="/ide"
              />
              <QuickAction
                title="Tareas"
                description="Gestionar flujos"
                icon={<Zap className="w-6 h-6" />}
                href="/agent/tasks"
              />
            </div>
          </div>
        </div>

        {/* Secondary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Conversations */}
          <div className="bg-qodeia-dark-800 rounded-xl border border-qodeia-dark-600 overflow-hidden">
            <div className="p-6 border-b border-qodeia-dark-600 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Conversaciones Recientes</h2>
                <p className="text-gray-400 text-sm">Últimas conversaciones con IA</p>
              </div>
              <Link
                href="/conversations"
                className="text-qodeia-blue-400 hover:text-qodeia-blue-300 text-sm flex items-center gap-1"
              >
                Ver todas
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-qodeia-dark-600">
              {data.conversations.slice(0, 4).map((conversation) => (
                <ConversationItem key={conversation.id} conversation={conversation} />
              ))}
            </div>
          </div>

          {/* Agent Tasks */}
          <div className="bg-qodeia-dark-800 rounded-xl border border-qodeia-dark-600 overflow-hidden">
            <div className="p-6 border-b border-qodeia-dark-600 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Tareas del Agente</h2>
                <p className="text-gray-400 text-sm">
                  {runningTasks > 0 ? `${runningTasks} en ejecución` : 'Sin tareas en ejecución'}
                </p>
              </div>
              <Link
                href="/agent/tasks"
                className="text-qodeia-blue-400 hover:text-qodeia-blue-300 text-sm flex items-center gap-1"
              >
                Ver todas
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-qodeia-dark-600">
              {data.tasks.slice(0, 4).map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-qodeia-dark-800 rounded-xl border border-qodeia-dark-600 overflow-hidden">
          <div className="p-6 border-b border-qodeia-dark-600 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Actividad Semanal</h2>
              <p className="text-gray-400 text-sm">Acciones realizadas en los últimos 7 días</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              {Object.entries(data.stats.actions_by_type)
                .slice(0, 3)
                .map(([type, count]) => (
                  <div key={type} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-qodeia-blue-500 rounded-full" />
                    <span className="text-gray-400 capitalize">
                      {type.replace('_', ' ')}: {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>
          <div className="p-6">
            <ActivityChart data={data.stats.daily_usage} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-qodeia-dark-800 border-t border-qodeia-dark-600 mt-12">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between text-gray-500 text-sm">
            <p>© 2024 QodeIA. Todos los derechos reservados.</p>
            <div className="flex items-center gap-4">
              <Link href="/sobre-qodeia" className="hover:text-white transition-colors">
                Sobre QodeIA
              </Link>
              <Link href="/admin/mcp" className="hover:text-white transition-colors">
                Admin MCP
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
