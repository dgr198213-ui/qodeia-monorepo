// Contención de seguridad (P0-1): herramientas de Supabase desactivadas.
// Operaban con service_role y aceptaban tabla y filtros elegidos por el LLM.
// Se reintroducirán acotadas por usuario (P1-1). La implementación anterior está en el historial de git.
export const supabaseTools: Record<string, never> = {};
