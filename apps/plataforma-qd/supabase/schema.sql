-- Esquema Idempotente y Seguro para Howard OS / Plataforma-qd
-- Este script se puede ejecutar varias veces sin causar errores.

-- 1. Limpieza de políticas previas para evitar errores de "already exists"
DO $$
BEGIN
    -- Tabla credentials
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'credentials' AND schemaname = 'public') THEN
        DROP POLICY IF EXISTS "Usuarios pueden ver sus propias credenciales" ON public.credentials;
        DROP POLICY IF EXISTS "Usuarios pueden insertar sus propias credenciales" ON public.credentials;
        DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propias credenciales" ON public.credentials;
        DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propias credenciales" ON public.credentials;
    END IF;

    -- Tabla projects
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'projects' AND schemaname = 'public') THEN
        DROP POLICY IF EXISTS "Usuarios pueden ver sus propios proyectos" ON public.projects;
        DROP POLICY IF EXISTS "Usuarios pueden insertar sus propios proyectos" ON public.projects;
        DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propios proyectos" ON public.projects;
        DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propios proyectos" ON public.projects;
    END IF;

    -- Tabla messages
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'messages' AND schemaname = 'public') THEN
        DROP POLICY IF EXISTS "Usuarios pueden ver sus propios mensajes" ON public.messages;
        DROP POLICY IF EXISTS "Usuarios pueden insertar sus propios mensajes" ON public.messages;
    END IF;

    -- Tabla agent_state
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'agent_state' AND schemaname = 'public') THEN
        DROP POLICY IF EXISTS "Usuarios pueden ver su propio agent_state" ON public.agent_state;
        DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio agent_state" ON public.agent_state;
    END IF;

    -- Tabla tasks
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'tasks' AND schemaname = 'public') THEN
        DROP POLICY IF EXISTS "Usuarios pueden ver sus propias tareas" ON public.tasks;
        DROP POLICY IF EXISTS "Usuarios pueden gestionar sus propias tareas" ON public.tasks;
    END IF;
END $$;

-- 2. Creación/Actualización de la Tabla de Credenciales
CREATE TABLE IF NOT EXISTS public.credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT auth.uid() NOT NULL,
    name TEXT NOT NULL,
    username TEXT,
    encrypted_value TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    notes TEXT,
    icon TEXT DEFAULT 'Key',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus propias credenciales" ON public.credentials FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden insertar sus propias credenciales" ON public.credentials FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden actualizar sus propias credenciales" ON public.credentials FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden eliminar sus propias credenciales" ON public.credentials FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- 3. Creación/Actualización de la Tabla de Proyectos
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT auth.uid() NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    files JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus propios proyectos" ON public.projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden insertar sus propios proyectos" ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden actualizar sus propios proyectos" ON public.projects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden eliminar sus propios proyectos" ON public.projects FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- 4. Tabla de Mensajes (No-Code Chat)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT auth.uid() NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios pueden ver sus propios mensajes" ON public.messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden insertar sus propios mensajes" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);


-- 5. Tabla de Estado del Agente
CREATE TABLE IF NOT EXISTS public.agent_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT auth.uid() NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    state JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, project_id)
);

ALTER TABLE public.agent_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios pueden ver su propio agent_state" ON public.agent_state FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden actualizar su propio agent_state" ON public.agent_state FOR ALL TO authenticated USING (auth.uid() = user_id);


-- 6. Tabla de Tareas (AI Task Runner)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT auth.uid() NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    instruction TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    risk_level TEXT DEFAULT 'low',
    requires_approval BOOLEAN DEFAULT false,
    result JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios pueden ver sus propias tareas" ON public.tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden gestionar sus propias tareas" ON public.tasks FOR ALL TO authenticated USING (auth.uid() = user_id);


-- 7. Tabla de Context Memory (CME)
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
CREATE POLICY "Usuarios pueden ver context_memory de sus proyectos"
ON public.context_memory FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.projects WHERE id = context_memory.project_id AND user_id = auth.uid()));

CREATE POLICY "Usuarios pueden actualizar context_memory de sus proyectos"
ON public.context_memory FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.projects WHERE id = context_memory.project_id AND user_id = auth.uid()));


-- 8. Tabla de Archivos de Proyecto (SupabaseSync)
CREATE TABLE IF NOT EXISTS public.project_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    content TEXT,
    language TEXT,
    hash TEXT,
    size INTEGER,
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios pueden ver project_files de sus proyectos"
ON public.project_files FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_files.project_id AND user_id = auth.uid()));

CREATE POLICY "Usuarios pueden gestionar project_files de sus proyectos"
ON public.project_files FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_files.project_id AND user_id = auth.uid()));


-- 9. Tabla de Soluciones del Agente (Knowledge DB)
CREATE TABLE IF NOT EXISTS public.agent_solutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT auth.uid() NOT NULL,
    error_signature TEXT NOT NULL,
    solution_steps JSONB NOT NULL,
    success_count INTEGER DEFAULT 1,
    last_used TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.agent_solutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios pueden ver sus propias soluciones" ON public.agent_solutions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden gestionar sus propias soluciones" ON public.agent_solutions FOR ALL TO authenticated USING (auth.uid() = user_id);
