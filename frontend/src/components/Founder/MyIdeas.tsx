// FILE: frontend/src/components/Founder/MyIdeas.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ideaAPI } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';

export default function MyIdeas() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['myIdeas'],
    queryFn: () => ideaAPI.getMyIdeas(),
  });

  const ideas = data?.data?.ideas || [];

  const submitMutation = useMutation({
    mutationFn: (id: string) => ideaAPI.submit(id),
    onSuccess: () => {
      addToast('Idea submitted for review!', 'success');
      queryClient.invalidateQueries({ queryKey: ['myIdeas'] });
      setSelectedIdea(null);
    },
    onError: (error: any) => {
      addToast(error.response?.data?.error || 'Failed to submit idea', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => ideaAPI.update(id, data),
    onSuccess: (response, variables) => {
      const updatedIdea = ideas.find((i: any) => i._id === variables.id);
      
      if (updatedIdea && ['submitted', 'under_review'].includes(updatedIdea.status)) {
        addToast('Idea updated! Admin and evaluators have been notified.', 'success');
      } else {
        addToast('Idea updated successfully!', 'success');
      }
      
      queryClient.invalidateQueries({ queryKey: ['myIdeas'] });
      setIsEditing(false);
      setEditFormData(null);
      setSelectedIdea(null);
    },
    onError: (error: any) => {
      addToast(error.response?.data?.error || 'Failed to update idea', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ideaAPI.delete(id),
    onSuccess: () => {
      addToast('Idea deleted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['myIdeas'] });
      setSelectedIdea(null);
    },
    onError: (error: any) => {
      addToast(error.response?.data?.error || 'Failed to delete idea', 'error');
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-700 text-gray-300',
      submitted: 'bg-blue-900 text-blue-300',
      under_review: 'bg-yellow-900 text-yellow-300',
      approved: 'bg-green-900 text-green-300',
      rejected: 'bg-red-900 text-red-300',
    };
    return colors[status] || 'bg-gray-700 text-gray-300';
  };

  const canEdit = (status: string) => ['draft', 'rejected', 'submitted', 'under_review'].includes(status);
  const canDelete = (status: string) => ['draft', 'rejected'].includes(status);

  const handleEdit = (idea: any) => {
    setEditFormData({
      title: idea.title,
      abstract: idea.abstract,
      problem: idea.problem,
      solution: idea.solution,
      team: idea.team,
    });
    setSelectedIdea(idea);
    setIsEditing(true);
  };

  const handleUpdate = () => {
    if (!selectedIdea) return;
    updateMutation.mutate({ id: selectedIdea._id, data: editFormData });
  };

  if (isLoading) {
    return (
      <div className="glass-morphism rounded-xl p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-morphism rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Your Ideas</h2>
          <span className="px-3 py-1 bg-orange-900/30 text-orange-300 rounded-full text-sm font-semibold">
            {ideas.length} total
          </span>
        </div>

        {ideas.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💡</div>
            <h3 className="text-xl font-bold text-white mb-2">No Ideas Yet</h3>
            <p className="text-gray-400">
              Start by submitting your first AI innovation idea!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {ideas.map((idea: any) => (
              <div
                key={idea._id}
                className="p-6 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-orange-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {idea.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {idea.abstract}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4 ${getStatusColor(
                      idea.status
                    )}`}
                  >
                    {idea.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span>📅 Created: {formatDate(idea.createdAt)}</span>
                  {idea.submittedAt && (
                    <span>✅ Submitted: {formatDate(idea.submittedAt)}</span>
                  )}
                  {idea.averageScore && (
                    <span className="text-orange-500 font-semibold">
                      ⭐ Score: {idea.averageScore}/10
                    </span>
                  )}
                  {idea.evaluationCount > 0 && (
                    <span>👥 {idea.evaluationCount} evaluations</span>
                  )}
                </div>

                {/* Evaluation Details */}
                {idea.evaluations && idea.evaluations.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-900/50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Evaluations:</h4>
                    {idea.evaluations.map((evaluation: any, idx: number) => (
                      <div key={idx} className="text-xs text-gray-400 mb-2 pb-2 border-b border-gray-700 last:border-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-white">👤 {evaluation.evaluatorName}</span>
                          <span className="text-orange-500 font-bold">⭐ {evaluation.averageScore}/10</span>
                        </div>
                        <p className="text-gray-400 italic">{evaluation.comments}</p>
                        <span className="text-gray-600 text-xs">
                          {formatDate(evaluation.submittedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {['submitted', 'under_review'].includes(idea.status) && (
                  <div className="mb-3 p-2 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                    <p className="text-xs text-yellow-300">
                      ⚠️ This idea is under review. Editing will notify admin and evaluators.
                    </p>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setSelectedIdea(idea);
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-gray-600 transition-all"
                  >
                    View Details
                  </button>

                  {canEdit(idea.status) && (
                    <button
                      onClick={() => handleEdit(idea)}
                      className="px-4 py-2 bg-blue-900/30 text-blue-300 rounded-lg text-sm font-semibold hover:bg-blue-900/50 transition-all"
                    >
                      Edit
                    </button>
                  )}

                  {idea.status === 'draft' && (
                    <button
                      onClick={() => submitMutation.mutate(idea._id)}
                      disabled={submitMutation.isPending}
                      className="px-4 py-2 gradient-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      Submit for Review
                    </button>
                  )}

                  {canDelete(idea.status) && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${idea.title}"? This action cannot be undone.`)) {
                          deleteMutation.mutate(idea._id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="px-4 py-2 bg-red-900/30 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-900/50 transition-all disabled:opacity-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View/Edit Modal - FIXED: Now properly displays all fields */}
      {selectedIdea && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-morphism rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      placeholder="Idea Title"
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-2xl font-bold mb-2"
                      maxLength={100}
                    />
                    {['submitted', 'under_review'].includes(selectedIdea.status) && (
                      <div className="mb-3 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                        <p className="text-sm text-yellow-300">
                          ⚠️ <strong>Note:</strong> This idea is currently under review. Saving changes will notify the admin and assigned evaluators.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedIdea.title}</h2>
                )}
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    selectedIdea.status
                  )}`}
                >
                  {selectedIdea.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedIdea(null);
                  setIsEditing(false);
                  setEditFormData(null);
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Abstract */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">ABSTRACT</h3>
                {isEditing ? (
                  <textarea
                    value={editFormData.abstract}
                    onChange={(e) => setEditFormData({ ...editFormData, abstract: e.target.value })}
                    placeholder="Enter abstract"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
                    rows={3}
                    maxLength={500}
                  />
                ) : (
                  <p className="text-white whitespace-pre-wrap">{selectedIdea.abstract}</p>
                )}
              </div>

              {/* Problem */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">PROBLEM</h3>
                {isEditing ? (
                  <textarea
                    value={editFormData.problem}
                    onChange={(e) => setEditFormData({ ...editFormData, problem: e.target.value })}
                    placeholder="Enter problem"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
                    rows={4}
                    maxLength={1000}
                  />
                ) : (
                  <p className="text-white whitespace-pre-wrap">{selectedIdea.problem}</p>
                )}
              </div>

              {/* Solution */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">SOLUTION</h3>
                {isEditing ? (
                  <textarea
                    value={editFormData.solution}
                    onChange={(e) => setEditFormData({ ...editFormData, solution: e.target.value })}
                    placeholder="Enter solution"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
                    rows={4}
                    maxLength={1000}
                  />
                ) : (
                  <p className="text-white whitespace-pre-wrap">{selectedIdea.solution}</p>
                )}
              </div>

              {/* Team */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">TEAM</h3>
                {isEditing ? (
                  <textarea
                    value={editFormData.team}
                    onChange={(e) => setEditFormData({ ...editFormData, team: e.target.value })}
                    placeholder="Enter team details"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
                    rows={3}
                    maxLength={500}
                  />
                ) : (
                  <p className="text-white whitespace-pre-wrap">{selectedIdea.team}</p>
                )}
              </div>

              {/* Scores */}
              {selectedIdea.averageScore && (
                <div className="p-4 gradient-dark rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-white">Overall Score</span>
                    <span className="text-3xl font-bold text-orange-500">
                      {selectedIdea.averageScore}/10
                    </span>
                  </div>
                  {selectedIdea.evaluationCount > 0 && (
                    <p className="text-sm text-gray-400 mt-2">
                      Based on {selectedIdea.evaluationCount} evaluation(s)
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditFormData(null);
                    }}
                    className="flex-1 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={updateMutation.isPending}
                    className="flex-1 py-3 gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setSelectedIdea(null);
                    setIsEditing(false);
                  }}
                  className="flex-1 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}