-- 0007 · Cerrar exposición: RLS en las tablas del grafo PageRank
-- (advisory crítico de Supabase al aplicar 0001: quedaban expuestas a la
-- anon key). Internas del agente: acceso exclusivo vía service_role.
ALTER TABLE public.agent_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_node_ranks ENABLE ROW LEVEL SECURITY;
