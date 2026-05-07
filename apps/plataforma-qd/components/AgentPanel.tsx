'use client';

import { useState } from 'react';
import { useAgent } from '@/hooks/useAgent';
import { useAgentSession } from '@/hooks/useAgentSession';

export function AgentPanel({ projectId }) {
  const { session } = useAgentSession({ projectId });
  const agent = useAgent({
    projectId,
    sessionId: session?.id || '',
  });

  const [goal, setGoal] = useState('');
  const [currentPlan, setCurrentPlan] = useState(null);

  const handleCreatePlan = async () => {
    const plan = await agent.createPlan(goal);
    if (plan) {
      setCurrentPlan(plan);
      setGoal('');
    }
  };

  const handleExecute = async (mode) => {
    if (!currentPlan) return;
    await agent.executePlan(currentPlan.plan_id, mode);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">¿Qué quieres hacer?</h2>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Describe tu objetivo..."
          className="w-full p-3 border rounded-lg h-24"
        />
        <button
          onClick={handleCreatePlan}
          disabled={!goal.trim() || agent.isLoading}
          className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          Crear Plan
        </button>
      </div>

      {currentPlan && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Plan Generado</h3>
          <div className="space-y-3">
            {currentPlan.steps.map((step, index) => (
              <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">{step.action}</p>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => handleExecute('dry-run')}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg"
            >
              Simular
            </button>
            <button
              onClick={() => handleExecute('apply')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg"
            >
              Ejecutar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
