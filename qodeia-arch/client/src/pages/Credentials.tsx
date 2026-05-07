import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Lock, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function Credentials() {
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    platform: 'n8n' as 'n8n' | 'flowise' | 'github',
    name: '',
    apiKey: '',
  });

  const { data: credentials, isLoading, refetch } = trpc.credentials.list.useQuery();
  const createMutation = trpc.credentials.create.useMutation();
  const deleteMutation = trpc.credentials.delete.useMutation();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.apiKey) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
      toast.success('Credencial creada exitosamente');
      setFormData({ platform: 'n8n', name: '', apiKey: '' });
      setIsOpen(false);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear credencial');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta credencial?')) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success('Credencial eliminada');
      refetch();
    } catch (error) {
      toast.error('Error al eliminar credencial');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Credenciales</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Credencial
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Agregar Nueva Credencial</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label className="text-slate-300">Plataforma</Label>
                  <Select 
                    value={formData.platform}
                    onValueChange={(value) => setFormData({ ...formData, platform: value as 'n8n' | 'flowise' | 'github' })}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="n8n">n8n</SelectItem>
                      <SelectItem value="flowise">Flowise</SelectItem>
                      <SelectItem value="github">GitHub</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-300">Nombre</Label>
                  <Input
                    placeholder="Mi credencial n8n"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <Label className="text-slate-300">API Key</Label>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Pega tu API Key aquí"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {createMutation.isPending ? 'Guardando...' : 'Guardar Credencial'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="text-center text-slate-400">Cargando credenciales...</div>
        ) : credentials && credentials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {credentials.map((cred) => (
              <Card key={cred.id} className="p-6 bg-slate-800 border-slate-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-indigo-400" />
                    <h3 className="font-semibold text-white">{cred.name}</h3>
                  </div>
                  <span className="text-xs px-2 py-1 bg-indigo-900/50 text-indigo-300 rounded">
                    {cred.platform.toUpperCase()}
                  </span>
                </div>

                <p className="text-sm text-slate-400 mb-4">
                  {cred.encryptedValue === '***REDACTED***' ? (
                    <span className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Cifrada y protegida
                    </span>
                  ) : (
                    cred.encryptedValue
                  )}
                </p>

                <div className="text-xs text-slate-500 mb-4">
                  Creada: {new Date(cred.createdAt).toLocaleDateString('es-ES')}
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(cred.id)}
                  disabled={deleteMutation.isPending}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center bg-slate-800 border-slate-700">
            <Lock className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No hay credenciales</h3>
            <p className="text-slate-400 mb-6">Crea tu primera credencial para conectar n8n, Flowise o GitHub</p>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Credencial
                </Button>
              </DialogTrigger>
            </Dialog>
          </Card>
        )}
      </main>
    </div>
  );
}
