// FILE: frontend/src/components/Admin/RoleAssignment.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/api';
import { useToast } from '@/hooks/useToast';

export default function RoleAssignment() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [selectedIdeaId, setSelectedIdeaId] = useState('');
  const [selectedEvaluators, setSelectedEvaluators] = useState<string[]>([]);

  const { data: ideasData } = useQuery({
    queryKey: ['adminIdeas'],
    queryFn: () => adminAPI.getIdeas({ status: 'submitted' }),
  });

  const { data: usersData } = useQuery({
    queryKey: ['adminUsers', 'evaluator'],
    queryFn: () => adminAPI.getUsers({ role: 'evaluator' }),
  });

  const ideas = ideasData?.data?.ideas || [];
  const evaluators = usersData?.data?.users || [];

  const assignMutation = useMutation({
    mutationFn: ({ ideaId, evaluatorIds }: { ideaId: string; evaluatorIds: string[] }) =>
      adminAPI.assignEvaluators(ideaId, evaluatorIds),
    onSuccess: () => {
      addToast('Evaluators assigned successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['adminIdeas'] });
      setSelectedIdeaId('');
      setSelectedEvaluators([]);
    },
    onError: (error: any) => {
      addToast(error.response?.data?.error || 'Failed to assign evaluators', 'error');
    },
  });

  const toggleEvaluator = (evaluatorId: string) => {
    setSelectedEvaluators(prev =>
      prev.includes(evaluatorId)
        ? prev.filter(id => id !== evaluatorId)
        : [...prev, evaluatorId]
    );
  };

  const handleAssign = () => {
    if (!selectedIdeaId || selectedEvaluators.length === 0) {
      addToast('Please select an idea and at least one evaluator', 'warning');
      return;
    }
    assignMutation.mutate({ ideaId: selectedIdeaId, evaluatorIds: selectedEvaluators });
  };

  return (
    <div className="space-y-6">
      <div className="glass-morphism rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Assign Evaluators to Ideas</h2>

        {/* Select Idea */}
        <div className="mb-6">
          <label htmlFor="select-idea" className="block text-sm font-medium text-gray-300 mb-2">
            Select Idea to Assign
          </label>
          <select
            id="select-idea"
            value={selectedIdeaId}
            onChange={(e) => {
              setSelectedIdeaId(e.target.value);
              const idea = ideas.find((i: any) => i._id === e.target.value);
              if (idea) {
                setSelectedEvaluators(idea.assignedEvaluators?.map((e: any) => e._id) || []);
              }
            }}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
          >
            <option value="">-- Select an Idea --</option>
            {ideas.map((idea: any) => (
              <option key={idea._id} value={idea._id}>
                {idea.title} ({idea.assignedEvaluators?.length || 0} evaluators)
              </option>
            ))}
          </select>
        </div>

        {/* Select Evaluators */}
        {selectedIdeaId && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Select Evaluators ({selectedEvaluators.length} selected)
            </label>
            <div className="grid md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {evaluators.map((evaluator: any) => (
                <label
                  key={evaluator._id}
                  className="flex items-center p-4 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors border border-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedEvaluators.includes(evaluator._id)}
                    onChange={() => toggleEvaluator(evaluator._id)}
                    className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-orange-500 focus:ring-orange-500 focus:ring-offset-0"
                  />
                  <div className="ml-3 flex-1">
                    <div className="text-white font-semibold">{evaluator.fullName}</div>
                    <div className="text-xs text-gray-400">{evaluator.email}</div>
                  </div>
                </label>
              ))}
            </div>

            {evaluators.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No evaluators available. Please assign evaluator role to users first.
              </p>
            )}
          </div>
        )}

        {/* Assign Button */}
        {selectedIdeaId && (
          <div className="mt-6">
            <button
              onClick={handleAssign}
              disabled={assignMutation.isPending || selectedEvaluators.length === 0}
              className="w-full py-3 gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {assignMutation.isPending ? 'Assigning...' : 'Assign Evaluators'}
            </button>
          </div>
        )}
      </div>

      {/* Current Assignments */}
      <div className="glass-morphism rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recent Assignments</h3>
        <div className="space-y-3">
          {ideas.slice(0, 5).map((idea: any) => (
            <div
              key={idea._id}
              className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
            >
              <h4 className="text-white font-semibold mb-2">{idea.title}</h4>
              <div className="flex items-center gap-2 flex-wrap">
                {idea.assignedEvaluators?.length > 0 ? (
                  idea.assignedEvaluators.map((evaluator: any) => (
                    <span
                      key={evaluator._id}
                      className="px-2 py-1 bg-orange-900/30 text-orange-300 rounded text-xs font-semibold"
                    >
                      {evaluator.fullName}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No evaluators assigned</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}