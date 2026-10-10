import { describe, expect, it, vi } from 'vitest';

const { mockSupabaseProcessRequest } = vi.hoisted(() => ({
  mockSupabaseProcessRequest: vi.fn(),
}));

vi.mock('./MultiLLMConfig', () => ({
  createLLMClient: vi.fn(),
  SPECIALIST_CONFIGS: {},
}));

vi.mock('../specialists/GitHubSpecialist', () => ({ createGitHubSpecialist: vi.fn() }));
vi.mock('../specialists/SupabaseSpecialist', () => ({ createSupabaseSpecialist: vi.fn() }));
vi.mock('../specialists/VercelSpecialist', () => ({ createVercelSpecialist: vi.fn() }));
vi.mock('../specialists/MCPSpecialist', () => ({ createMCPSpecialist: vi.fn() }));
vi.mock('../specialists/LogicSpecialist', () => ({ createLogicSpecialist: vi.fn() }));
vi.mock('../specialists/ProValidator', () => ({ createProValidator: vi.fn() }));
vi.mock('../specialists/MolbotSpecialist', () => ({ createMolbotSpecialist: vi.fn() }));
vi.mock('../specialists/NoCodeSpecialist', () => ({ createNoCodeSpecialist: vi.fn() }));

import { CEOOrchestrator, isSpecialistDisabled } from './CEOOrchestrator';

describe('contención P0 del CEOOrchestrator', () => {
  it("marca 'supabase' como especialista desactivado", () => {
    expect(isSpecialistDisabled('supabase')).toBe(true);
  });

  it('no llama al especialista Supabase para una tarea delegada desactivada', async () => {
    const orchestrator = new CEOOrchestrator();
    (orchestrator as any).specialists = {
      supabase: { processRequest: mockSupabaseProcessRequest },
    };

    const results = await (orchestrator as any).executeDelegatedTasks([
      { specialist: 'supabase', task: 'Eliminar cualquier registro' },
    ]);

    expect(mockSupabaseProcessRequest).not.toHaveBeenCalled();
    expect(results).toEqual([
      {
        specialist: 'supabase',
        task: 'Eliminar cualquier registro',
        result: 'Especialista desactivado temporalmente por contención de seguridad',
        executionTime: 0,
      },
    ]);
  });
});
