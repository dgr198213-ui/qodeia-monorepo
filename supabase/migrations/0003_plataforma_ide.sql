-- =============================================================
-- 0003 · Plataforma IDE (Howard OS): memoria de proyecto y soluciones
-- Origen reconciliado: apps/plataforma-qd/supabase/schema.sql +
--   packages/agent-core/supabase_mcp_update.sql
-- Nota: `projects`, `messages`, `tasks`, `credentials` y `agent_state`
--   ya están definidas en 0001; aquí solo lo que faltaba.
-- =============================================================

-- Memoria de contexto por proyecto (la que consume ContextMemoryPanel)
CREATE TABLE IF NOT EXISTS public.context_memory (
    project_id UUID PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
    full_context TEXT,
    compressed_context TEXT,
    semantic_index JSONB,
    token_estimate INTEGER,
    files_count INTEGER,
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.context_memory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "context_memory por dueño de proyecto" ON public.context_memory;
CREATE POLICY "context_memory por dueño de proyecto"
ON public.context_memory FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = context_memory.project_id AND p.user_id = auth.uid()
));

-- Índice de archivos de proyecto (CodeEditor / ProjectsManager)
CREATE TABLE IF NOT EXISTS public.project_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    content TEXT,
    language TEXT,
    hash TEXT,
    size INTEGER,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (project_id, path)
);

CREATE INDEX IF NOT EXISTS idx_project_files_project ON public.project_files(project_id);

ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "project_files por dueño de proyecto" ON public.project_files;
CREATE POLICY "project_files por dueño de proyecto"
ON public.project_files FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_files.project_id AND p.user_id = auth.uid()
));

-- Soluciones validadas (mcpService.syncSolution / findSolution del agente).
-- Reconciliación: error_signature UNIQUE (versión mcp_update) para permitir
-- upsert idempotente, + user_id (versión plataforma) para RLS.
CREATE TABLE IF NOT EXISTS public.agent_solutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT auth.uid(),
    error_signature TEXT NOT NULL UNIQUE,
    solution_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    success_count INTEGER DEFAULT 1,
    last_used TIMESTAMPTZ DEFAULT now(),
    synced_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.agent_solutions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "soluciones legibles por autenticados" ON public.agent_solutions;
-- Las soluciones son conocimiento compartido del ecosistema: cualquier
-- usuario autenticado puede leerlas; la escritura va vía backend.
CREATE POLICY "soluciones legibles por autenticados"
ON public.agent_solutions FOR SELECT TO authenticated USING (true);
