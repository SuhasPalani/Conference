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
  const [useAutoAssign, setUseAutoAssign] = useState(false);

  const { data: ideasData } = useQuery({
    queryKey: ['adminIdeas'],
    queryFn: () => adminAPI.getIdeas({ status: 'submitted' }),
  });

  const { data: usersData } = useQuery({
    queryKey: ['adminUsers', 'evaluator'],
    queryFn: () => adminAPI.getUsers({ role: 'evaluator' }),
  });

  const { data: workloadData } = useQuery({
    queryKey: ['evaluatorWorkload'],
    queryFn: async () => {
      const response = await fetch('/api/admin/evaluators/workload', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const ideas = ideasData?.data?.ideas || [];
  const evaluators = usersData?.data?.users || [];
  const workload = workloadData?.workload || [];

  const assignMutation = useMutation({
    mutationFn: ({ ideaId, evaluatorIds, autoAssign }: { ideaId: string; evaluatorIds?: string[]; autoAssign?: boolean }) =>
      adminAPI.assignEvaluators(ideaId, evaluatorIds || [], autoAssign),
    onSuccess: () => {
      addToast('Evaluators assigned successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['adminIdeas'] });
      queryClient.invalidateQueries({ queryKey: ['evaluatorWorkload'] });
      setSelectedIdeaId('');
      setSelectedEvaluators([]);
      setUseAutoAssign(false);
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
    if (!selectedIdeaId) {
      addToast('Please select an idea', 'warning');
      return;
    }

    if (useAutoAssign) {
      assignMutation.mutate({ ideaId: selectedIdeaId, autoAssign: true });
    } else {
      if (selectedEvaluators.length === 0) {
        addToast('Please select at least one evaluator', 'warning');
        return;
      }
      assignMutation.mutate({ ideaId: selectedIdeaId, evaluatorIds: selectedEvaluators });
    }
  };

  return (
    <div className="space-y-6">
      {/* Evaluator Workload Dashboard */}
      <div className="glass-morphism rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Evaluator Workload (Queue System)</h2>
        <p className="text-gray-400 mb-6">
          Each evaluator can handle maximum 3 pending evaluations at a time
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workload.map((evaluator: any) => (
            <div
              key={evaluator.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                evaluator.available
                  ? 'bg-green-900/20 border-green-700'
                  : 'bg-red-900/20 border-red-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white">{evaluator.name}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    evaluator.available
                      ? 'bg-green-900 text-green-300'
                      : 'bg-red-900 text-red-300'
                  }`}
                >
                  {evaluator.available ? 'Available' : 'At Capacity'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Pending:</span>
                  <span className="text-yellow-400 font-bold">{evaluator.pending}/3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Completed:</span>
                  <span className="text-green-400 font-bold">{evaluator.completed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total:</span>
                  <span className="text-white font-bold">{evaluator.total}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      evaluator.pending === 0
                        ? 'bg-green-500'
                        : evaluator.pending < 3
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${(evaluator.pending / 3) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {workload.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No evaluators available. Please assign evaluator role to users first.
          </p>
        )}
      </div>

      {/* Assignment Interface */}
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

        {/* Auto-Assign Toggle */}
        {selectedIdeaId && (
          <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useAutoAssign}
                onChange={(e) => setUseAutoAssign(e.target.checked)}
                className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-orange-500 focus:ring-orange-500 focus:ring-offset-0"
              />
              <div className="ml-3">
                <span className="text-white font-semibold">🤖 Auto-Assign (Recommended)</span>
                <p className="text-xs text-gray-400 mt-1">
                  Automatically assigns to the evaluator with the least workload using queue system
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Manual Selection */}
        {selectedIdeaId && !useAutoAssign && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Select Evaluators ({selectedEvaluators.length} selected)
            </label>
            <div className="grid md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {evaluators.map((evaluator: any) => {
                const evaluatorWorkload = workload.find((w: any) => w.id === evaluator._id);
                const isAvailable = evaluatorWorkload?.available || false;
                const pendingCount = evaluatorWorkload?.pending || 0;

                return (
                  <label
                    key={evaluator._id}
                    className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors border ${
                      isAvailable
                        ? 'bg-gray-800/50 hover:bg-gray-800 border-gray-700'
                        : 'bg-red-900/20 border-red-900 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEvaluators.includes(evaluator._id)}
                      onChange={() => toggleEvaluator(evaluator._id)}
                      disabled={!isAvailable}
                      className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-orange-500 focus:ring-orange-500 focus:ring-offset-0 disabled:opacity-50"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-white font-semibold">{evaluator.fullName}</div>
                        <span className={`text-xs font-semibold ${
                          isAvailable ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {pendingCount}/3
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">{evaluator.email}</div>
                      {!isAvailable && (
                        <div className="text-xs text-red-400 mt-1">At maximum capacity</div>
                      )}
                    </div>
                  </label>
                );
              })}
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
              disabled={assignMutation.isPending || (!useAutoAssign && selectedEvaluators.length === 0)}
              className="w-full py-3 gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {assignMutation.isPending 
                ? 'Assigning...' 
                : useAutoAssign 
                  ? '🤖 Auto-Assign Evaluator' 
                  : 'Assign Selected Evaluators'}
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