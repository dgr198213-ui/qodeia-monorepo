-- 0006 · Reconciliación esquema ↔ código (detectada al aplicar en real)
-- Aplicada en el proyecto Supabase mlpxjyqhezeksyininnu el 2026-07-18.
--
-- 1) messages: /api/agent y /api/agent/chat insertan user_id y metadata.
-- 2) tasks: /api/agent/execute inserta user_id, type y result; title opcional.
-- 3) agent_nodes: ensureToolNode/getPageRankScores usan rank_score global.

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);

DROP POLICY IF EXISTS "Usuarios pueden ver sus propios mensajes" ON public.messages;
CREATE POLICY "Usuarios pueden ver sus propios mensajes"
    ON public.messages FOR SELECT TO authenticated
    USING (
        user_id = auth.uid()
        OR project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Usuarios pueden insertar sus propios mensajes" ON public.messages;
CREATE POLICY "Usuarios pueden insertar sus propios mensajes"
    ON public.messages FOR INSERT TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        OR project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    );

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'general';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS result JSONB;
ALTER TABLE public.tasks ALTER COLUMN title DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);

ALTER TABLE public.agent_nodes ADD COLUMN IF NOT EXISTS rank_score DOUBLE PRECISION NOT NULL DEFAULT 0.1;
CREATE INDEX IF NOT EXISTS idx_agent_nodes_rank ON public.agent_nodes(rank_score DESC);
