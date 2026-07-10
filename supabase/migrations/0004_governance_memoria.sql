-- =============================================================
-- 0004 · Governance PageRank y memoria del agente
-- Origen: packages/agent-core/supabase_pagerank_updates.sql +
--   definiciones NUEVAS deducidas del código para tablas que
--   agent/core/governance.ts y pagerank.ts usaban SIN que existiera
--   su CREATE TABLE en ningún esquema (agent_governance,
--   agent_governance_ctx, agent_transitions_ctx, agent_audit_logs,
--   agent_memory).
-- =============================================================

-- Configuración global de governance (governance.ts lee damping_factor,
-- escribe last_run). Singleton: una sola fila.
CREATE TABLE IF NOT EXISTS public.agent_governance (
    id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id = true),
    damping_factor DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    last_run TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now()
);
INSERT INTO public.agent_governance (id) VALUES (true) ON CONFLICT DO NOTHING;

-- Configuración de governance por contexto
CREATE TABLE IF NOT EXISTS public.agent_governance_ctx (
    context_id UUID PRIMARY KEY REFERENCES public.agent_contexts(id) ON DELETE CASCADE,
    damping_factor DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    last_run TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Transiciones ponderadas por contexto (increment_transition_ctx)
CREATE TABLE IF NOT EXISTS public.agent_transitions_ctx (
    from_node UUID NOT NULL REFERENCES public.agent_nodes(id) ON DELETE CASCADE,
    to_node UUID NOT NULL REFERENCES public.agent_nodes(id) ON DELETE CASCADE,
    context_id UUID NOT NULL REFERENCES public.agent_contexts(id) ON DELETE CASCADE,
    weight DOUBLE PRECISION NOT NULL DEFAULT 0,
    PRIMARY KEY (from_node, to_node, context_id)
);

-- Auditoría de acciones del agente (guardrails / logger)
CREATE TABLE IF NOT EXISTS public.agent_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT NOT NULL,
    resource TEXT,
    approved BOOLEAN,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.agent_audit_logs(created_at DESC);

-- Memoria semántica del agente (EnhancedContextMemory / embeddings).
-- Adaptada de packages/agent-core/supabase/schema.sql sin el enum
-- memory_type (TEXT + CHECK: más simple de migrar) ni la FK a
-- agent_sessions (tabla de un esquema antiguo no consolidado).
CREATE TABLE IF NOT EXISTS public.agent_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL DEFAULT 'note',
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    session_id UUID,
    importance DOUBLE PRECISION DEFAULT 0.5,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding_status TEXT DEFAULT 'pending'
        CHECK (embedding_status IN ('pending', 'processing', 'completed', 'failed')),
    last_accessed TIMESTAMPTZ DEFAULT now(),
    access_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_agent_memory_project ON public.agent_memory(project_id);

ALTER TABLE public.agent_governance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_governance_ctx ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_transitions_ctx ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;
-- Todas estas tablas son internas del agente: sin policies para
-- authenticated (denegado por defecto); solo el backend service-role opera.

-- Funciones de incremento atómico (de supabase_pagerank_updates.sql)
CREATE OR REPLACE FUNCTION public.increment_transition_ctx(
    p_from_node UUID,
    p_to_node UUID,
    p_context_id UUID,
    p_increment DOUBLE PRECISION DEFAULT 1.0
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.agent_transitions_ctx (from_node, to_node, context_id, weight)
    VALUES (p_from_node, p_to_node, p_context_id, p_increment)
    ON CONFLICT (from_node, to_node, context_id)
    DO UPDATE SET weight = public.agent_transitions_ctx.weight + p_increment;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_transition_global(
    p_from_node UUID,
    p_to_node UUID,
    p_increment DOUBLE PRECISION DEFAULT 1.0
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.agent_transitions (from_node, to_node, weight)
    VALUES (p_from_node, p_to_node, p_increment)
    ON CONFLICT (from_node, to_node)
    DO UPDATE SET weight = public.agent_transitions.weight + p_increment;
END;
$$;

-- Auditoría de governance (ya venía definida en pagerank_updates)
CREATE TABLE IF NOT EXISTS public.agent_governance_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    user_id UUID,
    context_id UUID REFERENCES public.agent_contexts(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.agent_governance_audit ENABLE ROW LEVEL SECURITY;
