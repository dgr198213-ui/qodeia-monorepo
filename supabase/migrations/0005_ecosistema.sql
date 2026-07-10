-- =============================================================
-- 0005 · Ecosistema Fase 3A: capa de conocimiento (Howard OS, ADR-3)
--        y credenciales de usuario server-side (ADR-4)
-- Tablas NUEVAS introducidas por el contrato IDE↔Agente.
-- =============================================================

-- Fuentes de conocimiento ingeridas vía POST /api/mcp/sync.
-- Materializa Howard OS como capa de datos (no como app separada).
CREATE TABLE IF NOT EXISTS public.kb_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server TEXT NOT NULL,
    file_path TEXT NOT NULL,
    content TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    user_id UUID,
    embedding_status TEXT DEFAULT 'pending'
        CHECK (embedding_status IN ('pending', 'processing', 'completed', 'failed')),
    synced_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (server, file_path)
);
CREATE INDEX IF NOT EXISTS idx_kb_sources_server ON public.kb_sources(server);

ALTER TABLE public.kb_sources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kb legible por autenticados" ON public.kb_sources;
CREATE POLICY "kb legible por autenticados"
ON public.kb_sources FOR SELECT TO authenticated USING (true);
-- Escritura solo vía backend (service-role).

-- Credenciales de integraciones POR USUARIO (sustituye al SecureStorage
-- de localStorage — GAP 4 / ADR-4). El valor se guarda cifrado por el
-- backend antes del INSERT; esta tabla nunca recibe texto plano desde
-- el cliente.
CREATE TABLE IF NOT EXISTS public.user_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    provider TEXT NOT NULL,          -- 'github' | 'vercel' | 'openai' | ...
    encrypted_value TEXT NOT NULL,   -- cifrado server-side, nunca plano
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, provider)
);

ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "credenciales solo del dueño" ON public.user_credentials;
-- El usuario puede ver que existen (provider, metadata) y borrarlas;
-- el valor cifrado solo lo descifra el backend.
CREATE POLICY "credenciales solo del dueño"
ON public.user_credentials FOR SELECT TO authenticated
USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "borrar credenciales propias" ON public.user_credentials;
CREATE POLICY "borrar credenciales propias"
ON public.user_credentials FOR DELETE TO authenticated
USING (auth.uid() = user_id);
